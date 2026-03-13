"use client"

import { Button } from "@siws/ui/shadcn/button"
import { cn } from "@siws/ui/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@siws/ui/shadcn/sheet"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { MenuIcon } from "lucide-react"
import { SidebarContent } from "../sidebar"

const navConfig = [
  { label: "Docs", href: "/docs" },
  { label: "Packages", href: "/docs/packages" },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (!pathname) return false
    if (href === "/docs/packages") return pathname.startsWith("/docs/packages")
    if (href === "/docs")
      return (
        pathname.startsWith("/docs") && !pathname.startsWith("/docs/packages")
      )
    return pathname.startsWith(href)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="ml-2 md:hidden">
            <MenuIcon className="size-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        }
      />
      <SheetContent side="left" className="w-[280px] p-0">
        <div className="flex h-full min-h-0 flex-col">
          <div className="px-2 pt-6 pb-3 border-b border-grid">
            <div className="flex flex-wrap gap-1">
              {navConfig.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={
                    <Link href={item.href} onClick={() => setOpen(false)} />
                  }
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
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-2">
              <SidebarContent onLinkClick={() => setOpen(false)} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
