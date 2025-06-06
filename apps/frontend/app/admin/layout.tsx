"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { siteConfig } from "@/lib/constants"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bell,
  CreditCard,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  LogOut,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-context"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-col space-y-1", className)} {...props}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
          )}
        >
          {item.icon}
          <span className="ml-3">{item.title}</span>
        </Link>
      ))}
    </nav>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const { user, isLoading, isAuthenticated, isAdmin, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Don't apply auth checks to the admin login page itself
  const isLoginPage = pathname === '/admin/login'

  // Redirect if not authenticated or not admin (but skip for login page)
  useEffect(() => {
    if (!isLoading && !isLoginPage) {
      if (!isAuthenticated) {
        router.push('/admin/login')
      } else if (!isAdmin) {
        router.push('/dashboard') // Redirect regular users to dashboard
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router, isLoginPage])

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  // If this is the login page, render it without the admin layout
  if (isLoginPage) {
    return <>{children}</>
  }

  // Show loading while checking authentication (for non-login pages)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Verifying admin credentials...</p>
        </div>
      </div>
    )
  }

  // Don't render admin content if not authenticated or not admin (for non-login pages)
  if (!isAuthenticated || !isAdmin) {
    return null
  }

  const adminNavItems = [
    {
      title: "Overview",
      href: "/admin",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Applications",
      href: "/admin/applications",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: "Scraper Settings",
      href: "/admin/scraper",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      title: "Content Moderation",
      href: "/admin/moderation",
      icon: <ShieldCheck className="h-4 w-4" />,
    },
    {
      title: "Plans & Billing",
      href: "/admin/billing",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      title: "Support Tickets",
      href: "/admin/support",
      icon: <HelpCircle className="h-4 w-4" />,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart className="h-4 w-4" />,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex items-center gap-2 pb-4 pt-2">
                  <Link href="/" className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">{siteConfig.name} Admin</span>
                  </Link>
                </div>
                <SidebarNav items={adminNavItems} />
              </SheetContent>
            </Sheet>
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold hidden md:inline-block">{siteConfig.name} Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/images/avatars/admin.png" alt={user?.name || "Admin"} />
                    <AvatarFallback>
                      {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AD'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="text-xs leading-none text-primary font-medium">
                      🛡️ Admin Access
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="h-full py-6 pr-6 lg:py-8">
            <SidebarNav items={adminNavItems} />
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden py-6">{children}</main>
      </div>
    </div>
  )
}
