"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { BookOpen, ChevronDown, ChevronUp, Moon, Search, Star, Sun, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { cn } from "@/lib/utils"
import { useRouter } from "next/router"

export default function MangaDetail() {
    const [darkMode, setDarkMode] = useState(true)
    const [expandedSummary, setExpandedSummary] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const router = useRouter();
    const { detail } = router.query;
    const [manga, setManga] = useState(null);
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!detail) return;

        const fetchMangaInfo = async () => {
            try {
                const data = await window.ipc.getMangaDetails(detail);
                if (data) {
                    setManga(data);
                    setIsLoading(false)
                }
            } catch (error) {
                console.error("Error fetching manga info:", error);
            }
        };

        fetchMangaInfo();
    }, [detail, manga]);

    const toggleDarkMode = () => setDarkMode(!darkMode)
    const toggleSummary = () => setExpandedSummary(!expandedSummary)

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const toggleFavorited = () => {
        const newFavoritedStatus = !manga.manga_favorited;
        
        window.ipc.setMangaFavorited(detail, newFavoritedStatus)
    };
    

    return (
        <div className="h-screen overflow-hidden" >
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="sticky top-0 z-10 border-b bg-[#2f2e2e] rounded-md backdrop-blur supports-[backdrop-filter]:bg-[#2f2e2e]/60">
                        <div className="flex h-16 items-center justify-between px-4 md:px-6">
                            <div className="flex items-center gap-4">
                                <SidebarTrigger />
                                <h1 className="text-xl font-bold">Manga Reader</h1>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative hidden md:block">
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

                    <main className=" overflow-y-scroll h-screen py-10 pb-24 px-4 md:px-6 lg:px-8">
                        {isLoading ? (
                            <div className="flex h-screen items-center justify-center">
                                <p className="text-xl font-semibold">Loading...</p>
                            </div>
                        ) : (
                            <>
                                {/* Hero Banner with Blurred Background */}
                                <div className="relative h-[400px] w-full overflow-hidden rounded-lg">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-md opacity-20"
                                        style={{
                                            backgroundImage: `url("${manga.manga_cover}")`,
                                            transform: "scale(1.1)",
                                        }}
                                    ></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

                                    <div className="relative h-full">
                                        <div className="lg:grid flex flex-col h-full items-end gap-6 p-6 lg:grid-cols-[250px_1fr] lg:gap-12">
                                            {/* Cover Image */}
                                            <div className="relative h-full w-[250px] self-start overflow-hidden rounded-lg border shadow-xl">
                                                <Image
                                                    src={manga.manga_cover || "/placeholder.svg"}
                                                    alt={manga.manga_name}
                                                    fill
                                                    className="object-cover"
                                                    priority
                                                />
                                            </div>

                                            {/* Title and Info */}
                                            <div className="flex flex-col justify-end space-y-4">
                                                <div>
                                                    <h1 className="text-4xl font-bold tracking-tight text-white">{manga.manga_name}</h1>
                                                    {/* <p className="mt-2 text-xl text-muted-foreground">{manga.alternativeTitle}</p> */}
                                                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                                                        {/* <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 fill-primary text-primary" />
                                                    <span>{manga.rating}</span>
                                                </div> */}
                                                        {/* <div className="flex items-center gap-1">
                                                    <BookOpen className="h-4 w-4" />
                                                    <span>{manga.bookmarks} readers</span>
                                                </div> */}
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-4 w-4" />
                                                            <span>
                                                                {manga.manga_writer}, {manga.manga_penciller}
                                                            </span>
                                                        </div>
                                                        {/* <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        {manga.releaseYear}, {manga.status}
                                                    </span>
                                                </div> */}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2">
                                                    <Button className={`w-40 ${manga.manga_favorited == false ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} `} onClick={toggleFavorited}><Star className="h-2 w-2" />{manga.manga_favorited == 0 ? "Add To Favorited" : "Remove Favorited"}</Button>
                                                    {/* <Button variant="secondary" size="icon">
                                                        
                                                    </Button> */}
                                                    {/* <Button variant="secondary" size="icon">
                                                        <Flag className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="secondary" size="icon">
                                                        <Share2 className="h-4 w-4" />
                                                    </Button> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="py-8">
                                    {/* Genres */}
                                    <div className="mb-8 flex flex-wrap gap-2">
                                        {manga.genres && manga.genres.map((genre, index) => (
                                            <Badge key={index} className="bg-sky-800 px-2 py-1" variant="secondary">
                                                {genre}
                                            </Badge>
                                        ))}
                                    </div>

                                    {/* Summary */}
                                    <Card className="mb-8 overflow-hidden">
                                        <div className="px-6 py-2">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-xl font-semibold">Summary</h2>
                                                <Button variant="ghost" size="sm" onClick={toggleSummary}>
                                                    {expandedSummary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                            <p className={cn("mt-2 text-muted-foreground", expandedSummary ? "" : "line-clamp-3")}>
                                                {manga.manga_summary}
                                            </p>
                                        </div>
                                    </Card>

                                    {/* Chapters List */}
                                    <div className="">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h2 className="text-xl font-semibold">Chapters</h2>
                                            <span className="text-sm text-muted-foreground">{manga.chapters.length > 0 ? `${manga.chapters.length} Chapters` : "No Chapters Available"}</span>
                                        </div>
                                        <ScrollArea className="h-[500px]">
                                            <div className="space-y-4">
                                                {manga.chapters.length > 0 ? (
                                                    manga.chapters.map((item) => (
                                                        <Card key={item.chapter_index} className=" bg-[#2f2e2e] hover:bg-[#454444] py-0">
                                                            <Link
                                                                href={`/manga/${detail}/${item.chapter_index}`}
                                                                className="block px-4 transition-colors hover:bg-muted/50 py-6"
                                                                prefetch={false}
                                                            >
                                                                <div className="flex justify-between">
                                                                    <div>
                                                                        <h3 className="font-medium">{item.chapter_name}</h3>
                                                                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                                                            <span>{item.chapter_size} pages</span>
                                                                        </div>
                                                                    </div>
                                                                    {/* <div className="flex items-center text-sm text-muted-foreground">
                                                                <Calendar className="mr-1 h-4 w-4" />
                                                                {chapter.releaseDate}
                                                            </div> */}
                                                                </div>
                                                            </Link>
                                                        </Card>
                                                    ))) : (
                                                    <p className="text-gray-400">No chapters available</p>

                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>
                            </>
                        )}

                    </main>

                    <footer className="border-t py-6">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
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

