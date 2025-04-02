import { Calendar, Home, Inbox, Search, Settings, User } from "lucide-react"

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

// Sample navigation items
const navItems = [
  {
    title: "Home",
    icon: Home,
    url: "#",
  },
  {
    title: "Inbox",
    icon: Inbox,
    url: "#",
    isActive: true,
  },
  {
    title: "Calendar",
    icon: Calendar,
    url: "#",
  },
  {
    title: "Search",
    icon: Search,
    url: "#",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "#",
  },
]

export function AppSidebar() {
  return (
    <Sidebar variant="floating" >
      <SidebarHeader className="pb-2">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
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
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
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

