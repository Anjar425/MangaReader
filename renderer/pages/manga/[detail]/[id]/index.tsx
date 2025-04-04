"use client"

import { Dispatch, RefObject, SetStateAction, useRef } from "react"
import Link from "next/link"
import { Home, List, Moon, Settings, Sun, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import { cn } from "@/lib/utils"
import MangaNavigation from "@/components/navigation-bar"
import { useReadingControls } from "@/hooks/use-reading-controls"
import { useUIControls } from "@/hooks/use-ui-controls"
import { useChapterData } from "@/hooks/use-chapter-data"
import LoadingState from "@/components/loading-state"
import Image from "next/image"
import { Slider } from "@/components/ui/slider"
import { useRouter } from "next/router"
import { Chapter } from "@/interfaces/types"
import { useThemeToggle } from "@/hooks/use-theme-toggle"
import { useMounted } from "@/hooks/use-mounted"
import { useTheme } from "next-themes"

const ChapterReader = () => {
	const contentRef = useRef<HTMLDivElement>(null)

	const { chapterData, isLoading, detail } = useChapterData();

	const {
		isSettingsOpen,
		isChapterListOpen,
		handleMouseMove,
		toggleSettings,
		toggleChapterList,
	} = useUIControls()

    const { theme, setTheme } = useTheme()

	const {
		readingMode,
		setReadingMode,
		currentPage,
		zoomLevel,
		setZoomLevel,
		handlePageChange,
		nextPage,
		prevPage,
		nextChapter,
		prevChapter
	} = useReadingControls(chapterData, contentRef)

	// Use Mounted to Prevent Hydration
	const mounted = useMounted();
	if (!mounted) return null

	// Fallback for when manga data is not available
	if (!isLoading && !chapterData) {
		return (
			<div className="flex h-screen items-center justify-center">
				<p className="text-xl font-semibold">Failed to load manga data</p>
			</div>
		)
	}

	return (
		<div
			className={cn("min-h-screen flex flex-col h-screen overflow-hidden", theme ? "dark" : "")}
			onMouseMove={handleMouseMove}
		>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset className="flex-1 flex flex-col overflow-hidden">
					{isLoading ? (
						<div className="flex h-screen items-center justify-center">
							<LoadingState />
						</div>
					) : (
						<>
							{/* Header - always visible */}
							<Header chapterData={chapterData} toggleSettings={toggleSettings} toggleChapterList={toggleChapterList} />

							{/* Main content */}
							<main ref={contentRef} className="flex-1 overflow-y-auto">
								<div className={`mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)]`}>
									{readingMode === "scroll" ? (
										<ScrollView chapterData={chapterData} zoomLevel={zoomLevel} />
									) : (
										<PaginationView
											chapterData={chapterData}
											zoomLevel={zoomLevel}
											currentPage={currentPage}
											nextPage={nextPage}
											prevPage={prevPage}
										/>
									)}
								</div>
							</main>

							{/* Chapter list sidebar */}
							<ChapterList chapterData={chapterData} param={detail} isOpen={isChapterListOpen} onClose={toggleChapterList} />

							{/* Settings panel */}
							<SettingsPanel
								isOpen={isSettingsOpen}
								readingMode={readingMode}
								setReadingMode={setReadingMode}
								zoomLevel={zoomLevel}
								setZoomLevel={setZoomLevel}
								theme={theme}
								setTheme={setTheme}
							/>

							{/* Chapter navigation buttons */}
							<div className="fixed left-4 right-4 bottom-1/2 z-20 flex justify-between">
								<MangaNavigation
									totalPages={chapterData.ImageList.length}
									currentPage={currentPage}
									currentChapter={chapterData.Index}
									chapterTitle={chapterData.ChapterName}
									totalChapters={chapterData.ChapterList.length}
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

// Header component
const Header = ({ 
	chapterData,
	toggleSettings, 
	toggleChapterList 
}: {
	chapterData: Chapter,
	toggleSettings: () => void,
	toggleChapterList: () => void
}) => {
	return (
		<header className="sticky top-0 z-10 border-b bg-[#2f2e2e] rounded-md backdrop-blur supports-[backdrop-filter]:bg-[#2f2e2e]/60">
			<div className="flex h-16 items-center justify-between px-4 md:px-6">
				<div className="flex items-center gap-4">
					<SidebarTrigger />
					<Link href="/local" className="flex items-center gap-2">
						<Home className="h-5 w-5" />
						<span className="font-medium">{chapterData.MangaName}</span>
					</Link>
					<span className="text-sm text-muted-foreground">{chapterData.ChapterName}</span>
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
	)
}

// Pagination View Component
const PaginationView = ({
	chapterData,
	zoomLevel,
	currentPage,
	nextPage,
	prevPage,
}: {
	chapterData: Chapter
	zoomLevel: number
	currentPage: number
	nextPage: () => void
	prevPage: () => void
}) => {
	if (!chapterData || !chapterData.ImageList || chapterData.ImageList.length === 0) return null

	return (
		<div className="mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)]">
			<div className="relative mx-auto" style={{ width: `${zoomLevel}%` }}>
				<Image
					src={chapterData.ImageList[currentPage - 1] || "/placeholder.svg?height=1400&width=900"}
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
						disabled={currentPage === 1 && chapterData.Index <= 0}
					>
						<span className="sr-only">Previous page</span>
					</button>
					<button
						className="w-1/2 h-full focus:outline-none"
						onClick={nextPage}
						disabled={currentPage === chapterData.ImageList.length && chapterData.Index < chapterData.ChapterList.length}
					>
						<span className="sr-only">Next page</span>
					</button>
				</div>
			</div>
		</div>
	)
}

//Scroll View Component
const ScrollView = ({ chapterData, zoomLevel }: { chapterData: Chapter, zoomLevel }) => {
	if (!chapterData || !chapterData.ImageList) return null

	return (
		<div style={{ width: `${zoomLevel}%` }}>
			<div className="space-y-4 flex flex-col justify-center">
				{chapterData.ImageList.map((image, index) => (
					<div key={index}>
						<Image
							src={image || "/placeholder.svg?height=1400&width=900"}
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
	)
}

// Settings Panel Component
const SettingsPanel = ({
	isOpen,
	readingMode,
	setReadingMode,
	zoomLevel,
	setZoomLevel,
	theme,
	setTheme
}: {
	isOpen: boolean,
	readingMode: "pagination" | "scroll",
	setReadingMode: Dispatch<SetStateAction<"pagination" | "scroll">>,
	zoomLevel: number,
	setZoomLevel: Dispatch<SetStateAction<number>>,
	theme: string,
	setTheme: Dispatch<SetStateAction<string>>
}) => {
	return (
		<div
			className={cn(
				"fixed right-0 top-16 z-50 w-80 rounded-md border bg-[#1a1919] p-4 shadow-md transition-opacity duration-300",
				isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
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
				onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			>
				{theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
				{theme === "dark" ? "Light Mode" : "Dark Mode"}
			</Button>
		</div>
	)
}

// Chpater List Component
const ChapterList = ({ 
	chapterData, 
	param, 
	isOpen, 
	onClose 
}: { 
	chapterData: Chapter, 
	param: string , 
	isOpen: boolean, 
	onClose: () => void 
}) => {
	const router = useRouter()

	if (!chapterData || !chapterData.ChapterList) return null

	return (
		<div
			className={cn(
				"fixed inset-y-0 right-0 z-50 w-80 border-l bg-[#1a1919] p-4 shadow-md transition-transform duration-300 ease-in-out",
				isOpen ? "translate-x-0" : "translate-x-full",
			)}
		>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold">Chapters</h2>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
					onClick={onClose}
				>
					<X className="h-4 w-4" />
				</Button>
			</div>

			<div className="space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto">
				{chapterData.ChapterList.map((item) => (
					<Button
						key={item.Index}
						variant={item.Index === chapterData?.Index ? "default" : "ghost"}
						className={`${item.Index === chapterData?.Index ? "text-sky-600 font-bold " : ""} w-full justify-start hover:bg-accent hover:text-accent-foreground cursor-pointer`}
						onClick={() => {
							router.push(`/manga/${param}/${item.Index}`)
						}}
					>
						{item.Name}
					</Button>
				))}
			</div>
		</div>
	)
}

export default ChapterReader