import Database from 'better-sqlite3';

const getMangaDetails = (dbPath: string, mangaId: number) => {
    const db = new Database(dbPath);
    db.exec('PRAGMA foreign_keys = ON;');

    const mangaQuery = db.prepare(`
        SELECT 
            MANGA.Name AS Name,
            MANGA.Cover AS Cover,
            MANGA.Penciller AS Penciller,
            MANGA.Writer AS Writer,
            MANGA.Summary AS Summary,
            MANGA.Favorited As Favorited
        FROM MANGA
        WHERE MANGA.ID = ?;
    `);

    const genresQuery = db.prepare(`
        SELECT GENRE.Name AS genre_name
        FROM GENRE
        JOIN MANGA_GENRE ON GENRE.ID = MANGA_GENRE.ID_Genre
        WHERE MANGA_GENRE.ID_Manga = ?;
    `);

    const chaptersQuery = db.prepare(`
        SELECT 
            Chapter_Index AS "Index",
            Name AS Name, 
            File_Path AS Path,
            Page_Size as Size
        FROM CHAPTER
        WHERE ID_Manga = ?;
    `);

    const manga = mangaQuery.get(mangaId);
    const genres = (genresQuery.all(mangaId) as { genre_name: string }[]).map(row => row.genre_name);
    const chapters = chaptersQuery.all(mangaId);

    return {
        ...(typeof manga === "object" && manga !== null ? manga : {}),
        Genres: genres,
        ChapterList: chapters
    };
};

const setMangaFavorited = (dbPath: string, mangaId: number, isFavorited: boolean) => {
    const db = new Database(dbPath);
    db.exec('PRAGMA foreign_keys = ON;');

    const stmt = db.prepare(`UPDATE MANGA SET Favorited = ? WHERE ID = ?`);
    const result = stmt.run(isFavorited ? 1 : 0, mangaId);

    db.close();

    return {
        success: result.changes > 0,
        affectedRows: result.changes
    };
};


export { getMangaDetails, setMangaFavorited };
