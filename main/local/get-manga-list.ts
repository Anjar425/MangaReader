import fs from "fs"
import path from "path"

interface Manga {
  title: string
  cover: string
  folderPath: string
  archiveCount: number
}

const getMangaList = (parentDir: string): Manga[] => {
  const mangaList: Manga[] = []

  // Get all folders in parentDir
  const folders = fs
    .readdirSync(parentDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory()) // Only folders
    .map((dirent) => dirent.name)

  folders.forEach((folder) => {
    const folderPath = path.join(parentDir, folder)
    const subItems = fs.readdirSync(folderPath, { withFileTypes: true })

    // Check if there are subfolders, if yes, skip this folder
    const hasSubFolder = subItems.some((item) => item.isDirectory())
    if (hasSubFolder) return

    // Look for cover file in the folder
    const coverFile = subItems.find((item) => item.isFile() && item.name.toLowerCase().startsWith("cover"))
    if (!coverFile) return

    const coverPath = path.join(folderPath, coverFile.name)

    // Count total CBZ and ZIP files
    const archiveCount = subItems.filter((item) =>
      item.isFile() && (item.name.toLowerCase().endsWith(".cbz") || item.name.toLowerCase().endsWith(".zip"))
    ).length

    // Make sure the file actually exists before adding to the list
    if (fs.existsSync(coverPath)) {
      mangaList.push({
        title: folder,
        cover: `http://localhost:3001/manga/${folder}/${coverFile.name}`,
        folderPath: folder,
        archiveCount
      })
    }
  })

  return mangaList
}

export { getMangaList }
