"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import { useMangaFavorited } from "@/hooks/use-manga-favorited"
import { useThemeToggle } from "@/hooks/use-theme-toggle"
import { usePagination } from "@/hooks/use-pagination"
import { useSessionStorage } from "@/hooks/use-session-storage"
import { useGenreFilter } from "@/hooks/use-genre-filter"
import LoadingState from "@/components/loading-state"
import Header from "@/components/header"
import EmptyState from "@/components/empty-state"
import GenreSelector from "@/components/genre-selector"
import GridView from "@/components/grid-view"
import ListView from "@/components/list-view"
import PaginationControls from "@/components/pagination-control"
import { Search, X } from "lucide-react"

const FavoritedMangaList = () => {
    const {
        mangaList,
        filteredManga,
        setFilteredManga,
        searchQuery,
        setSearchQuery,
        isLoading,
        setIsLoading
    } = useMangaFavorited()

    const {
        darkMode,
        toggleDarkMode
    } = useThemeToggle()

    const {
        allGenres,
        selectedGenres,
        toggleGenre,
        setSelectedGenres
    } = useGenreFilter(mangaList, setFilteredManga, searchQuery)

    const {
        currentPage,
        totalPages,
        itemsPerPage,
        paginatedManga,
        handlePageChange,
        handleItemsPerPageChange,
        setItemsPerPage,
        setCurrentPage
    } = usePagination(filteredManga)

    const { saveLocation } = useSessionStorage(
        mangaList,
        searchQuery,
        selectedGenres,
        currentPage,
        itemsPerPage,
        setSearchQuery,
        setSelectedGenres,
        setItemsPerPage,
        setCurrentPage,
        setIsLoading
    )

    // View mode state
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery("")
        setSelectedGenres([])
    }

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    return (
        <div className="h-screen overflow-hidden">
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    {/* Header */}
                    <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

                    {/* Main Content */}
                    <main className="overflow-y-auto h-screen py-10 pb-24 px-4 md:px-6 lg:px-8">
                        {/* Header and View Toggle */}
                        <div className="mb-8 flex items-center justify-between">
                            <h1 className="text-3xl font-bold">My Favorited</h1>
                            <div className="flex items-center gap-2">
                                <Button
                                    className={`${viewMode === "grid" ? "bg-sky-800/60" : "outline"} cursor-pointer`}
                                    variant={viewMode === "grid" ? "outline" : "outline"}
                                    size="sm"
                                    onClick={() => setViewMode("grid")}
                                >
                                    Grid
                                </Button>
                                <Button
                                    className={`${viewMode === "list" ? "bg-sky-800/60" : "outline"} cursor-pointer`}
                                    variant={viewMode === "list" ? "outline" : "outline"}
                                    size="sm"
                                    onClick={() => setViewMode("list")}
                                >
                                    List
                                </Button>
                            </div>
                        </div>

                        {/* Search and Filter Section */}
                        <div className="mb-8 space-y-4">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search manga by title..."
                                    className="pl-10 bg-[#454444]/60"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </div>

                            {/* Desktop Filters */}
                            <div className="hidden md:flex items-center gap-4">
                                {/* Use dynamically imported GenreSelector component */}
                                <GenreSelector
                                    allGenres={allGenres}
                                    selectedGenres={selectedGenres}
                                    setSelectedGenres={setSelectedGenres}
                                    toggleGenre={toggleGenre}
                                />

                                {/* Clear Filters */}
                                {(searchQuery || selectedGenres.length > 0) && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                                        <X className="mr-2 h-4 w-4" />
                                        Clear filters
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Manga Display */}
                        {isLoading ? (
                            <LoadingState />
                        ) : filteredManga.length === 0 ? (
                            <EmptyState />
                        ) : viewMode === "grid" ? (
                            <GridView manga={paginatedManga} saveLocation={saveLocation} />
                        ) : (
                            <ListView manga={paginatedManga} saveLocation={saveLocation} />
                        )}

                        {/* Pagination Controls */}
                        {filteredManga.length > 0 && (
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                itemsPerPage={itemsPerPage}
                                filteredMangaLength={filteredManga.length}
                                handlePageChange={handlePageChange}
                                handleItemsPerPageChange={handleItemsPerPageChange}
                            />
                        )}
                    </main>

                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}

export default FavoritedMangaList