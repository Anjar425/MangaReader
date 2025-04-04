import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

const PaginationControls = ({ currentPage, totalPages, itemsPerPage, filteredMangaLength, handlePageChange, handleItemsPerPageChange }) => {
    return (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Items per page:</span>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-[80px] cursor-pointer">
                        <SelectValue placeholder="20" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2f2e2e] cursor-pointer">
                        <SelectItem className="hover:bg-[#454444] cursor-pointer" value="20">
                            20
                        </SelectItem>
                        <SelectItem className="hover:bg-[#454444] cursor-pointer" value="50">
                            50
                        </SelectItem>
                        <SelectItem className="hover:bg-[#454444] cursor-pointer" value="100">
                            100
                        </SelectItem>
                    </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredMangaLength)} of{" "}
                    {filteredMangaLength}
                </span>
            </div>

            <div className="flex items-center gap-1 cursor-pointer">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers */}
                <div className="flex items-center">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                            pageNum = i + 1
                        } else if (currentPage <= 3) {
                            pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                        } else {
                            pageNum = currentPage - 2 + i
                        }

                        return (
                            <Button
                                key={i}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                className={`mx-1 h-8 w-8 transition-transform duration-300 cursor-pointer ${currentPage === pageNum ? "bg-sky-800" : ""
                                    }`}
                                onClick={() => handlePageChange(pageNum)}
                            >
                                {pageNum}
                            </Button>
                        )
                    })}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="cursor-pointer"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export default PaginationControls