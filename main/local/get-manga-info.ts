import fs from "fs"
import path from "path"
import { parseStringPromise } from "xml2js"

interface MangaInfo {
  title: string
  cover: string
  series: string
  summary: string
  penciller: string
  writer: string
  genre: string
}

interface ComicInfoXml {
  ComicInfo: {
    Title?: string
    Cover?: string
    Series?: string
    Summary?: string
    Penciller?: string
    Writer?: string
    Genre?: string
  }
}

const getMangaInfo = async (basepath: string, folderPath: string): Promise<MangaInfo | null> => {
  try {
    const xmlPath = path.join(basepath, folderPath, "ComicInfo.xml")

    const dirPath = path.join(basepath, folderPath);
    const subItems = fs.readdirSync(dirPath, { withFileTypes: true });

    const coverFile = subItems.find(item => item.isFile() && item.name.toLowerCase().startsWith('cover'));

    if (!fs.existsSync(xmlPath)) {
      return {
        title:  "Unknown Title",
        cover: `http://localhost:3001/manga/${folderPath}/${coverFile.name}` || "No Cover Found",
        series:  folderPath || "Unknown Series",
        summary: "No summary available.",
        penciller: "Unknown",
        writer: "Unknown",
        genre: "Unknown",
      }
    }

    const xmlData = fs.readFileSync(xmlPath, "utf-8")
    const jsonData = (await parseStringPromise(xmlData, { explicitArray: false })) as ComicInfoXml

    return {
      title: jsonData.ComicInfo.Title || "Unknown Title",
      cover: `http://localhost:3001/manga/${folderPath}/${coverFile.name}` || "No Cover Found",
      series: jsonData.ComicInfo.Series  || folderPath ,
      summary: jsonData.ComicInfo.Summary || "No summary available.",
      penciller: jsonData.ComicInfo.Penciller || "Unknown",
      writer: jsonData.ComicInfo.Writer || "Unknown",
      genre: jsonData.ComicInfo.Genre || "Unknown",
    }
  } catch (error) {
    console.error("Error reading ComicInfo.xml:", error)
    return null
  }
}

export { getMangaInfo }

