import { Manga } from "@/interfaces/types"
import { useState, useEffect } from "react"

const useMangaFavorited = () => {
    const [mangaList, setMangaList] = useState<Manga[]>([])
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [filteredManga, setFilteredManga] = useState<Manga[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchMangaList = async () => {
            try {
                setIsLoading(true)
                // Only access browser APIs after component is mounted
                if (typeof window !== "undefined" && window.ipc) {
                    const data = await window.ipc.getMangaList()

                    const favoriteManga = data.filter((manga: any) => manga.Favorited === 1);

                    setMangaList(favoriteManga);
                    setFilteredManga(favoriteManga);
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

export { useMangaFavorited }