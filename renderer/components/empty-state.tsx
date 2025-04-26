import { BookOpen } from "lucide-react";

const EmptyState = () => {
    return (
        <div className="flex h-[50vh] flex-col items-center justify-center text-center">
            <BookOpen className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">No manga found</h2>
            <p className="mt-2 text-muted-foreground">Try adjusting your search or add some manga to your library</p>
        </div>
    )
}

export default EmptyState