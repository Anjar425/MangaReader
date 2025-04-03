"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
	ChevronLeft,
	ChevronRight,
	Home,
	List,
	Moon,
	Settings,
	Sun,
	X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { cn } from "@/lib/utils"
import { useRouter } from "next/router"
import { Slider } from "@/components/ui/slider"
import MangaNavigation from "@/components/navigation-bar"

interface Page {
	image: string
}

interface allchapters {
	chapter_index: number,
	chapter_name: string
}

interface Manga {
	chapter_index: number
	manga_name: string
	chapter_name: string
	file_path: string,
	pages: Page[]
	all_chapter: number
	nextChapter: boolean
	prevChapter: boolean
	all_chapters: allchapters[]
}

type ReadingMode = "scroll" | "pagination"

export default function ChapterReader() {
	const contentRef = useRef<HTMLDivElement>(null);
	const currentPageRef = useRef(1);
	const [darkMode, setDarkMode] = useState(true)
	const [readingMode, setReadingMode] = useState<ReadingMode>("scroll")
	const [currentPage, setCurrentPage] = useState(1)
	const [zoomLevel, setZoomLevel] = useState(70)
	const [showControls, setShowControls] = useState(true)
	const [manga, setManga] = useState<Manga | undefined>()
	const [isLoading, setIsLoading] = useState(true)
	const [isSettingsOpen, setIsSettingsOpen] = useState(false)
	const [isChapterListOpen, setIsChapterListOpen] = useState(false)
	const router = useRouter()

	const params = useParams()
	const detail = params?.detail as string
	const id = params?.id as string

	useEffect(() => {
		const fetchData = async () => {
			if (!detail || !id) return

			try {
				// Using a try-catch to handle potential IPC errors
				const getChapterDetails = async () => {
					try {
						return await window.ipc.getChapterDetails(parseInt(detail), parseInt(id))
					} catch (error) {
						console.error("Error in getMangaInfo:", error)
					}
				}

				const getImages = async (fullPath: string) => {
					try {
						return await window.ipc.getImagesFromArchive(fullPath)
					} catch (error) {
						console.error("Error in getImagesFromArchive:", error)
						return []
					}
				}

				const data = await getChapterDetails();
				const imageData = await getImages(data.file_path)

				// Convert imageData to pages format
				const pages = imageData.map((image: string) => ({
					image: image,
				}))

				setManga({
					chapter_index: data.chapter_index, // Sesuai dengan `chapter_index` di interface
					manga_name: data.manga_name, // Sesuai dengan `manga_name` di interface
					chapter_name: data.chapter_name,
					file_path: data.file_path, // Tambahkan `file_path` dari hasil query
					pages: pages || [], // Default ke array kosong jika tidak ada halaman
					all_chapter: data.all_chapter, // Total jumlah chapter dalam manga
					nextChapter: data.nextChapter, // Boolean apakah ada next chapter
					prevChapter: data.prevChapter, // Boolean apakah ada previous chapter
					all_chapters: data.all_chapters, // Array daftar semua chapter
				});


				setIsLoading(false)
			} catch (error) {
				console.error("Error fetching manga info:", error)
				setIsLoading(false)
			}
		}

		fetchData()
	}, [detail, id])

	// Toggle dark mode
	const toggleDarkMode = () => setDarkMode(!darkMode)

	const handlePageChange = (page: number) => {
		if (!contentRef.current) return;
	
		currentPageRef.current = page;
		setCurrentPage(page);
	
		const scrollHeight = contentRef.current.scrollHeight - contentRef.current.clientHeight;
		const scrollPercentage = (page - 1) / (manga.pages.length - 1);

	  };

	// Toggle reading mode
	const toggleReadingMode = () => {
		setReadingMode((prev) => (prev === "scroll" ? "pagination" : "scroll"))
	}

	// Navigate to next page
	const nextPage = () => {
		if (!manga) return

		if (currentPage < manga.pages.length) {
			setCurrentPage((prev) => prev + 1)
		} else if (manga.nextChapter) {
			// Navigate to next chapter handled by Link component
			setCurrentPage(1)
			nextChapter()
		}
	}

	// Navigate to previous page
	const prevPage = () => {
		if (!manga) return

		if (currentPage > 1) {
			setCurrentPage((prev) => prev - 1)
		} else if (manga.prevChapter) {
			// Navigate to previous chapter handled by Link component
			setCurrentPage(manga?.pages.length || 1)
		}
	}

	const nextChapter = () => {
		if (!manga) return

		if (manga.nextChapter){
			router.push(`/manga/${detail}/${manga.chapter_index + 1}`)
		}
	}

	const prevChapter = () => {
		if (!manga) return

		if (manga.prevChapter){
			router.push(`/manga/${detail}/${manga.chapter_index - 1}`)
		}
	}

	// Handle keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (readingMode === "pagination") {
				if (e.key === "ArrowRight" || e.key === " ") {
					nextPage()
				} else if (e.key === "ArrowLeft") {
					prevPage()
				}
			}
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [readingMode, currentPage, manga])

	// Auto-hide controls after 3 seconds of inactivity
	useEffect(() => {
		if (!showControls) return

		const timer = setTimeout(() => {
			setShowControls(false)
		}, 3000)

		return () => clearTimeout(timer)
	}, [showControls])

	// Show controls on mouse movement
	const handleMouseMove = () => {
		setShowControls(true)
	}

	const toggleSettings = () => {
		if (isChapterListOpen) {
			setIsChapterListOpen(false)
		}
		setIsSettingsOpen(!isSettingsOpen)
	}

	const toggleChapterList = () => {
		if (isSettingsOpen) {
			setIsSettingsOpen(false)
		}
		setIsChapterListOpen(!isChapterListOpen)
	}

	// Fallback for when manga data is not available
	if (!isLoading && !manga) {
		return (
			<div className="flex h-screen items-center justify-center">
				<p className="text-xl font-semibold">Failed to load manga data</p>
			</div>
		)
	}

	const scrollToTop = () => {
		setTimeout(() => {
			document.getElementsByTagName("main")[1].scrollTo({ top: 0, behavior: "smooth" })
		}, 300);
	}

	return (
		<div className={cn("min-h-screen flex flex-col h-screen overflow-hidden", darkMode ? "dark" : "")} onMouseMove={handleMouseMove}>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset className="flex-1 flex flex-col overflow-hidden">
					{isLoading ? (
						<div className="flex flex-1 items-center justify-center">
							<p className="text-xl font-semibold">Loading...</p>
						</div>
					) : (
						<>
							{/* Header - always visible */}
							<header className="sticky top-0 z-10 border-b bg-[#2f2e2e] rounded-md backdrop-blur supports-[backdrop-filter]:bg-[#2f2e2e]/60">
								<div className="flex h-16 items-center justify-between px-4 md:px-6">
									<div className="flex items-center gap-4">
										<SidebarTrigger />
										<Link href="/local" className="flex items-center gap-2">
											<Home className="h-5 w-5" />
											<span className="font-medium">{manga.manga_name}</span>
										</Link>
										<span className="text-sm text-muted-foreground">{manga.chapter_name}</span>
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="ghost"
											size="icon"
											className="p-2 hover:bg-accent hover:text-accent-foreground"
											onClick={toggleChapterList}
										>
											<List className="h-6 w-6" />
											<span className="sr-only">Chapter List</span>
										</Button>

										<Button
											variant="ghost"
											size="icon"
											className="p-2 hover:bg-accent hover:text-accent-foreground"
											onClick={toggleSettings}
										>
											<Settings className="h-6 w-6" />
											<span className="sr-only">Settings</span>
										</Button>
									</div>
								</div>
							</header>

							{/* Main content */}
							<main ref={contentRef} className="flex-1 overflow-y-auto	">
								<div  className={`mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)`}>
									{readingMode === "scroll" ? (
										// Continuous scroll mode
										<div style={{ width: `${zoomLevel}%` }}>
											<div className="space-y-4 flex flex-col justify-center">
												{manga?.pages.map((page, index) => (
													<div key={index} className="" >
														<Image
															src={page.image || "/placeholder.svg?height=1400&width=900"}
															alt={`Page ${index + 1}`}
															width={900}
															height={1400}
															className="w-full h-auto"
															priority={index <= 3}
														/>
													</div>
												))}
											</div>
										</div>
									) : (
										// Pagination mode
										<div className="mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)]">
											{manga?.pages && manga.pages.length > 0 && (
												<div ref={contentRef} className="relative mx-auto" style={{ width: `${zoomLevel}%` }}>
													<Image
														src={manga.pages[currentPage - 1]?.image || "/placeholder.svg?height=1400&width=900"}
														alt={`Page ${currentPage}`}
														width={900}
														height={1400}
														className="w-full h-auto"
														priority
													/>

													{/* Page navigation buttons */}
													<div className="absolute inset-0 flex">
														<button
															className="w-1/2 h-full focus:outline-none"
															onClick={prevPage}
															disabled={currentPage === 1 && !manga.prevChapter}
														>
															<span className="sr-only">Previous page</span>
														</button>
														<button
															className="w-1/2 h-full focus:outline-none"
															onClick={nextPage}
															disabled={currentPage === manga.pages.length && !manga.nextChapter}
														>
															<span className="sr-only">Next page</span>
														</button>
													</div>
												</div>
											)}
										</div>
									)}
								</div>
							</main>

							{/* Footer - only visible in pagination mode
							{readingMode === "pagination" && (
								<footer className="bg-[#2f2e2e] backdrop-blur supports-[backdrop-filter]:bg-[#2f2e2e]/60 z-10">
									<div className="mx-auto px-4 py-4">
										<div className="flex items-center justify-between">
											<Button
												variant="outline"
												size="icon"
												onClick={prevPage}
												className="hover:bg-[#454444]"
												disabled={currentPage === 1 && !manga?.prevChapter}
											>
												<ChevronLeft className="h-5 w-5" />
												<span className="sr-only">Previous page</span>
											</Button>

											<div className="text-center">
												<span className="text-sm font-medium">
													Page {currentPage} of {manga?.pages.length || 0}
												</span>
											</div>

											<Button
												variant="outline"
												size="icon"
												onClick={nextPage}
												className="hover:bg-[#454444]"
												disabled={currentPage === manga?.pages.length && !manga?.nextChapter}
											>
												<ChevronRight className="h-5 w-5" />
												<span className="sr-only">Next page</span>
											</Button>
										</div>
									</div>
								</footer>
							)} */}

							{/* Chapter list sidebar */}
							<div
								className={cn(
									"fixed inset-y-0 right-0 z-50 w-80 border-l bg-[#1a1919] p-4 shadow-md transition-transform duration-300 ease-in-out",
									isChapterListOpen ? "translate-x-0" : "translate-x-full",
								)}
							>
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-lg font-semibold">Chapters</h2>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
										onClick={toggleChapterList}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>

								<div className="space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto">
									{manga.all_chapter && manga.all_chapters.map((item) => (
										<Button
											key={item.chapter_index}
											variant={item.chapter_index === manga?.chapter_index ? "default" : "ghost"}
											className="w-full justify-start hover:bg-accent hover:text-accent-foreground"
											onClick={() => {
												router.push(`/manga/${detail}/${item.chapter_index}`)
											}}
										>
											{item.chapter_name}
										</Button>
									))}
								</div>
							</div>

							{/* Settings panel */}
							<div
								className={cn(
									"fixed right-0 top-16 z-50 w-80 rounded-md border bg-[#1a1919] p-4 shadow-md transition-opacity duration-300",
									isSettingsOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
								)}
							>
								<div className="mb-4">
									<p className="mb-2 text-sm font-medium">Reading Mode</p>
									<div className="flex gap-2">
										<Button
											variant={readingMode === "scroll" ? "default" : "outline"}
											size="sm"
											className={`flex-1 hover:bg-accent hover:text-accent-foreground ${readingMode === "scroll" ? "bg-sky-800/60" : "outline"}`}
											onClick={() => setReadingMode("scroll")}
										>
											Scroll
										</Button>
										<Button
											variant={readingMode === "pagination" ? "default" : "outline"}
											size="sm"
											className={`flex-1 hover:bg-accent hover:text-accent-foreground ${readingMode === "pagination" ? "bg-sky-800/60" : "outline"}`}
											onClick={() => setReadingMode("pagination")}
										>
											Pages
										</Button>
									</div>
								</div>

								<div className="mb-4">
									<p className="mb-2 text-sm font-medium">Zoom: {zoomLevel}%</p>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="icon"
											className="h-8 w-8 hover:bg-accent hover:text-accent-foreground hover:ring-2 flex justify-center items-center"
											onClick={() => setZoomLevel((prev) => Math.max(50, prev - 10))}
										>
											-
										</Button>
										<Slider
											value={[zoomLevel]}
											max={100}
											min={50}
											step={1}
											onValueChange={(value) => setZoomLevel(value[0])}
											className="w-full"
										/>
										<Button
											variant="outline"
											size="icon"
											className="h-8 w-8 hover:bg-accent hover:text-accent-foreground hover:ring-2 flex justify-center items-center"
											onClick={() => setZoomLevel((prev) => Math.min(200, prev + 10))}
										>
											+
										</Button>
									</div>
								</div>

								<Button
									variant="outline"
									size="sm"
									className="w-full hover:bg-accent hover:text-accent-foreground"
									onClick={toggleDarkMode}
								>
									{darkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
									{darkMode ? "Light Mode" : "Dark Mode"}
								</Button>
							</div>

							{/* Quick reading mode toggle button
							<Button
								variant="secondary"
								size="icon"
								className={cn(
									"fixed z-20 rounded-full shadow-lg transition-opacity duration-300 hover:bg-accent hover:text-accent-foreground",
									readingMode === "scroll" ? "bottom-4 right-4" : "bottom-20 right-4",
								)}
								onClick={toggleReadingMode}
							>
								{readingMode === "scroll" ? <BookOpen className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
								<span className="sr-only">
									{readingMode === "scroll" ? "Switch to pagination" : "Switch to scroll"}
								</span>
							</Button> */}

							{/* Chapter navigation buttons */}
							<div className="fixed left-4 right-4 bottom-1/2 z-20 flex justify-between">
								<MangaNavigation
									totalPages={manga.pages.length}
									currentPage={currentPage}
									currentChapter={manga.chapter_index}
									chapterTitle={manga.chapter_name}
									totalChapters={manga.all_chapter}
									onPageChange={handlePageChange}
									onPreviousChapter={prevChapter}
									onNextChapter={nextChapter}
									contentRef={contentRef}
								/>
							</div>
						</>
					)}
				</SidebarInset>
			</SidebarProvider>
		</div>
	)
}

