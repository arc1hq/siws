"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import * as stylex from "@stylexjs/stylex"
import { clsx } from "clsx"
import { CommandIcon } from "@phosphor-icons/react/dist/csr/Command"
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText"
import { HashIcon } from "@phosphor-icons/react/dist/csr/Hash"
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass"
import { Button } from "@ui/base/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui/base/command"
import { Kbd } from "@ui/base/kbd"
import { breakpoints } from "@ui/theme/breakpoints.stylex"
import { states } from "@ui/theme/states"
import { color, duration, ease, font, leading, radius, space, text, width } from "@ui/theme/tokens.stylex"
import { visibility } from "@ui/theme/visibility"
import type { SearchPage } from "@/lib/search"

const styles = stylex.create({
  field: {
    display: { default: "none", [breakpoints.md]: "inline-flex" },
    alignItems: "center",
    gap: space.s1_5,
    width: "14rem",
    height: space.s7,
    flexShrink: 0,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "solid",
    paddingInlineStart: space.s2,
    paddingInlineEnd: space.s1,
    marginInlineEnd: space.s1_5,
    fontSize: text.sm,
    lineHeight: leading.sm,
    color: color.mutedForeground,
    cursor: "pointer",
    transitionProperty: "color, background-color, border-color, box-shadow",
    transitionDuration: duration.color,
    transitionTimingFunction: ease.standard,
    "--carbon-icon-size": space.s3_5,
  },
  label: { flexGrow: 1, textAlign: "start" },
  shortcut: { borderColor: color.transparent, fontFamily: font.sans },
  dialog: {
    maxWidth: { default: "none", [breakpoints.md]: width.lg },
    "--carbon-command-list-height": {
      default: null,
      [breakpoints.maxMd]: "none",
      [breakpoints.md]: "24rem",
    },
  },
  body: { display: "flex", flexDirection: "column", minWidth: 0 },
  truncate: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  detail: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: text.xs,
    lineHeight: leading.xs,
    color: color.mutedForeground,
  },
  icon: { flexShrink: 0, color: color.mutedForeground },
})

type Entry = { value: string; label: string; detail?: string; href: string; kind: "page" | "heading" }
type Group = { value: string; items: Entry[] }

function matches(haystack: string, terms: string[]) {
  const value = haystack.toLowerCase()
  return terms.every((term) => value.includes(term))
}

function useResults(pages: SearchPage[], input: string): Group[] {
  return useMemo(() => {
    const terms = input.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const sections = new Map<string, Entry[]>()
    for (const page of pages) {
      if (terms.length && !matches(`${page.title} ${page.excerpt}`, terms)) continue
      const list = sections.get(page.section) ?? []
      list.push({ value: `page:${page.href}`, label: page.title, detail: page.excerpt, href: page.href, kind: "page" })
      sections.set(page.section, list)
    }
    const groups: Group[] = [...sections].map(([value, items]) => ({ value, items }))
    if (terms.length) {
      const headings = pages
        .flatMap((page) =>
          page.headings
            .filter((heading) => matches(`${heading.title} ${page.title}`, terms))
            .map<Entry>((heading) => ({
              value: `heading:${heading.href}`,
              label: heading.title,
              detail: page.title,
              href: heading.href,
              kind: "heading",
            })),
        )
        .slice(0, 8)
      if (headings.length) groups.push({ value: "Sections", items: headings })
    }
    return groups
  }, [pages, input])
}

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
}

export function Search({ pages }: { pages: SearchPage[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [apple, setApple] = useState(true)
  const results = useResults(pages, input)

  useEffect(() => {
    setApple(/Mac|iPhone|iPad|iPod/.test(navigator.platform))
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
      } else if (event.key === "/" && !isEditable(event.target)) {
        event.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setInput("")
  }

  const fieldSx = stylex.props(styles.field, states.focusRing, states.fieldSurface)

  return (
    <>
      <button
        type="button"
        aria-keyshortcuts="Meta+K Control+K /"
        onClick={() => setOpen(true)}
        {...fieldSx}
        className={clsx("carbon-icons", fieldSx.className)}
      >
        <MagnifyingGlassIcon aria-hidden />
        <span {...stylex.props(styles.label)}>Search docs…</span>
        <Kbd aria-hidden xstyle={styles.shortcut}>
          {apple ? <CommandIcon aria-hidden /> : <span>Ctrl</span>}
          <span>K</span>
        </Kbd>
      </button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Search docs"
        onClick={() => setOpen(true)}
        xstyle={visibility.inlineFlexBelowMd}
      >
        <MagnifyingGlassIcon aria-hidden />
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Search docs"
        description="Search pages and sections."
        xstyle={styles.dialog}
      >
        <Command
          items={results}
          filter={null}
          value={input}
          onValueChange={setInput}
          itemToStringValue={(entry: Entry) => entry.label}
        >
          <CommandInput placeholder="Search docs…" aria-label="Search docs" />
          <CommandEmpty>No results for “{input.trim()}”.</CommandEmpty>
          <CommandList>
            {(group: Group) => (
              <CommandGroup key={group.value} heading={group.value} items={group.items}>
                {(entry: Entry) => {
                  const Icon = entry.kind === "page" ? FileTextIcon : HashIcon
                  return (
                    <CommandItem
                      key={entry.value}
                      value={entry}
                      onClick={() => {
                        onOpenChange(false)
                        router.push(entry.href)
                      }}
                    >
                      <Icon aria-hidden {...stylex.props(styles.icon)} />
                      <span {...stylex.props(styles.body)}>
                        <span {...stylex.props(styles.truncate)}>{entry.label}</span>
                        {entry.detail && <span {...stylex.props(styles.detail)}>{entry.detail}</span>}
                      </span>
                    </CommandItem>
                  )
                }}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
