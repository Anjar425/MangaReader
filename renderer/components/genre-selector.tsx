import { Check, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

const GenreSelector = ({ allGenres, selectedGenres, setSelectedGenres, toggleGenre }) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <div>
                    <Button variant="outline" className="justify-between hover:ring-[1px] hover:ring-amber-500 ">
                        {selectedGenres.length > 0
                            ? `${selectedGenres.length} genre${selectedGenres.length > 1 ? "s" : ""} selected`
                            : "Select genres"}
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="popover-content z-0"
                align="start"
            >
                <Command>
                    <CommandInput placeholder="Search genres..." />
                    <CommandList>
                        <CommandEmpty>No genres found.</CommandEmpty>
                        <CommandGroup>
                            <div className="p-2 overflow-hidden">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Genres</span>
                                    {selectedGenres.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedGenres([])}
                                            className="h-auto py-1 px-2 text-xs"
                                        >
                                            Clear all
                                        </Button>
                                    )}
                                </div>
                                <ScrollArea className="h-60">
                                    <div className="grid grid-cols-1 gap-1">
                                        {allGenres.map((genre) => (
                                            <CommandItem
                                                key={genre}
                                                onSelect={() => toggleGenre(genre)}
                                                className="flex items-center gap-2 cursor-pointer"
                                            >
                                                <div
                                                    className={cn(
                                                        "flex h-4 w-4 items-center justify-center rounded-sm border",
                                                        selectedGenres.includes(genre)
                                                            ? "border-primary bg-primary text-primary-foreground"
                                                            : "border-muted",
                                                    )}
                                                >
                                                    {selectedGenres.includes(genre) && <Check className="h-3 w-3" />}
                                                </div>
                                                <span>{genre}</span>
                                            </CommandItem>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default GenreSelector