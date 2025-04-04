import { Dispatch, SetStateAction } from "react"

interface Manga {
    ID: number
    Name: string
    Cover: string
    Penciller: string
    Writer: string
    Genre: string[]
    TotalChapters: number
}

interface ChapterList {
    Index: number,
    Name: string,
    Path: string,
    Size: number
}

interface Chapter {
    Index: number,
    MangaName: string,
    ChapterName: string,
    ChapterPath: string,
    ImageList: string[],
    ChapterList: ChapterList[]
}

interface GenreSelectorProps {
    allGenres: string[]
    selectedGenres: string[]
    setSelectedGenres: Dispatch<SetStateAction<string[]>>
    toggleGenre: (genre: string) => void
}

interface MangaDetails {
    Name: string,
    Cover: string,
    Penciller: string,
    Writer: string,
    Summary: string
    Favorited: boolean
    Genres: string[],
    ChapterList: ChapterList[]
}

interface MangaNavigationProps {
    totalPages: number
    currentPage?: number
    currentChapter?: number
    chapterTitle?: string
    totalChapters?: number
    onPageChange?: (page: number) => void
    onPreviousChapter?: () => void
    onNextChapter?: () => void
    contentRef?: React.RefObject<HTMLElement>
    className?: string
}


export type { Manga, Chapter, GenreSelectorProps, MangaDetails, MangaNavigationProps }