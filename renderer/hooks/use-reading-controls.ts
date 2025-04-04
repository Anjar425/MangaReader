import { useState, useEffect, useRef, type RefObject } from "react"
import { useRouter } from "next/router"
import { Chapter } from "@/interfaces/types"

const useReadingControls = (chapter: Chapter, contentRef: RefObject<HTMLDivElement>) => {
    const [readingMode, setReadingMode] = useState<"scroll" | "pagination">("scroll")
    const [currentPage, setCurrentPage] = useState(1)
    const [zoomLevel, setZoomLevel] = useState(70)
    const currentPageRef = useRef(1)
    const router = useRouter()

    // Handle page change
    const handlePageChange = (page: number) => {
        if (!contentRef.current || !chapter) return

        if (page >= 1 && page <= chapter.ImageList.length) {
            currentPageRef.current = page
            setCurrentPage(page)
        }
    }

    // Navigate to next page
    const nextPage = () => {
        if (!chapter) return

        if (currentPage < chapter.ImageList.length) {
            setCurrentPage((prev) => prev + 1)
        } else if (chapter.ImageList.length > chapter.Index) {
            setCurrentPage(1)
            nextChapter()
        }
    }

    // Navigate to previous page
    const prevPage = () => {
        if (!chapter) return

        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1)
        } else if (chapter.Index > 0) {
            setCurrentPage(chapter.ImageList.length || 1)
            prevChapter()
        }
    }

    const nextChapter = () => {
        if (!chapter || chapter.ImageList.length < chapter.Index) return
        router.push(`/chapter/${router.query.detail}/${chapter.Index + 1}`)
    }

    const prevChapter = () => {
        if (!chapter || chapter.Index < 0) return
        router.push(`/manga/${router.query.detail}/${chapter.Index - 1}`)
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
    }, [readingMode, currentPage, chapter])

    return {
        readingMode,
        setReadingMode,
        currentPage,
        zoomLevel,
        setZoomLevel,
        handlePageChange,
        nextPage,
        prevPage,
        nextChapter,
        prevChapter,
    }
}

export { useReadingControls }