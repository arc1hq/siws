"use client"

import { useEffect, useMemo, useState } from "react"
import * as stylex from "@stylexjs/stylex"
import { color, duration, ease, font, leading, space, text } from "@ui/theme/tokens.stylex"
import { accent } from "@/styles/shell.stylex"

type TocEntry = { title: string; url: string; items?: TocEntry[] }
type Item = { title: string; url: string; depth: number }

const styles = stylex.create({
  heading: {
    marginBlockEnd: space.s3,
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    lineHeight: leading.xs,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: color.mutedForeground,
  },
  list: { display: "flex", flexDirection: "column" },
  link: {
    position: "relative",
    display: "block",
    paddingBlock: space.s1,
    paddingInlineEnd: space.s2,
    fontSize: text.compact,
    lineHeight: leading.compact,
    overflowWrap: "anywhere",
    color: { default: color.mutedForeground, ":hover": color.foreground },
    transitionProperty: "color",
    transitionDuration: duration.color,
    transitionTimingFunction: ease.standard,
    "::before": {
      content: "''",
      position: "absolute",
      insetInlineStart: 0,
      insetBlock: 0,
      width: 1,
      backgroundColor: color.border,
      transitionProperty: "background-color",
      transitionDuration: duration.color,
    },
  },
  depth2: { paddingInlineStart: space.s3 },
  depth3: { paddingInlineStart: space.s6 },
  depth4: { paddingInlineStart: space.s8 },
  active: {
    color: color.foreground,
    "::before": { backgroundColor: accent.ink, width: 2 },
  },
})

function flatten(entries: TocEntry[], depth = 2): Item[] {
  return entries.flatMap((entry) => [
    { title: entry.title, url: entry.url, depth },
    ...flatten(entry.items ?? [], depth + 1),
  ])
}

function useActive(items: Item[]) {
  const [active, setActive] = useState<string | null>(items[0]?.url ?? null)

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(decodeURIComponent(item.url.slice(1))))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    const update = () => {
      const offset = 120
      let current = elements[0]!
      for (const el of elements) {
        if (el.getBoundingClientRect().top - offset <= 0) current = el
        else break
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      setActive(`#${(atBottom ? elements[elements.length - 1]! : current).id}`)
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [items])

  return active
}

const depthStyle = { 2: styles.depth2, 3: styles.depth3, 4: styles.depth4 } as const

export function DocsToc({ toc }: { toc: TocEntry[] }) {
  const items = useMemo(() => flatten(toc).filter((item) => item.depth <= 4), [toc])
  const active = useActive(items)

  if (items.length === 0) return null

  return (
    <nav aria-label="On this page">
      <p {...stylex.props(styles.heading)}>On this page</p>
      <ul {...stylex.props(styles.list)}>
        {items.map((item) => (
          <li key={item.url}>
            <a
              href={item.url}
              aria-current={active === item.url ? "location" : undefined}
              {...stylex.props(
                styles.link,
                depthStyle[item.depth as 2 | 3 | 4],
                active === item.url && styles.active,
              )}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
