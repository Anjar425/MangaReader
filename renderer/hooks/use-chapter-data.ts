import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Chapter } from "@/interfaces/types"

const useChapterData = () => {
    const [chapterData, setChapterData] = useState<Chapter>(null)
    const [isLoading, setIsLoading] = useState(true)

    const params = useParams()
    const detail = params?.detail as string
    const id = params?.id as string

    useEffect(() => {
        setIsLoading(true)
        const fetchData = async () => {
            if (!detail || !id) return

            try {
                // Using a try-catch to handle potential IPC errors
                const getChapterDetails = async () => {
                    try {
                        return await window.ipc.getChapterDetails(Number.parseInt(detail), Number.parseInt(id))
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

                const data: Chapter = await getChapterDetails()
                const imageData = await getImages(data.ChapterPath)


                setChapterData({
                    Index: data.Index,
                    MangaName: data.MangaName,
                    ChapterName: data.ChapterName,
                    ChapterPath: data.ChapterPath,
                    ImageList: imageData,
                    ChapterList: data.ChapterList
                })

                setIsLoading(false)
            } catch (error) {
                console.error("Error fetching manga info:", error)
                setIsLoading(false)
            }
        }

        fetchData()
    }, [detail, id])

    return { chapterData, isLoading, detail, id }
}

export { useChapterData }
