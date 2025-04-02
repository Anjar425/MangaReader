import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron"

interface IpcHandler {
	send: (channel: string, value: any) => void
	on: (channel: string, callback: (...args: any[]) => void) => () => void
	setLocalDir: () => Promise<{ success: boolean; localPort: string }>
	getMangaList: () => Promise<any[]>
	getMangaInfo: (dir: string) => Promise<any>
	getArchivesInMangaFolder: (dir: string) => Promise<string[]>
	getImagesFromArchive: (dir: string, id: number) => Promise<string[]>
	getAllArchiveTitleById: (dir: string) => Promise<any>
	getMaxId: (dir: string) => Promise<any>
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
	getMangaInfo: (dir: string) => ipcRenderer.invoke("get-manga-info", dir),
	getArchivesInMangaFolder: (dir: string) => ipcRenderer.invoke("get-archive-chapter", dir),
	getImagesFromArchive: (dir: string, id: number) => ipcRenderer.invoke("get-image-chapter", dir, id),
	getAllArchiveTitleById: (dir: string) => ipcRenderer.invoke("get-all-archive-title", dir),
	getMaxId: (dir: string) => ipcRenderer.invoke("get-max-id", dir),
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("ipc", handler)

