import { Manga } from "@/interfaces/types"
import { useState, useEffect } from "react"

const useMangaData = () => {
	const [mangaList, setMangaList] = useState<Manga[]>([])
	const [searchQuery, setSearchQuery] = useState<string>("")
	const [filteredManga, setFilteredManga] = useState<Manga[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(true)

	// Only run client-side code after component mounts
	useEffect(() => {
		const fetchMangaList = async () => {
			try {
				setIsLoading(true)
				// Only access browser APIs after component is mounted
				if (typeof window !== "undefined" && window.ipc) {
					const data = await window.ipc.getMangaList()
					setMangaList(data)
					setFilteredManga(data)
					setIsLoading(false)
				}
			} catch (error) {
				console.error("Error fetching manga list:", error)
			}
		}

		fetchMangaList()
	}, [])

	return {
		mangaList,
		filteredManga,
		setFilteredManga,
		searchQuery,
		setSearchQuery,
		isLoading,
		setIsLoading,
	}
}

export { useMangaData }