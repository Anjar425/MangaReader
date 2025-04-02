import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

interface ArchiveInfo {
  archivePath: string;
  archiveName: string;
  pageSize: number;
}

const getArchivesInMangaFolder = (basePath: string, folderPath: string): ArchiveInfo[] => {
  const mangaFolderPath = path.join(basePath, folderPath);
  if (!fs.existsSync(mangaFolderPath)) {
    console.error("Manga folder not found:", mangaFolderPath);
    return [];
  }

  const archives = fs
    .readdirSync(mangaFolderPath)
    .filter((file) => file.toLowerCase().endsWith(".zip") || file.toLowerCase().endsWith(".cbz"))
    .map((file) => {
      const fullPath = path.join(mangaFolderPath, file);
      let fileCount = 0;

      try {
        const zip = new AdmZip(fullPath);
        fileCount = zip.getEntries().length;
      } catch (error) {
        console.error("Failed to read archive:", fullPath, error);
      }

      return {
        archivePath: fullPath,
        archiveName: path.basename(file, path.extname(file)),
        pageSize: fileCount,
      };
    });

  return archives;
};

export { getArchivesInMangaFolder };
