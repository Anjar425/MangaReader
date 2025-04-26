import { Moon, Sun } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";

const Header = () => {
    const { theme, setTheme } = useTheme()

    return (
        <header className="sticky top-0 z-10 border-b border-l border-r rounded-b-md bg-background-2/30 backdrop-blur-sm supports-[backdrop-filter]:bg-background-2/60">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <h1 className="text-xl font-bold">Manga Reader</h1>
                </div>
                <div className="flex items-center gap-4">
                    {/* <div className="relative hidden md:block bg-[#454444]/60 rounded-md">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search manga..."
                            className="w-[200px] lg:w-[300px] pl-8"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div> */}
                    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default Header;
