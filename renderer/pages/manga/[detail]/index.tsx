"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, ChevronUp, Star, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import { cn } from "@/lib/utils"
import { useMangaDetails } from "@/hooks/use-manga-details"
import Header from "@/components/header"
import LoadingState from "@/components/loading-state"
import { useParams } from "next/navigation"
import { useMounted } from "@/hooks/use-mounted"

const MangaDetail = () => {
    const [expandedSummary, setExpandedSummary] = useState(false)

    const params = useParams()
    const detail = params?.detail as string

    const { mangaDetails, isLoading } = useMangaDetails(parseInt(detail))

    const toggleSummary = () => setExpandedSummary(!expandedSummary)

    const toggleFavorited = () => {
        const newFavoritedStatus = !mangaDetails.Favorited;

        window.ipc.setMangaFavorited(parseInt(detail), newFavoritedStatus)
    };

    // Use Mounted to Prevent Hydration
	const mounted = useMounted();
	if (!mounted) return null

    return (
        <div className="h-screen overflow-hidden" >
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <Header/>

                    <main className=" overflow-y-scroll h-screen py-10 pb-24 px-4 md:px-6 lg:px-8">
                        {isLoading ? (
                            <LoadingState />
                        ) : (
                            <>
                                {/* Hero Banner */}
                                <HeroBanner
                                    mangaDetails={mangaDetails}
                                    toggleFavorited={toggleFavorited}
                                />

                                {/* Content */}
                                <div className="py-8">
                                    {/* Genres */}
                                    <div className="mb-8 flex flex-wrap gap-2">
                                        {mangaDetails.Genres && mangaDetails.Genres.map((genre, index) => (
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
                                                {mangaDetails.Summary}
                                            </p>
                                        </div>
                                    </Card>

                                    {/* Chapters List */}
                                    <ChapterList mangaDetails={mangaDetails} detail={detail} />
                                </div>
                            </>
                        )}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}

const HeroBanner = ({ mangaDetails, toggleFavorited }) => {
    return (
        // {/* Hero Banner with Blurred Background */ }
        <div className="relative h-[400px] w-full overflow-hidden rounded-lg border-line-1 border-[1px]" >
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-md opacity-20"
                style={{
                    backgroundImage: `url("${mangaDetails.Cover}")`,
                    transform: "scale(1.1)",
                }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

            <div className="relative h-full">
                <div className="lg:grid flex flex-col h-full items-end gap-6 p-6 lg:grid-cols-[250px_1fr] lg:gap-12">
                    {/* Cover Image */}
                    <div className="relative h-full w-[250px] self-start overflow-hidden rounded-lg border shadow-xl">
                        <Image
                            src={mangaDetails.Cover || "/placeholder.svg"}
                            alt={mangaDetails.Name}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Title and Info */}
                    <div className="flex flex-col justify-end space-y-4">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-foreground-2">{mangaDetails.Name}</h1>
                            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1 font-normal text-foreground-3">
                                    <User className="h-4 w-4" />
                                    <span>
                                        {mangaDetails.Writer}, {mangaDetails.Penciller}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button className={`w-40 ${mangaDetails.Favorited == false ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} `} onClick={toggleFavorited}><Star className="h-2 w-2" />{mangaDetails.Favorited == false ? "Add To Favorited" : "Remove Favorited"}</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const ChapterList = ({ mangaDetails, detail }) => {
    return (
        <div className="">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Chapters</h2>
                <span className="text-sm text-muted-foreground">{mangaDetails.ChapterList.length > 0 ? `${mangaDetails.ChapterList.length} Chapters` : "No Chapters Available"}</span>
            </div>
            <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                    {mangaDetails.ChapterList.length > 0 ? (
                        mangaDetails.ChapterList.map((item) => (
                            <Card key={item.Index} className=" bg-background-2 hover:bg-background-3 duration-200 py-0">
                                <Link
                                    href={`/manga/${detail}/${item.Index}`}
                                    className="block px-4 transition-colors hover:bg-muted/50 py-6"
                                    prefetch={false}
                                >
                                    <div className="flex justify-between">
                                        <div>
                                            <h3 className="font-medium">{item.Name}</h3>
                                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{item.Size} pages</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </Card>
                        ))) : (
                        <p className="text-gray-400">No chapters available</p>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}

export default MangaDetail