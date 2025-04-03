"use client"

import type React from "react"

import { Dispatch, SetStateAction, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight, Moon, Search, Sun, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useMangaData } from "@/hooks/use-manga-data"
import { useThemeToggle } from "@/hooks/use-theme-toggle"
import { usePagination } from "@/hooks/use-pagination"
import { useSessionStorage } from "@/hooks/use-session-storage"
import { useGenreFilter } from "@/hooks/use-genre-filter"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export default function LocalMangaList() {
	// Custom hooks for better organization
	const {
		mangaList,
		filteredManga,
		setFilteredManga,
		searchQuery,
		setSearchQuery,
		isLoading,
		setIsLoading
	} = useMangaData()

	const { darkMode, toggleDarkMode } = useThemeToggle()

	const { allGenres, selectedGenres, toggleGenre, setSelectedGenres } =
		useGenreFilter(mangaList, setFilteredManga, searchQuery)

	const { currentPage, totalPages, itemsPerPage, paginatedManga, handlePageChange, handleItemsPerPageChange, setItemsPerPage, setCurrentPage } =
		usePagination(filteredManga)

	const { saveLocation } = useSessionStorage(
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
					<header className="sticky top-0 z-10 border-b bg-[#2f2e2e] rounded-md backdrop-blur supports-[backdrop-filter]:bg-[#2f2e2e]/60">
						<div className="flex h-16 items-center justify-between px-4 md:px-6">
							<div className="flex items-center gap-4">
								<SidebarTrigger />
								<h1 className="text-xl font-bold">Manga Reader</h1>
							</div>
							<div className="flex items-center gap-4">
								<div className="relative hidden md:block bg-[#454444]/60 rounded-md">
									<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										type="search"
										placeholder="Search manga..."
										className="w-[200px] lg:w-[300px] pl-8"
										value={searchQuery}
										onChange={handleSearchChange}
									/>
								</div>
								<Button variant="ghost" size="icon" onClick={toggleDarkMode}>
									{darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
									<span className="sr-only">Toggle theme</span>
								</Button>
							</div>
						</div>
					</header>

					{/* Main Content */}
					<main className="overflow-y-auto h-screen py-10 pb-24 px-4 md:px-6 lg:px-8">
						{/* Header and View Toggle */}
						<div className="mb-8 flex items-center justify-between">
							<h1 className="text-3xl font-bold">My Library</h1>
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

					{/* Footer */}
					<footer className="border-t py-6">
						<div className="flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-6">
							<p className="text-center text-sm text-muted-foreground">
								&copy; {new Date().getFullYear()} Manga Reader. All rights reserved.
							</p>
							<div className="flex gap-4">
								<Link href="#" className="text-sm text-muted-foreground hover:underline">
									Terms of Service
								</Link>
								<Link href="#" className="text-sm text-muted-foreground hover:underline">
									Privacy Policy
								</Link>
							</div>
						</div>
					</footer>
				</SidebarInset>
			</SidebarProvider>
		</div>
	)
}

// Component for empty state when no manga is found
function EmptyState() {
	return (
		<div className="flex h-[50vh] flex-col items-center justify-center text-center">
			<BookOpen className="mb-4 h-16 w-16 text-muted-foreground" />
			<h2 className="text-2xl font-bold">No manga found</h2>
			<p className="mt-2 text-muted-foreground">Try adjusting your search or add some manga to your library</p>
		</div>
	)
}

// Component for empty state when no manga is found
function LoadingState() {
	return (
		<div className="flex h-[50vh] flex-row  items-center justify-center text-center gap-2">
			<svg className="size-7 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
			<p className="text-lg text-center text-gray-500">Loading ...</p>
		</div>
	);
}

// Component for grid view
function GridView({ manga, saveLocation }) {
	return (
		<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			{manga.map((manga, index) => (
				<Link
					key={index}
					href={`/manga/${manga.ID}`}
					className="group flex justify-center"
					prefetch={false}
					onClick={saveLocation}
				>
					<Card className="h-96 w-full max-w-[240px] transition-discrete overflow-hidden transition-all hover:ring-2 hover:ring-primary p-0 ease-in-out">
						<div className="relative h-full w-full">
							<Image
								src={manga.Cover || "/placeholder.svg"}
								alt={manga.Name}
								fill={true}
								style={{ objectFit: "cover", objectPosition: "center" }}
								className="object-cover transition-transform h-full w-full group-hover:scale-105"
								priority={true}
							/>
							<div className="absolute bottom-0 left-0 w-full min-h-[9vh] flex items-center justify-center p-4 text-center bg-gradient-to-t from-gray-950/90 to-transparent">
								<h3 className="line-clamp-2 text-center font-medium leading-tight text-foreground">{manga.Name}</h3>
							</div>
						</div>
					</Card>
				</Link>
			))}
		</div>
	)
}

// Component for list view
function ListView({ manga, saveLocation }) {
	return (
		<div className="space-y-4">
			{manga.map((manga) => (
				<Link key={manga.ID} href={`/manga/${manga.ID}`} onClick={saveLocation}>
					<Card className="hover:ring-2 hover:ring-primary hover:scale-[1.02] overflow-hidden transition-all hover:bg-muted/50 my-4">
						<div className="flex px-5">
							<div className="relative h-24 w-16 shrink-0 overflow-hidden rounded">
								<Image
									src={manga.Cover || "/placeholder.svg"}
									alt={manga.Name}
									fill={true}
									style={{ objectFit: "cover", objectPosition: "center" }}
									className="object-cover transition-transform group-hover:scale-105"
									priority={true}
								/>
							</div>
							<div className="ml-4 flex flex-1 flex-col justify-between">
								<div>
									<h3 className="font-medium">{manga.Name}</h3>
									<div className="my-3 flex flex-wrap gap-1">
										{manga.Genre?.slice(0, 15).map((genre) => (
											<Badge key={genre} variant="secondary" className="text-xs bg-sky-800">
												{genre}
											</Badge>
										))}
										{manga.Genre.length > 15 && (
											<Badge variant="secondary" className="text-xs bg-sky-800">
												+{manga.Genre.length - 15}
											</Badge>
										)}
									</div>
								</div>
								<div className="flex items-center justify-between">
									<p className="text-xs text-muted-foreground">{manga.TotalChapters} chapters</p>
								</div>
							</div>
						</div>
					</Card>
				</Link>
			))}
		</div>
	)
}

// Component for pagination controls
function PaginationControls({
	currentPage,
	totalPages,
	itemsPerPage,
	filteredMangaLength,
	handlePageChange,
	handleItemsPerPageChange,
}) {
	return (
		<div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground">Items per page:</span>
				<Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
					<SelectTrigger className="w-[80px] cursor-pointer">
						<SelectValue placeholder="20" />
					</SelectTrigger>
					<SelectContent className="bg-[#2f2e2e] cursor-pointer">
						<SelectItem className="hover:bg-[#454444] cursor-pointer" value="20">
							20
						</SelectItem>
						<SelectItem className="hover:bg-[#454444] cursor-pointer" value="50">
							50
						</SelectItem>
						<SelectItem className="hover:bg-[#454444] cursor-pointer" value="100">
							100
						</SelectItem>
					</SelectContent>
				</Select>
				<span className="text-sm text-muted-foreground">
					Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredMangaLength)} of{" "}
					{filteredMangaLength}
				</span>
			</div>

			<div className="flex items-center gap-1 cursor-pointer">
				<Button
					variant="outline"
					size="icon"
					onClick={() => handlePageChange(currentPage - 1)}
					disabled={currentPage === 1}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>

				{/* Page numbers */}
				<div className="flex items-center">
					{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
						let pageNum
						if (totalPages <= 5) {
							pageNum = i + 1
						} else if (currentPage <= 3) {
							pageNum = i + 1
						} else if (currentPage >= totalPages - 2) {
							pageNum = totalPages - 4 + i
						} else {
							pageNum = currentPage - 2 + i
						}

						return (
							<Button
								key={i}
								variant={currentPage === pageNum ? "default" : "outline"}
								size="sm"
								className={`mx-1 h-8 w-8 transition-transform duration-300 cursor-pointer ${currentPage === pageNum ? "bg-sky-800" : ""
									}`}
								onClick={() => handlePageChange(pageNum)}
							>
								{pageNum}
							</Button>
						)
					})}
				</div>

				<Button
					variant="outline"
					size="icon"
					onClick={() => handlePageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="cursor-pointer"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}

