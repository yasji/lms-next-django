"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Library,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  BookMarked,
  Calendar,
  Heart,
  Clock,
  Search,
  Menu,
  ChevronLeft,
  ChevronRight,
  Plus,
  Scan,
  Download,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const adminRoutes = [
  {
    label: "Overview",
    icon: BookOpen,
    href: "/dashboard/admin",
  },
  {
    label: "Books",
    icon: Library,
    href: "/dashboard/admin/books",
  },
  {
    label: "Users",
    icon: Users,
    href: "/dashboard/admin/users",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/dashboard/admin/analytics",
  },
  {
    label: "Events",
    icon: Calendar,
    href: "/dashboard/admin/events",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/admin/settings",
  },
];

const readerRoutes = [
  {
    label: "Browse",
    icon: BookOpen,
    href: "/dashboard/reader",
  },
  {
    label: "My Books",
    icon: BookMarked,
    href: "/dashboard/reader/my-books",
  },
  {
    label: "Wishlist",
    icon: Heart,
    href: "/dashboard/reader/wishlist",
  },
  {
    label: "History",
    icon: Clock,
    href: "/dashboard/reader/history",
  },
  {
    label: "Events",
    icon: Calendar,
    href: "/dashboard/reader/events",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/reader/settings",
  },
];

interface SidebarProps {
  routes: typeof adminRoutes;
  isCollapsed: boolean;
}

const Sidebar = ({ routes, isCollapsed }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 py-4">
        {routes.map((route) => (
          <Link key={route.href} href={route.href}>
            <Button
              variant="ghost"
              className={cn(
                "justify-start gap-4 relative hover:bg-accent/20 hover:text-accent-foreground rounded-md",
                pathname === route.href && "bg-accent/30 text-accent-foreground",
                isCollapsed 
                  ? "h-12 w-12 p-0 justify-center items-center mx-auto flex" 
                  : "h-12 px-4 w-[calc(100%-16px)] mx-2",
              )}
            >
              <route.icon className={cn(
                "h-5 w-5 shrink-0",
                pathname === route.href ? "text-foreground" : "text-muted-foreground"
              )} />
              {!isCollapsed && <span>{route.label}</span>}
            </Button>
          </Link>
        ))}
      </div>
    </ScrollArea>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.includes("/admin");
  const routes = isAdmin ? adminRoutes : readerRoutes;
  const [search, setSearch] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 z-50 flex flex-col bg-background border-r",
          isCollapsed ? "w-[68px]" : "w-64",
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex h-16 items-center border-b px-4 transition-all duration-300",
          isCollapsed ? "justify-center items-center" : "justify-start gap-2"
        )}>
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Library className="h-5 w-5 text-primary" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold tracking-tight">Libra</span>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1">
          <Sidebar routes={routes} isCollapsed={isCollapsed} />
        </div>

        <Separator />
        {/* Bottom Actions */}
        <div className="p-2 space-y-2">
          <Button
            variant="ghost"
            className={cn(
              "justify-start gap-4 hover:bg-accent/20 hover:text-accent-foreground rounded-md",
              isCollapsed ? "h-12 w-12 p-0 justify-center items-center mx-auto flex" : "h-12 px-4 w-[calc(100%-16px)] mx-2",
            )}
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            {!isCollapsed && "Notifications"}
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "justify-start gap-4 text-red-500 hover:bg-red-50/40 hover:text-red-600 rounded-md",
              isCollapsed ? "h-12 w-12 p-0 justify-center items-center mx-auto flex" : "h-12 px-4 w-[calc(100%-16px)] mx-2",
            )}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && "Logout"}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-12 hover:bg-accent/20 hover:text-accent-foreground rounded-md",
              isCollapsed ? "mx-auto flex justify-center items-center w-12" : "w-[calc(100%-16px)] mx-2"
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isCollapsed ? "pl-[68px]" : "pl-64"
      )}>
        <div className="h-16 border-b flex items-center justify-between px-8">
          <div></div> {/* Empty div for flex spacing */}
          <ThemeToggle />
        </div>
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
    </ThemeProvider>
  );
}