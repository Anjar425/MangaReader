import { Book, Home, Star, User } from "lucide-react"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useRouter } from "next/router"


const AppSidebar = () => {
	const router = useRouter();
	const currentPath = router.pathname;

	const navItems = [
		{ title: "Home", icon: Home, url: "/" },
		{ title: "Local", icon: Book, url: "/local" },
		{ title: "Favorite", icon: Star, url: "/favorite" },
	].map((item) => ({
		...item,
		isActive: currentPath === item.url,
	}));

	return (
		<Sidebar variant="floating">
			<SidebarHeader className="pb-2">
				<div className="flex items-center gap-2 px-4 py-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-md">
						<User className="h-4 w-4" />
					</div>
					<div>
						<p className="text-sm font-medium">Dashboard</p>
						<p className="text-xs text-muted-foreground">Workspace</p>
					</div>
				</div>
			</SidebarHeader>
			<SidebarContent >
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild isActive={item.isActive}>
										<Link href={item.url}>
											<item.icon className="h-4 w-4" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Recent Projects</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{["Marketing Website", "Mobile App", "Analytics Dashboard"].map((project) => (
								<SidebarMenuItem key={project}>
									<SidebarMenuButton asChild>
										<a href="#">
											<span>{project}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<div className="p-2">
					<div className="rounded-md bg-muted p-2">
						<p className="text-xs font-medium">Pro Plan</p>
						<p className="text-xs text-muted-foreground">12 days remaining</p>
						<div className="mt-2 h-1.5 w-full rounded-full bg-background">
							<div className="h-1.5 w-1/3 rounded-full bg-primary"></div>
						</div>
					</div>
				</div>
			</SidebarFooter>
		</Sidebar>
	)
}

export default AppSidebar