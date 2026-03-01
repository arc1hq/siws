"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@siws/ui/shadcn/command"
import { FileTextIcon, SearchIcon } from "lucide-react"
import { Button } from "@siws/ui/shadcn/button"
import { Kbd, KbdGroup } from "@siws/ui/shadcn/kbd"
import { useRouter } from "next/navigation"
import { docs } from "#site/content"

type NavSection = { title: string; items: { href: string; title: string }[] }

function groupDocs(): NavSection[] {
  const published = docs.filter((d) => d.published)
  const groups = new Map<string, { href: string; title: string; rank: number }[]>()

  for (const doc of published) {
    const parts = doc.slugAsParams.split("/")
    const first = parts[0] ?? ""
    const category =
      parts.length > 1
        ? first.charAt(0).toUpperCase() + first.slice(1)
        : "Getting Started"

    if (!groups.has(category)) groups.set(category, [])
    groups.get(category)!.push({
      href: `/docs/${doc.slugAsParams}`,
      title: doc.title,
      rank: doc.rank,
    })
  }

  const categoryOrder = ["Getting Started", "Getting-started", "Packages"]
  const sections: NavSection[] = []

  for (const cat of categoryOrder) {
    const items = groups.get(cat)
    if (items) {
      items.sort((a, b) => a.rank - b.rank)
      sections.push({ title: cat, items })
      groups.delete(cat)
    }
  }

  for (const [cat, items] of groups) {
    items.sort((a, b) => a.rank - b.rank)
    sections.push({ title: cat, items })
  }

  return sections
}

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const sections = useMemo(() => groupDocs(), [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  return (
    <>
      <Button
        variant="outline"
        className="text-muted-foreground w-56 justify-start gap-2 rounded-lg"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="size-4" />
        <span className="flex-1 text-left">Search...</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} className="max-w-xl">
        <Command>
          <CommandInput placeholder="Search docs..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {sections.map((section) => (
              <CommandGroup key={section.title} heading={section.title}>
                {section.items.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={item.title}
                    onSelect={() => handleSelect(item.href)}
                  >
                    <FileTextIcon />
                    <span>{item.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
