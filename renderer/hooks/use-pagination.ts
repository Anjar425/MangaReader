import { Manga } from "@/interfaces/types"
import { useState, useEffect } from "react"

const usePagination = (filteredManga: Manga[]) => {
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage, setItemsPerPage] = useState(20)
	const [totalPages, setTotalPages] = useState(1)
	const [paginatedManga, setPaginatedManga] = useState([])

	// Update pagination when filtered manga changes
	useEffect(() => {
		const totalPages = Math.ceil(filteredManga.length / itemsPerPage)
		setTotalPages(totalPages || 1)

		// Ensure current page is valid
		if (currentPage > totalPages) {
			setCurrentPage(totalPages || 1)
		}

		// Get current items
		const startIndex = (currentPage - 1) * itemsPerPage
		const endIndex = startIndex + itemsPerPage
		setPaginatedManga(filteredManga.slice(startIndex, endIndex))
	}, [filteredManga, currentPage, itemsPerPage])

	// Handle page change
	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page)
		}
	}

	// Handle items per page change
	const handleItemsPerPageChange = (value: string) => {
		setItemsPerPage(Number(value))
		setCurrentPage(1) // Reset to first page when changing items per page
	}

	return {
		currentPage,
		totalPages,
		itemsPerPage,
		paginatedManga,
		handlePageChange,
		handleItemsPerPageChange,
		setCurrentPage,
		setItemsPerPage,
	}
}

export { usePagination }
