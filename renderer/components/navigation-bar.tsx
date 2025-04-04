import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MangaNavigationProps } from "@/interfaces/types"

const MangaNavigation = ({
    totalPages,
    currentPage,
    currentChapter,
    chapterTitle,
    totalChapters,
    onPageChange,
    onPreviousChapter,
    onNextChapter,
    contentRef,
    className,
}: MangaNavigationProps) => {
    const [page, setPage] = useState(currentPage)
    const [isDragging, setIsDragging] = useState(false)
    const trackRef = useRef<HTMLDivElement>(null)
    const isManuallyChangingRef = useRef(false)

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const isMouseAtBottom = event.clientY > innerHeight * 0.7;
            const isMouseAtCenter = event.clientX > innerWidth * 0.3 && event.clientX < innerWidth * 0.8;

            setIsVisible(isMouseAtBottom && isMouseAtCenter);
        };

        document.addEventListener("mousemove", handleMouseMove);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    // Update internal state when props change
    useEffect(() => {
        setPage(currentPage)
    }, [currentPage])

    // Handle scroll events to update the slider position
    useEffect(() => {
        if (!contentRef?.current) return

        const contentElement = contentRef.current

        const handleScroll = () => {
            // Skip if we're manually changing pages with the slider
            if (isManuallyChangingRef.current) return

            // Simple calculation based on scroll position
            const scrollHeight = contentElement.scrollHeight - contentElement.clientHeight
            const scrollTop = contentElement.scrollTop

            // Avoid division by zero
            if (scrollHeight <= 0) return

            // Calculate scroll percentage
            const scrollPercentage = Math.min(1, Math.max(0, scrollTop / scrollHeight))

            // Map to page number (1-based)
            const calculatedPage = Math.max(1, Math.min(totalPages, Math.ceil(scrollPercentage * totalPages)))

            // Only update if the page has changed
            if (calculatedPage !== page) {
                setPage(calculatedPage)
                onPageChange(calculatedPage)
            }
        }

        // Add passive: true for better scroll performance
        contentElement.addEventListener("scroll", handleScroll, { passive: true })

        return () => {
            contentElement.removeEventListener("scroll", handleScroll)
        }
    }, [contentRef, page, totalPages, onPageChange])

    // Scroll to the appropriate page when slider is moved
    const scrollToPage = (pageNumber: number) => {
        if (!contentRef?.current) return

        const contentElement = contentRef.current
        const scrollHeight = contentElement.scrollHeight - contentElement.clientHeight

        // Calculate target scroll position based on page number
        const scrollPercentage = (pageNumber - 1) / (totalPages - 1)
        const targetScrollPosition = scrollPercentage * scrollHeight

        // Set flag to prevent scroll handler from updating during programmatic scroll
        isManuallyChangingRef.current = true

        // Perform the scroll
        contentElement.scrollTo({
            top: targetScrollPosition,
            behavior: "smooth",
        })

        // Function to reset manual scrolling flag
        const resetManualScroll = () => {
            isManuallyChangingRef.current = false;
            document.removeEventListener("mouseup", resetManualScroll);
            document.removeEventListener("touchend", resetManualScroll);
        };

        // Listen for mouse up or touch end to reset flag
        document.addEventListener("mouseup", resetManualScroll);
        document.addEventListener("touchend", resetManualScroll);
    }

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
            setPage(newPage)
            onPageChange(newPage)
            scrollToPage(newPage)
        }
    }

    const isPreviousChapterDisabled = currentChapter <= 1
    const isNextChapterDisabled = currentChapter >= totalChapters

    // Calculate the position percentage for the thumb
    const thumbPosition = totalPages > 1 ? ((page - 1) / (totalPages - 1)) * 100 : 0

    // Handle track click to change page
    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!trackRef.current) return

        const rect = trackRef.current.getBoundingClientRect()
        const position = (e.clientX - rect.left) / rect.width
        const newPage = Math.max(1, Math.min(totalPages, Math.round(position * totalPages)))
        handlePageChange(newPage)
    }

    // Set up drag handlers
    const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault()

        if (!trackRef.current) return
        setIsDragging(true)

        // Store the track element reference
        const track = trackRef.current

        // Handle drag movement
        const handleDrag = (moveEvent: MouseEvent) => {
            const rect = track.getBoundingClientRect()
            const position = (moveEvent.clientX - rect.left) / rect.width
            const newPage = Math.max(1, Math.min(totalPages, Math.round(position * totalPages)))

            if (newPage !== page) {
                setPage(newPage)
                onPageChange(newPage)
                scrollToPage(newPage)
            }
        }

        // Handle drag end
        const handleMouseUp = () => {
            setIsDragging(false)
            document.removeEventListener("mousemove", handleDrag)
            document.removeEventListener("mouseup", handleMouseUp)
        }

        document.addEventListener("mousemove", handleDrag)
        document.addEventListener("mouseup", handleMouseUp)
    }

    return (
        <div
            className={cn(
                "fixed bottom-4 left-0 right-0 z-50 flex justify-center transition-all duration-300 transform",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
            )}
        >            <div className="dark bg-[#1a1919]/90 backdrop-blur-sm border border-border rounded-full shadow-lg p-2 px-3 flex items-center justify-between gap-2 max-w-md w-[90%] transition-all duration-300 hover:bg-[#1a1919]/100">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onPreviousChapter}
                    disabled={isPreviousChapterDisabled}
                    aria-label="Previous chapter"
                    className="h-8 w-8 rounded-full"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex-1 flex flex-col gap-0.5 px-1">
                    {/* Custom slider with page indicators */}
                    <div className="relative w-full h-8 flex items-center">
                        {/* Slider track */}
                        <div
                            ref={trackRef}
                            className="absolute w-full h-2 bg-[#2e2e2e] rounded-full overflow-hidden cursor-pointer"
                            onClick={handleTrackClick}
                        >
                            {/* Slider progress */}
                            <div className="absolute h-full bg-gray-400 rounded-full" style={{ width: `${thumbPosition}%` }} />

                            {/* Page indicators inside the track */}
                            {Array.from({ length: totalPages }).map((_, index) => {
                                const isCurrentPage = index + 1 === page
                                const position = totalPages > 1 ? `${(index / (totalPages - 1)) * 100}%` : "0%"

                                return (
                                    <div
                                        key={index}
                                        className={cn(
                                            "absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full cursor-pointer transition-all duration-200",
                                            isCurrentPage ? "bg-gray-400 scale-125" : "bg-gray-400/40",
                                        )}
                                        style={{ left: position }}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handlePageChange(index + 1)
                                        }}
                                    />
                                )
                            })}
                        </div>

                        {/* Slider thumb - larger and more prominent */}
                        <div
                            className={cn(
                                "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-gray-200 ring-white-2 rounded-full shadow-md border-2 border- transition-all duration-200",
                                isDragging ? "scale-110 cursor-grabbing" : "hover:scale-110 cursor-grab",
                            )}
                            style={{
                                left: `${thumbPosition}%`,
                            }}
                            onMouseDown={startDrag}
                            role="slider"
                            aria-valuemin={1}
                            aria-valuemax={totalPages}
                            aria-valuenow={page}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "ArrowLeft") {
                                    handlePageChange(Math.max(1, page - 1))
                                } else if (e.key === "ArrowRight") {
                                    handlePageChange(Math.min(totalPages, page + 1))
                                }
                            }}
                        />
                    </div>

                    <div className="text-center text-xs text-muted-foreground">
                        {page}/{totalPages} • {chapterTitle}
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onNextChapter}
                    disabled={isNextChapterDisabled}
                    aria-label="Next chapter"
                    className="h-8 w-8 rounded-full"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export default MangaNavigation