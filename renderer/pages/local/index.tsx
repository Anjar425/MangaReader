"use client"

import type React from "react"
import { useEffect } from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight, Moon, Search, SearchIcon, Sun, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface Manga {
	ID: number
	Name: string
	Cover: string
	Penciller: string
	Writer: string
	Genre: string[]
	TotalChapters: number
}

export default function LocalMangaList() {
	const [allGenres, setAllGenres] = useState([])
	const [selectedGenres, setSelectedGenres] = useState<string[]>([])
	const [openGenreSelector, setOpenGenreSelector] = useState(false)

	const [darkMode, setDarkMode] = useState(true)
	const [searchQuery, setSearchQuery] = useState("")
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

	const [mangaList, setMangaList] = useState<Manga[]>([])
	const [filteredManga, setFilteredManga] = useState([])

	// Pagination states
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage, setItemsPerPage] = useState(20)
	const [totalPages, setTotalPages] = useState(1)
	const [paginatedManga, setPaginatedManga] = useState([])

	const [isLoading, setIsLoading] = useState<boolean>(true)

	// Handle fetch data from local storage
	useEffect(() => {
		const handleGetLastLocation = async () => {
			const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

			// Ambil dan set search query
			const savedSearchQuery = sessionStorage.getItem("searchQuery") || "";
			setSearchQuery(savedSearchQuery);
			await delay(1);

			// Ambil dan set selected genres
			const savedGenres = sessionStorage.getItem("selectedGenres");
			setSelectedGenres(savedGenres ? JSON.parse(savedGenres) : []);
			await delay(1);

			// Ambil dan set items per page
			const itemsPerPage = Number.parseInt(sessionStorage.getItem("itemsPerPage") || "20", 10);
			console.log(itemsPerPage);
			setItemsPerPage(itemsPerPage);
			await delay(1);

			// Ambil dan set current page
			const currentPage = Number.parseInt(sessionStorage.getItem("currentPage") || "1", 10);
			console.log(currentPage);
			setCurrentPage(currentPage);
			await delay(1);
			setIsLoading(false);


			// Scroll ke posisi sebelumnya jika ada
			const savedScroll = sessionStorage.getItem("scrollLocation");
			if (savedScroll) {
				setTimeout(() => {
					document.getElementsByTagName("main")[1].scrollTo({ top: Number(savedScroll), behavior: "smooth" })
				}, 300)
			}

			// Hapus session storage setelah semua data diambil
			await delay(1000);
			sessionStorage.removeItem("itemsPerPage");
			sessionStorage.removeItem("currentPage");
			sessionStorage.removeItem("scrollLocation");
			sessionStorage.removeItem("selectedGenres");
			sessionStorage.removeItem("searchQuery");

		};

		const fetchMangaList = async () => {
			try {
				const data = await window.ipc.getMangaList()
				setMangaList(data)
				setFilteredManga(data)
				// Use data directly instead of mangaList which hasn't been updated yet
				setAllGenres(
					Array.from(new Set(data.flatMap((manga) => Array.isArray(manga.Genre) ? manga.Genre : [])))
						.filter((genre): genre is string => typeof genre === "string")
						.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
				)

				handleGetLastLocation()
			} catch (error) {
				console.error("Error fetching manga list:", error)
			}
		}
		fetchMangaList()
	}, [])

	const clearFilters = () => {
		setSearchQuery("")
		setSelectedGenres([])
	}

	const toggleGenre = (genre: string) => {
		setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]))
	}

	// Handle search input change
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value)
	}

	const saveLocation = () => {
		sessionStorage.setItem("itemsPerPage", String(itemsPerPage))
		sessionStorage.setItem("currentPage", String(currentPage))
		sessionStorage.setItem("scrollLocation", String(document.getElementsByTagName("main")[1].scrollTop))
		sessionStorage.setItem("selectedGenres", JSON.stringify(selectedGenres))
		sessionStorage.setItem("searchQuery", searchQuery)
	}

	// Filter manga based on search query
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
		setCurrentPage(1) // Reset to first page when filter changes
	}, [searchQuery, mangaList, selectedGenres])

	// Handle pagination
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

	// Update the dark mode toggle function to properly set the dark class on the html element
	const toggleDarkMode = () => {
		const newDarkMode = !darkMode
		setDarkMode(newDarkMode)

		// Apply dark class to the html element
		if (newDarkMode) {
			document.documentElement.classList.add("dark")
		} else {
			document.documentElement.classList.remove("dark")
		}
	}

	return (
		<div className="h-screen overflow-hidden">
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<header className="sticky top-0 z-10 border-b bg-[#2f2e2e] rounded-md backdrop-blur supports-[backdrop-filter]:bg-[#2f2e2e]/60">
						<div className=" flex h-16 items-center justify-between px-4 md:px-6">
							<div className="flex items-center gap-4">
								<SidebarTrigger />
								<h1 className="text-xl font-bold">Manga Reader</h1>
							</div>
							<div className="flex items-center gap-4 ">
								<div className="relative hidden md:block bg-[#454444]/60 rounded-md">
									<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground " />
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

					<main className=" overflow-y-auto h-screen py-10 pb-24 px-4 md:px-6 lg:px-8">
						<div className="mb-8 flex items-center justify-between">
							<h1 className="text-3xl font-bold">My Library</h1>
							<div className="flex items-center gap-2">
								<Button
									className={`${viewMode === "grid" ? "bg-sky-800/60" : "outline"} cursor-pointer`}
									variant={viewMode === "grid" ? "default" : "outline"}
									size="sm"
									onClick={() => setViewMode("grid")}
								>
									Grid
								</Button>
								<Button
									className={`${viewMode === "list" ? "bg-sky-800/60" : "outline"} cursor-pointer`}
									variant={viewMode === "list" ? "default" : "outline"}
									size="sm"
									onClick={() => setViewMode("list")}
								>
									List
								</Button>
							</div>
						</div>
						{/* <div className="mb-8">
							<h1 className="text-3xl font-bold mb-2">Search Manga</h1>
							<p className="text-muted-foreground">Find manga by title, genres, and more</p>
						</div> */}

						{/* Search and Filter Section */}
						<div className="mb-8 space-y-4">
							{/* Search Input */}
							<div className="relative">
								<SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
								{/* Genre Selector */}
								<Popover open={openGenreSelector} onOpenChange={setOpenGenreSelector}>
									<PopoverTrigger>
										<Button variant="outline" className="justify-between">
											{selectedGenres.length > 0
												? `${selectedGenres.length} genre${selectedGenres.length > 1 ? "s" : ""} selected`
												: "Select genres"}
											<ChevronDown className="ml-2 h-4 w-4 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent
										className="popover-content"
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
								{/* Clear Filters */}
								{(searchQuery || selectedGenres.length > 0) && (
									<Button variant="ghost" size="sm" onClick={clearFilters}>
										<X className="mr-2 h-4 w-4" />
										Clear filters
									</Button>
								)}
							</div>
						</div>

						{isLoading || filteredManga.length === 0 ? (
							<div className="flex h-[50vh] flex-col items-center justify-center text-center">
								<BookOpen className="mb-4 h-16 w-16 text-muted-foreground" />
								<h2 className="text-2xl font-bold">No manga found</h2>
								<p className="mt-2 text-muted-foreground">
									Try adjusting your search or add some manga to your library
								</p>
							</div>
						) : viewMode === "grid" ? (
							<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
								{paginatedManga.map((manga, index) => (
									<Link
										key={index}
										href={`/manga/${manga.ID}`}
										className="group flex justify-center"
										prefetch={false}
										onClick={saveLocation}
									>
										<Card className="h-96 w-full max-w-[240px] overflow-hidden transition-all hover:ring-2 hover:ring-primary p-0">
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
													<h3 className="line-clamp-2 text-center font-medium leading-tight text-foreground">
														{manga.Name}
													</h3>
												</div>
											</div>
										</Card>
									</Link>
								))}
							</div>
						) : (
							<div className="space-y-4 ">
								{paginatedManga.map((manga) => (
									<Link key={manga.ID} href={`/manga/${manga.ID}`}>
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
														{/* <p className="text-xs text-muted-foreground">Last read: {manga.lastRead}</p> */}
													</div>
												</div>
											</div>
										</Card>
									</Link>
								))}
							</div>
						)}

						{/* Pagination Controls */}
						{filteredManga.length > 0 && (
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
										Showing {(currentPage - 1) * itemsPerPage + 1}-
										{Math.min(currentPage * itemsPerPage, filteredManga.length)} of {filteredManga.length}
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
									<div className="flex items-center ">
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
													className={`mx-1 h-8 w-8 transition-transform duration-300 cursor-pointer ${currentPage === pageNum ? "bg-sky-800" : ""}`}
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
						)}
					</main>

					<footer className="border-t py-6">
						<div className=" flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-6">
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