// Export the props interface so it can be imported elsewhere
export interface GenreSelectorProps {
	allGenres: string[]
	selectedGenres: string[]
	setSelectedGenres: Dispatch<SetStateAction<string[]>>
	toggleGenre: (genre: string) => void
}

export function GenreSelector({
	allGenres,
	selectedGenres,
	setSelectedGenres,
	toggleGenre,
}: GenreSelectorProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<div>
					<Button variant="outline" className="justify-between">
						{selectedGenres.length > 0
							? `${selectedGenres.length} genre${selectedGenres.length > 1 ? "s" : ""} selected`
							: "Select genres"}
						<ChevronDown className="ml-2 h-4 w-4 opacity-50" />
					</Button>
				</div>
			</PopoverTrigger>
			<PopoverContent
				className="popover-content z-0"
				align="start"
			>
				<Command>
					<CommandInput placeholder="Search genres..." />
					<CommandList>
						<CommandEmpty>No genres found.</CommandEmpty>
						<CommandGroup>
							<div className="p-2 overflow-hidden">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">Genres</span>
									{selectedGenres.length > 0 && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setSelectedGenres([])}
											className="h-auto py-1 px-2 text-xs"
										>
											Clear all
										</Button>
									)}
								</div>
								<ScrollArea className="h-60">
									<div className="grid grid-cols-1 gap-1">
										{allGenres.map((genre) => (
											<CommandItem
												key={genre}
												onSelect={() => toggleGenre(genre)}
												className="flex items-center gap-2 cursor-pointer"
											>
												<div
													className={cn(
														"flex h-4 w-4 items-center justify-center rounded-sm border",
														selectedGenres.includes(genre)
															? "border-primary bg-primary text-primary-foreground"
															: "border-muted",
													)}
												>
													{selectedGenres.includes(genre) && <Check className="h-3 w-3" />}
												</div>
												<span>{genre}</span>
											</CommandItem>
										))}
									</div>
								</ScrollArea>
							</div>
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}