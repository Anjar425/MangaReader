import { MangaDetails } from "@/interfaces/types";
import { useEffect, useState } from "react";

const useMangaDetails = (param: number) => {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [mangaDetails, setMangaDetails] = useState<MangaDetails>(null)

    useEffect(() => {
        if (!param) return;
    
        setIsLoading(true);
        setMangaDetails(null); // Reset sebelum fetch agar tidak pakai data lama
    
        const fetchMangaInfo = async () => {
            try {
                const data = await window.ipc.getMangaDetails(param);
                if (data) {
                    setMangaDetails(data);
                }
            } catch (error) {
                console.error("Error fetching manga info:", error);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchMangaInfo();
    }, [param]);
    

    return {
        mangaDetails,
        setMangaDetails,
        isLoading,
        setIsLoading
    }
}

export { useMangaDetails }