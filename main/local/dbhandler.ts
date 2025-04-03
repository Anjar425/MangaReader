import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import xml2js from 'xml2js';
import yauzl from 'yauzl';

// Helper untuk membaca XML secara async
const parseXML = async (filePath: string) => {
    const xmlData = fs.readFileSync(filePath, 'utf-8');
    return xml2js.parseStringPromise(xmlData, { explicitArray: false });
};

const countImagesInZip = (filePath: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        let count = 0;
        yauzl.open(filePath, { lazyEntries: true }, (err, zipfile) => {
            if (err) return reject(err);
            zipfile.readEntry();
            zipfile.on('entry', (entry) => {
                if (/\.(jpg|jpeg|png|webp|gif)$/i.test(entry.fileName)) {
                    count++;
                }
                zipfile.readEntry();
            });
            zipfile.on('end', () => resolve(count));
            zipfile.on('error', reject);
        });
    });
};


const scanMangaDirectory = async (dbPath: string, MANGA_DIR: string) => {
    const db = new Database(dbPath);
    db.exec('PRAGMA foreign_keys = ON;');

    // Inisialisasi tabel jika belum ada
    db.exec(`
        CREATE TABLE IF NOT EXISTS MANGA (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT NOT NULL,
            Cover TEXT,
            Summary TEXT,
            Penciller TEXT,
            Writer TEXT,
            Favorited INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS GENRE (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT UNIQUE
        );
        CREATE TABLE IF NOT EXISTS MANGA_GENRE (
            ID_Manga INTEGER NOT NULL,
            ID_Genre INTEGER NOT NULL,
            PRIMARY KEY(ID_Manga, ID_Genre),
            FOREIGN KEY(ID_Manga) REFERENCES MANGA(ID) ON DELETE CASCADE,
            FOREIGN KEY(ID_Genre) REFERENCES GENRE(ID) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS "CHAPTER" (
            "ID"	INTEGER,
            "ID_Manga"	INTEGER NOT NULL,
            "Name"	TEXT NOT NULL,
            "Date_Added"	TEXT,
            "Last_Open"	TEXT,
            "Last_Page"	INTEGER,
            "File_Path"	TEXT NOT NULL,
            "Index"	INTEGER,
            "Page_Size" INTEGER,
            PRIMARY KEY("ID" AUTOINCREMENT),
            FOREIGN KEY("ID_Manga") REFERENCES "MANGA"("ID") ON DELETE CASCADE
        );
    `);

    const mangaFolders = fs.readdirSync(MANGA_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => path.join(MANGA_DIR, dirent.name));

    for (const folderPath of mangaFolders) {
        const mangaName = path.basename(folderPath);
        const comicInfoPath = path.join(folderPath, 'ComicInfo.xml');

        let mangaData = {
            name: mangaName,
            cover: '',
            summary: '',
            penciller: '',
            writer: '',
            genres: [] as string[]
        };

        if (fs.existsSync(comicInfoPath)) {
            try {
                const result = await parseXML(comicInfoPath);
                if (result.ComicInfo) {
                    const info = result.ComicInfo;
                    mangaData.name = info.Series || mangaName;
                    mangaData.summary = info.Summary || 'No summary available.';
                    mangaData.penciller = info.Penciller || 'Unknown';
                    mangaData.writer = info.Writer || 'Unknown';
                    mangaData.genres = info.Genre?.split(',').map(g => g.trim()) || ['Unknown'];
                }
            } catch (error) {
                console.error(`Gagal membaca ComicInfo.xml di ${comicInfoPath}:`, error);
            }
        } else {
            mangaData.name = mangaName;
            mangaData.summary = 'Unknown';
            mangaData.penciller = 'Unknown';
            mangaData.writer = 'Unknown';
            mangaData.genres = ['Unknown'];
        }

        // Cari cover dengan ekstensi gambar umum
        const coverFile = fs.readdirSync(folderPath)
            .find(file => file.match(/\.(jpg|jpeg|png|webp)$/i));
        if (coverFile) {
            const relativePath = path.relative('F:/Manga', path.join(folderPath, coverFile)).replace(/\\/g, '/');
            const encodedPath = relativePath.split('/').map(encodeURIComponent).join('/');

            // Ganti "local/" dengan "manga/" di awal path
            mangaData.cover = `http://localhost:3001/${encodedPath.replace(/^local\//, 'manga/')}`;
        }

        // Tambahkan manga ke database jika belum ada
        const checkManga = db.prepare('SELECT ID FROM MANGA WHERE Name = ?').get(mangaData.name);
        let mangaId = checkManga?.ID;
        if (!mangaId) {
            const insertManga = db.prepare('INSERT INTO MANGA (Name, Cover, Summary, Penciller, Writer, Favorited) VALUES (?, ?, ?, ?, ?, 0)');
            const result = insertManga.run(mangaData.name, mangaData.cover, mangaData.summary, mangaData.penciller, mangaData.writer);
            mangaId = result.lastInsertRowid as number;
        }

        // Tambahkan genre jika belum ada
        for (const genre of mangaData.genres) {
            let genreId = db.prepare('SELECT ID FROM GENRE WHERE Name = ?').get(genre)?.ID;
            if (!genreId) {
                const insertGenre = db.prepare('INSERT INTO GENRE (Name) VALUES (?)');
                genreId = insertGenre.run(genre).lastInsertRowid as number;
            }

            // Hubungkan manga dengan genre
            db.prepare('INSERT OR IGNORE INTO MANGA_GENRE (ID_Manga, ID_Genre) VALUES (?, ?)').run(mangaId, genreId);
        }

        const chapterFiles = fs.readdirSync(folderPath)
            .filter(file => file.match(/\.(zip|cbz)$/i))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })); // Urutan berdasarkan angka

        for (const chapterFile of chapterFiles) {
            const filePath = path.join(folderPath, chapterFile);
            const dateAdded = fs.statSync(filePath).mtime.toISOString();

            // Hapus ekstensi dari nama file
            const chapterName = path.basename(chapterFile, path.extname(chapterFile));

            // Hitung jumlah halaman dalam file CBZ/ZIP
            const pageSize = await countImagesInZip(filePath);

            // Ambil index terakhir untuk manga ini
            const lastIndex = db.prepare('SELECT MAX("Index") AS lastIndex FROM CHAPTER WHERE ID_Manga = ?').get(mangaId)?.lastIndex || 0;
            const newIndex = lastIndex + 1; // Tambah index baru

            // Cek apakah chapter sudah ada berdasarkan path
            const checkChapter = db.prepare('SELECT ID FROM CHAPTER WHERE File_Path = ?').get(filePath);
            if (!checkChapter) {
                db.prepare('INSERT INTO CHAPTER (ID_Manga, Name, Date_Added, File_Path, "Index", "Page_Size") VALUES (?, ?, ?, ?, ?, ?)')
                    .run(mangaId, chapterName, dateAdded, filePath, newIndex, pageSize);
            }
        }
    }

    db.close();
    console.log('📁 Scan manga selesai!');
};

export { scanMangaDirectory };
