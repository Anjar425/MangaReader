import Link from "next/link"
import { Book, Compass, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
    const handleOpenDirectory = async () => {
        const result = await window.ipc.setLocalDir();
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="py-6 border-b">
                <div className=" px-4 md:px-6">
                    <h1 className="text-3xl font-bold text-center">MangaReader</h1>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold mb-6">Welcome to MangaReader</h2>
                        <p className="text-muted-foreground mb-8">Your personal manga library and reader</p>
                    </div>

                    <div className="space-y-4">
                        <Button asChild variant="default" className="w-full h-16 text-lg bg-sky-800 hover:bg-sky-600" size="lg">
                            <Link href="/local" className="flex items-center justify-center gap-2">
                                <Book className="h-6 w-6" />
                                <span>Local Manga</span>
                            </Link>
                        </Button>

                        <Button asChild variant="default" className="w-full h-16 text-lg bg-sky-800 hover:bg-sky-600" size="lg">
                            <Link href="/browse" className="flex items-center justify-center gap-2">
                                <Compass className="h-6 w-6" />
                                <span>Browse Manga</span>
                            </Link>
                        </Button>

                        <Button onClick={handleOpenDirectory} asChild variant="outline" className="w-full h-16 text-lg bg-[#2f2e2e] hover:bg-[#454444] cursor-pointer" size="lg">
                            <div className="flex items-center justify-center gap-2">
                                <Settings className="h-6 w-6" />
                                <span>Settings</span>
                            </div>
                        </Button>
                    </div>
                </div>
            </main>

            <footer className="py-4 border-t">
                <div className=" px-4 md:px-6">
                    <p className="text-center text-sm text-muted-foreground">MangaReader © {new Date().getFullYear()}</p>
                </div>
            </footer>
        </div>
    )
}

