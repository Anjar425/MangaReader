import path from "path"
import { app, ipcMain, dialog, type BrowserWindow, type IpcMainInvokeEvent } from "electron"
import serve from "electron-serve"
import { createWindow } from "./helpers"
import express from "express"
import { getImagesFromArchive } from "./local/get-image-from-archive"
import { scanMangaDirectory } from "./local/dbhandler"
import Database from 'better-sqlite3';
import { getMangaDetails, setMangaFavorited } from "./local/get-manga-details"
import { getChapterDetails } from "./local/get-chapter-details"

const expressApp = express()
const PORT = 3001
let localPort = "F:\\Manga\\local"   
const isProd: boolean = process.env.NODE_ENV === "production"

const dbPath = isProd
  ? path.join(process.resourcesPath, 'manga.db') // Saat production, simpan di folder aplikasi
  : path.join(app.getPath('userData'), 'manga.db'); // Saat development, tetap di userData
const db = new Database(dbPath);

const setLocalPort = (newPath: string): void => {
	localPort = newPath
	// console.log(`Local port set to: ${localPort}`);
}


if (isProd) {
	serve({ directory: "app" })
} else {
	app.setPath("userData", `${app.getPath("userData")} (development)`)
}
; (async () => {
	try {
		await app.whenReady().then(async () => {
			await scanMangaDirectory(dbPath, localPort);
		});
	} catch (error) {

	}
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
	const stmt = db.prepare(`
		SELECT 
			M.ID, 
			M.Name, 
			M.Favorited, 
			M.Cover, 
			M.Penciller,
			M.Writer,
			COALESCE(G.GroupedGenres, 'Unknown') AS Genre,
			COALESCE(C.TotalChapters, 0) AS TotalChapters
		FROM MANGA M
		LEFT JOIN (
			SELECT MG.ID_Manga, GROUP_CONCAT(G.Name, ', ') AS GroupedGenres
			FROM MANGA_GENRE MG
			JOIN GENRE G ON MG.ID_Genre = G.ID
			GROUP BY MG.ID_Manga
		) G ON M.ID = G.ID_Manga
		LEFT JOIN (
			SELECT ID_Manga, COUNT(*) AS TotalChapters
			FROM CHAPTER
			GROUP BY ID_Manga
		) C ON M.ID = C.ID_Manga
	`);
	
	const mangas = stmt.all().map(manga => ({
		ID: manga.ID,
		Name: manga.Name,
		Favorited: manga.Favorited,
		Cover: manga.Cover,
		Penciller: manga.Penciller,
		Writer: manga.Writer,
		Genre: manga.Genre === 'Unknown' ? ['Unknown'] : manga.Genre.split(', '),
		TotalChapters: manga.TotalChapters
	}));
	
	return mangas;
});


ipcMain.handle("get-manga-details", async (event: IpcMainInvokeEvent, id: number) => {
	return await getMangaDetails(dbPath, id)
})

ipcMain.handle("set-manga-favorited", async (event: IpcMainInvokeEvent, mangaId: number, isFavorited: boolean) => {
	return await setMangaFavorited(dbPath, mangaId, isFavorited)
})

ipcMain.handle("get-chapter-details", async (event: IpcMainInvokeEvent, manga_id: number, chapter_index: number) => {
	return await getChapterDetails(dbPath, manga_id, chapter_index)
})

ipcMain.handle("get-image-chapter", async (event: IpcMainInvokeEvent, fullPath: string) => {
	return getImagesFromArchive(fullPath)
})


// Serve folder as static files
expressApp.use("/manga", express.static(localPort))

expressApp.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`)
})

