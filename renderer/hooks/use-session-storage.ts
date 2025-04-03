"use client"

import { useEffect, useState } from "react"

export function useSessionStorage(
    searchQuery: string,
    selectedGenres: string[],
    currentPage: number,
    itemsPerPage: number,
    setSearchQuery: (query: string) => void,
    setSelectedGenres: (genres: string[]) => void,
    setItemsPerPage: (count: number) => void,
    setCurrentPage: (page: number) => void,
    setIsLoading: (isLoading: boolean) => void
) {
    const sessionData: {
        key: string;
        setter: (value: any) => void;
        parser: (value: string | null) => any;
    }[] = [
        { key: "searchQuery", setter: setSearchQuery, parser: (v) => v || "" },
        { key: "selectedGenres", setter: setSelectedGenres, parser: (v) => v ? JSON.parse(v) : [] },
        { key: "itemsPerPage", setter: setItemsPerPage, parser: (v) => Number.parseInt(v || "20", 10) },
        { key: "currentPage", setter: setCurrentPage, parser: (v) => Number.parseInt(v || "1", 10) },
    ];    

    useEffect(() => {
        if (typeof window === "undefined") return

        const handleGetLastLocation = async () => {
            const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

            for (const { key, setter, parser } of sessionData) {
                const value = sessionStorage.getItem(key);
                setter(parser(value));
                await delay(1);
            }

            setIsLoading(false);
            // Retrieve saved scroll position
            const savedScroll = sessionStorage.getItem("scrollLocation")
            if (savedScroll) {
                setTimeout(() => {
                    const mainElement = document.getElementsByTagName("main")[1]
                    if (mainElement) {
                        mainElement.scrollTo({ top: Number(savedScroll), behavior: "smooth" })
                    }
                }, 300)
            }

            // Clean up session storage
            await delay(1000)
            sessionStorage.removeItem("itemsPerPage")
            sessionStorage.removeItem("currentPage")
            sessionStorage.removeItem("scrollLocation")
            sessionStorage.removeItem("selectedGenres")
            sessionStorage.removeItem("searchQuery")
        }

        handleGetLastLocation()
    }, [])

    // Save current state to session storage
    const saveLocation = () => {
        if (typeof window === "undefined") return

        const mainElement = document.getElementsByTagName("main")[1]
        if (mainElement) {
            sessionStorage.setItem("itemsPerPage", String(itemsPerPage))
            sessionStorage.setItem("currentPage", String(currentPage))
            sessionStorage.setItem("scrollLocation", String(mainElement.scrollTop))
            sessionStorage.setItem("selectedGenres", JSON.stringify(selectedGenres))
            sessionStorage.setItem("searchQuery", searchQuery)
        }
    }

    return { saveLocation }
}

