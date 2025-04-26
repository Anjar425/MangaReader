import { Manga } from "@/interfaces/types"
import { useState, useEffect, Dispatch, SetStateAction } from "react"

const useGenreFilter = (mangaList: Manga[], setFilteredManga: Dispatch<SetStateAction<Manga[]>>, searchQuery: string) => {
	const [allGenres, setAllGenres] = useState<string[]>([])
	const [selectedGenres, setSelectedGenres] = useState<string[]>([])

	// Extract all unique genres from manga list
	useEffect(() => {
		if (mangaList.length > 0) {
			setAllGenres(
				Array.from(new Set(mangaList.flatMap((manga) => (Array.isArray(manga.Genre) ? manga.Genre : []))))
					.filter((genre): genre is string => typeof genre === "string")
					.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })),
			)
		}
	}, [mangaList])

	// Toggle genre selection
	const toggleGenre = (genre: string) => {
		setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]))
	}

	useEffect(() => {
		const filteredManga = mangaList.filter((manga) => {
			// Filter by search query
			const matchesNames = manga.Name.toLowerCase().includes(searchQuery.toLowerCase())
			const matchesArtist = manga.Penciller.toLowerCase().includes(searchQuery.toLowerCase()) || manga.Writer.toLowerCase().includes(searchQuery.toLowerCase())
			const matchesSearch = matchesNames || matchesArtist


			// Filter by selected genres (manga must have ALL selected genres)
			const matchesGenres = selectedGenres.length === 0 || selectedGenres.every((genre) => manga.Genre.includes(genre))

			return matchesSearch && matchesGenres
		})
		setFilteredManga(filteredManga)
		// setCurrentPage(1) // Reset to first page when filter changes
	}, [searchQuery, mangaList, selectedGenres])

	return {
		allGenres,
		selectedGenres,
		setSelectedGenres,
		toggleGenre
	}
}

export { useGenreFilter }