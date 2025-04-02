import path from "path"
import { app, ipcMain, dialog, type BrowserWindow, type IpcMainInvokeEvent } from "electron"
import serve from "electron-serve"
import { createWindow } from "./helpers"
import { getMangaList } from "./local/get-manga-list"
import { getMangaInfo } from "./local/get-manga-info"
import express from "express"
import { getArchivesInMangaFolder } from "./local/get-archive-chapter"
import { getAllArchiveTitleById, getImagesFromArchive, getMaxId } from "./local/get-image-from-archive"

const expressApp = express()
const PORT = 3001
let localPort = "F:/Manga/local"

const setLocalPort = (newPath: string): void => {
  localPort = newPath
  // console.log(`Local port set to: ${localPort}`);
}

const isProd: boolean = process.env.NODE_ENV === "production"

if (isProd) {
  serve({ directory: "app" })
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`)
}
;(async () => {
  await app.whenReady()

  const mainWindow: BrowserWindow = createWindow("main", {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  })

  if (isProd) {
    await mainWindow.loadURL("app://./")
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/`)
    mainWindow.webContents.openDevTools()
  }
})()

app.on("window-all-closed", () => {
  app.quit()
})

ipcMain.on("message", async (event, arg) => {
  event.reply("message", `${arg} World!`)
})

interface LocalPortResult {
  success: boolean
  localPort: string
}

ipcMain.handle("set-local-port", async (event: IpcMainInvokeEvent): Promise<LocalPortResult> => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  })

  if (!result.canceled && result.filePaths.length > 0) {
    setLocalPort(result.filePaths[0]) // Set path yang dipilih ke localPort
    return { success: true, localPort }
  }

  return { success: false, localPort }
})

ipcMain.handle("get-manga-list", async (event: IpcMainInvokeEvent) => {
  return getMangaList(localPort)
})

ipcMain.handle("get-manga-info", async (event: IpcMainInvokeEvent, dir: string) => {
  return await getMangaInfo(localPort, dir)
})

ipcMain.handle("get-archive-chapter", async (event: IpcMainInvokeEvent, dir: string) => {
  return getArchivesInMangaFolder(localPort, dir)
})

ipcMain.handle("get-image-chapter", async (event: IpcMainInvokeEvent, dir: string, id: number) => {
  return getImagesFromArchive(localPort, dir, id)
})

ipcMain.handle("get-all-archive-title", async (event: IpcMainInvokeEvent, dir: string) => {
  return getAllArchiveTitleById(localPort, dir)
})

ipcMain.handle("get-max-id", async (event: IpcMainInvokeEvent, dir: string) => {
  return getMaxId(localPort, dir)
})


// Serve folder as static files
expressApp.use("/manga", express.static(localPort))

expressApp.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})

