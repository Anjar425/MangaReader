import Database from 'better-sqlite3';

function getChapterDetails(dbPath: string, mangaId: number, chapterIndex: number) {
    const db = new Database(dbPath);

    const query = db.prepare(`
        SELECT 
            c.Chapter_Index AS "Index",
            m.Name AS MangaName,
            c.Name AS ChapterName,
            c.File_Path AS ChapterPath
        FROM CHAPTER c
        JOIN MANGA m ON c.ID_Manga = m.ID
        WHERE c.ID_Manga = ? AND c.Chapter_Index = ?;
    `);

    const chapterDetails = query.get(mangaId, chapterIndex);

    // Query untuk mendapatkan daftar semua chapter dalam manga
    const chapterListQuery = db.prepare(`
        SELECT 
            Chapter_Index AS "Index", 
            Name AS Name,
            File_Path AS Path,
            Page_Size as Size
        FROM CHAPTER
        WHERE ID_Manga = ?
        ORDER BY Chapter_Index ASC;
    `);

    const chapterList = chapterListQuery.all(mangaId);

    db.close();

    return {
        ...(typeof chapterDetails === "object" && chapterDetails !== null ? chapterDetails : {}),
        ChapterList: chapterList
    };
}

export { getChapterDetails };
