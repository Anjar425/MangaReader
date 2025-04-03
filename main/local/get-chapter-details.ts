import Database from 'better-sqlite3';

function getChapterDetails(dbPath: string, mangaId: number, chapterIndex: number) {
    const db = new Database(dbPath);

    const query = db.prepare(`
        WITH TotalChapters AS (
            SELECT ID_Manga, COUNT(*) AS all_chapter 
            FROM CHAPTER 
            GROUP BY ID_Manga
        )
        SELECT 
            c."Index" AS chapter_index,
            m.Name AS manga_name,
            c.Name AS chapter_name,
            c.File_Path AS file_path,
            t.all_chapter,
            (c."Index" < t.all_chapter) AS nextChapter,
            (c."Index" > 1) AS prevChapter
        FROM CHAPTER c
        JOIN MANGA m ON c.ID_Manga = m.ID
        JOIN TotalChapters t ON c.ID_Manga = t.ID_Manga
        WHERE c.ID_Manga = ? AND c."Index" = ?;
    `);

    const chapterDetails = query.get(mangaId, chapterIndex);

    // Query untuk mendapatkan daftar semua chapter dalam manga
    const allChaptersQuery = db.prepare(`
        SELECT 
            "Index" AS chapter_index, 
            Name AS chapter_name
        FROM CHAPTER
        WHERE ID_Manga = ?
        ORDER BY "Index" ASC;
    `);

    const allChapters = allChaptersQuery.all(mangaId);

    db.close();

    return { ...chapterDetails, all_chapters: allChapters };
}

export { getChapterDetails };
