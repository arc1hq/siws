"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as stylex from "@stylexjs/stylex"
import { color, duration, ease, font, leading, radius, space, text } from "@ui/theme/tokens.stylex"
import { navSections } from "@/lib/nav-data"
import { accent } from "@/styles/shell.stylex"

const styles = stylex.create({
  nav: { display: "flex", flexDirection: "column", rowGap: space.s6 },
  label: {
    display: "flex",
    alignItems: "center",
    gap: space.s2,
    height: space.s7,
    paddingInline: space.s3,
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    lineHeight: leading.xs,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: color.mutedForeground,
  },
  list: { display: "flex", flexDirection: "column", rowGap: space.s0_5 },
  row: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    height: space.s8,
    paddingInline: space.s3,
    borderRadius: radius.md,
    fontSize: text.sm,
    lineHeight: leading.sm,
    color: { default: color.mutedForeground, ":hover": color.foreground },
    backgroundColor: { default: null, ":hover": color.itemHighlightBg },
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    outlineColor: color.ring,
    transitionProperty: "color, background-color",
    transitionDuration: duration.color,
    transitionTimingFunction: ease.standard,
  },
  rowMono: { fontFamily: font.mono, fontSize: text.compact, lineHeight: leading.compact },
  active: {
    color: color.foreground,
    fontWeight: 500,
    backgroundColor: color.itemHighlightBg,
    boxShadow: `inset 0 0 0 1px ${color.itemHighlightRing}`,
    "::before": {
      content: "''",
      position: "absolute",
      insetInlineStart: 0,
      insetBlock: space.s2,
      width: 2,
      borderRadius: radius.full,
      backgroundColor: accent.ink,
    },
  },
})

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Documentation" {...stylex.props(styles.nav)}>
      {navSections.map((section) => (
        <div key={section.title}>
          <p {...stylex.props(styles.label)}>{section.title}</p>
          <ul {...stylex.props(styles.list)}>
            {section.items.map((item) => {
              const active = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    {...stylex.props(
                      styles.row,
                      item.title.startsWith("@") && styles.rowMono,
                      active && styles.active,
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
