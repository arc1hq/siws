"use client"

import type { LucideIcon } from "lucide-react"
import { Button } from "@siws/ui/shadcn/button"
import { cn } from "@siws/ui/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/shadcn/dropdown-menu"
import { ChevronsUpDown, Check } from "lucide-react"

export type SectionItem = {
  label: string
  description: string
  href: string
  icon: LucideIcon
  isActive: (pathname: string) => boolean
}

export function SectionSwitcher({ items }: { items: SectionItem[] }) {
  const pathname = usePathname()
  const active =
    items.find((item) => pathname && item.isActive(pathname)) ?? items[0]

  if (!active) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="lg"
            className="w-full justify-between"
          />
        }
      >
        <span className="flex items-center gap-2.5">
          <active.icon className="size-4 text-accent-foreground" />
          <span className="flex flex-col items-start leading-none">
            <span className="text-sm">{active.label ?? "SIWS"}</span>
          </span>
        </span>
        <ChevronsUpDown className="size-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--anchor-width) p-1.5">
        {items.map((item) => {
          const selected = pathname ? item.isActive(pathname) : false
          return (
            <DropdownMenuItem
              key={item.href}
              className="group flex items-center gap-2.5 rounded-md px-2 py-2.5"
              data-selected={selected || undefined}
              render={<Link href={item.href} />}
            >
              <span className="flex items-center justify-center size-7 rounded-md shrink-0 bg-muted group-data-selected:bg-linear-to-br group-data-selected:from-muted-foreground group-data-selected:to-muted-foreground/60">
                <item.icon className="size-4 text-muted-foreground group-data-selected:text-white" />
              </span>
              <span className="flex flex-col items-start leading-none gap-0.5 flex-1 min-w-0">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              </span>
              {selected && (
                <Check className="size-3.5 text-foreground shrink-0" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
