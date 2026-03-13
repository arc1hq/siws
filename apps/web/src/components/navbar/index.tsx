"use client"

import { Button } from "@siws/ui/shadcn/button"
import { cn } from "@siws/ui/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MobileNav } from "./mobile"
import { ThemeToggler } from "@/components/theme/toggler"
import { CommandMenu } from "@/components/command-menu"
import { BookOpen, Package } from "lucide-react"
import { SectionSwitcher, type SectionItem } from "./section-switcher"
import { siteConfig } from "@/lib/site"
import GitHubIcon from "@siws/icons/GitHubIcon"
import NpmIcon from "@siws/icons/NpmIcon"

const sectionItems: SectionItem[] = [
  {
    label: "Documentation",
    description: "Guides & specification",
    href: "/docs/what-is-siws",
    icon: BookOpen,
    isActive: (p) => p.startsWith("/docs") && !p.startsWith("/docs/packages"),
  },
  {
    label: "Package",
    description: "SDK & integrations",
    href: "/docs/packages/core",
    icon: Package,
    isActive: (p) => p.startsWith("/docs/packages"),
  },
]

const navConfig = [
  { label: "Home", href: "/" },
  { label: "Docs", href: "/docs/what-is-siws" },
  { label: "Packages", href: "/docs/packages/core" },
]

export function Navbar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (!pathname) return false
    if (href === "/") return pathname === "/"
    if (href.startsWith("/docs/packages"))
      return pathname.startsWith("/docs/packages")
    if (href.startsWith("/docs"))
      return (
        pathname.startsWith("/docs") && !pathname.startsWith("/docs/packages")
      )
    return pathname.startsWith(href)
  }

  return (
    <nav className="flex items-center w-full h-(--header-height) border-b border-grid">
      <div className="hidden md:flex items-center shrink-0 w-(--sidebar-width) px-4 h-full border-r border-grid text-sm font-semibold">
        <SectionSwitcher items={sectionItems} />
      </div>
      <MobileNav />
      <div className="hidden md:flex items-center pl-3">
        {navConfig.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href={item.href} />}
            className={cn(
              "rounded-sm text-sm",
              isActive(item.href)
                ? "bg-muted text-foreground"
                : "text-muted-foreground",
            )}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2 pr-3">
        <CommandMenu />
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          className="ml-2"
          render={<a href={siteConfig.links.npm} target="_blank" rel="noopener noreferrer" />}
        >
          <NpmIcon className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          render={<a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" />}
        >
          <GitHubIcon className="size-3.5" />
        </Button>
        <ThemeToggler />
      </div>
    </nav>
  )
}
