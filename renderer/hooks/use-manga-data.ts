"use client"

import { useState, useEffect } from "react"

interface Manga {
  ID: number
  Name: string
  Cover: string
  Penciller: string
  Writer: string
  Genre: string[]
  TotalChapters: number
}

export function useMangaData() {
  const [mangaList, setMangaList] = useState<Manga[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredManga, setFilteredManga] = useState<Manga[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isMounted, setIsMounted] = useState(false)

  // Only run client-side code after component mounts
  useEffect(() => {
    setIsMounted(true)

    const fetchMangaList = async () => {
      try {
        // Only access browser APIs after component is mounted
        if (typeof window !== "undefined" && window.ipc) {
          const data = await window.ipc.getMangaList()
          setMangaList(data)
          setFilteredManga(data)
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching manga list:", error)
        setIsLoading(false)
      }
    }

    fetchMangaList()
  }, [])



  return {
    mangaList,
    filteredManga,
    setFilteredManga,
    searchQuery,
    setSearchQuery,
    isLoading,
	setIsLoading,
    isMounted,
  }
}

