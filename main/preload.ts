import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron"

interface IpcHandler {
	send: (channel: string, value: any) => void
	on: (channel: string, callback: (...args: any[]) => void) => () => void
	setLocalDir: () => Promise<{ success: boolean; localPort: string }>
	getMangaList: () => Promise<any[]>
	getMangaDetails: (id: number) => Promise<any>
	setMangaFavorited: (mangaId: number, isFavorited: boolean) => Promise<any>
	getChapterDetails: (manga_id: number, chapter_index: number) => Promise<any>
	getImagesFromArchive: (fullPath: string) => Promise<string[]>
}

const handler: IpcHandler = {
	send(channel: string, value: any) {
		ipcRenderer.send(channel, value)
	},
	on(channel: string, callback: (...args: any[]) => void) {
		const subscription = (_event: IpcRendererEvent, ...args: any[]) => callback(...args)
		ipcRenderer.on(channel, subscription)

		return () => {
			ipcRenderer.removeListener(channel, subscription)
		}
	},
	// Change Local Directory
	setLocalDir: () => ipcRenderer.invoke("set-local-port"),

	// Local Manga List
	getMangaList: () => ipcRenderer.invoke("get-manga-list"),
	getMangaDetails: (id: number) => ipcRenderer.invoke("get-manga-details", id),
	setMangaFavorited: (mangaId: number, isFavorited: boolean) => ipcRenderer.invoke("set-manga-favorited", mangaId, isFavorited),
	getChapterDetails: (manga_id: number, chapter_index: number) => ipcRenderer.invoke("get-chapter-details", manga_id, chapter_index),
	getImagesFromArchive: (fullPath: string,) => ipcRenderer.invoke("get-image-chapter", fullPath),
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("ipc", handler)

