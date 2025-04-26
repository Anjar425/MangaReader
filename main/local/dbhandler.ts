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
                if (/\.(jpg|jpeg|png|webp|gif|avif|jpe)$/i.test(entry.fileName)) {
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
    try {
        const db = new Database(dbPath);
    db.exec('PRAGMA foreign_keys = ON;');

    // Inisialisasi tabel jika belum ada
    db.exec(`
        CREATE TABLE IF NOT EXISTS BASEFOLDER (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Path TEXT NOT NULL,
            Last_Scan TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS MANGA (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT NOT NULL,
            Cover TEXT,
            Summary TEXT,
            Penciller TEXT,
            Writer TEXT,
            Favorited INTEGER NOT NULL DEFAULT 0,
            Last_Modified TEXT NOT NULL,
            ID_BaseFolder TEXT NOT NULL,
            FOREIGN KEY(ID_BaseFolder) REFERENCES BASEFOLDER(ID) ON DELETE CASCADE
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
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            ID_Manga INTEGER NOT NULL,
            Name TEXT NOT NULL,
            Date_Added TEXT,
            Last_Open TEXT,
            Last_Page INTEGER,
            File_Path TEXT NOT NULL,
            Chapter_Index INTEGER,
            Page_Size INTEGER,
            FOREIGN KEY(ID_Manga) REFERENCES MANGA(ID) ON DELETE CASCADE
        );
    `);

    // Cek apakah BASEFOLDER sudah ada
    const baseFolder = db.prepare('SELECT ID FROM BASEFOLDER WHERE Path = ?').get(MANGA_DIR) as { ID: number };
    let baseFolderId: number;

    if (!baseFolder) {
        // Jika belum ada, insert baru
        const lastScan = new Date().toISOString();
        const result = db.prepare('INSERT INTO BASEFOLDER (Path, Last_Scan) VALUES (?, ?)').run(MANGA_DIR, lastScan);
        baseFolderId = result.lastInsertRowid as number;
    } else {
        baseFolderId = baseFolder.ID;
    }

    const mangaFolders = fs.readdirSync(MANGA_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => path.join(MANGA_DIR, dirent.name));

    for (const folderPath of mangaFolders) {
        const mangaName = path.basename(folderPath);
        const lastModified = fs.statSync(folderPath).mtime.toISOString();
        const comicInfoPath = path.join(folderPath, 'ComicInfo.xml');

        let mangaData = {
            name: mangaName,
            cover: '',
            summary: '',
            penciller: '',
            writer: '',
            genres: [] as string[],
            last_modified: lastModified
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
            .find(file => file.match(/\.(jpg|jpeg|png|webp|jpe|avif)$/i));
        if (coverFile) {
            const relativePath = path.relative(MANGA_DIR, path.join(folderPath, coverFile));
            const encodedPath = relativePath.split('/').map(encodeURIComponent).join('/');

            // Ganti "local/" dengan "manga/" di awal path
            mangaData.cover = `http://localhost:3001/manga/${encodedPath}`;
        }

        // Tambahkan manga ke database jika belum ada
        const checkManga = db.prepare('SELECT ID FROM MANGA WHERE Name = ?').get(mangaData.name) as {ID: number};
        let mangaId = checkManga?.ID;
        if (!mangaId) {
            const insertManga = db.prepare('INSERT INTO MANGA (Name, Cover, Summary, Penciller, Writer, Favorited, Last_Modified, ID_BaseFolder) VALUES (?, ?, ?, ?, ?, 0, ?, ?)');
            const result = insertManga.run(mangaData.name, mangaData.cover, mangaData.summary, mangaData.penciller, mangaData.writer, mangaData.last_modified, baseFolderId);
            mangaId = result.lastInsertRowid as number;
        }

        // Tambahkan genre jika belum ada
        for (const genre of mangaData.genres) {
            let genreId = (db.prepare('SELECT ID FROM GENRE WHERE Name = ?').get(genre) as {ID: number})?.ID;
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
            const lastIndex = (db.prepare('SELECT MAX(Chapter_Index) AS lastIndex FROM CHAPTER WHERE ID_Manga = ?').get(mangaId) as {lastIndex: number})?.lastIndex || 0;
            const newIndex = lastIndex + 1; // Tambah index baru

            // Cek apakah chapter sudah ada berdasarkan path
            const checkChapter = db.prepare('SELECT ID FROM CHAPTER WHERE File_Path = ?').get(filePath);
            if (!checkChapter) {
                db.prepare('INSERT INTO CHAPTER (ID_Manga, Name, Date_Added, File_Path, Chapter_Index, Page_Size) VALUES (?, ?, ?, ?, ?, ?)')
                    .run(mangaId, chapterName, dateAdded, filePath, newIndex, pageSize);
            }
        }
    }

    db.close();
    } catch (error) {
        console.log(error)
    }
    
};

export { scanMangaDirectory };
