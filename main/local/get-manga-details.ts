import Database from 'better-sqlite3';

const getMangaDetails = (dbPath: string, mangaId: number) => {
    const db = new Database(dbPath);
    db.exec('PRAGMA foreign_keys = ON;');

    const mangaQuery = db.prepare(`
        SELECT 
            MANGA.Name AS manga_name,
            MANGA.Cover AS manga_cover,
            MANGA.Penciller AS manga_penciller,
            MANGA.Writer AS manga_writer,
            MANGA.Summary AS manga_summary,
            MANGA.Favorited As manga_favorited
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
            Name AS chapter_name, 
            File_Path AS chapter_path,
            Chapter_Index AS chapter_index,
            Page_Size as chapter_size
        FROM CHAPTER
        WHERE ID_Manga = ?;
    `);

    const manga = mangaQuery.get(mangaId);
    const genres = (genresQuery.all(mangaId) as { genre_name: string }[]).map(row => row.genre_name);
    const chapters = chaptersQuery.all(mangaId);

    return {
        ...(typeof manga === "object" && manga !== null ? manga : {}),
        genres,
        chapters
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
