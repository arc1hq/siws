import type { ReactNode } from "react"
import Link from "next/link"
import * as stylex from "@stylexjs/stylex"
import { breakpoints } from "@ui/theme/breakpoints.stylex"
import { color, duration, ease, font, leading, radius, space, text, tracking } from "@ui/theme/tokens.stylex"
import GitHubIcon from "@siws/icons/GitHubIcon"
import { Brand } from "@/components/brand"
import { ThemeToggle } from "@/components/theme/toggle"
import { siteConfig } from "@/lib/site"

const styles = stylex.create({
  page: {
    display: "flex",
    flexDirection: "column",
    gap: space.s12,
    width: "100%",
    maxWidth: "34rem",
    marginInline: "auto",
    paddingInline: space.s5,
    paddingBlockStart: { default: space.s10, [breakpoints.md]: space.s24 },
    paddingBlockEnd: space.s16,
  },
  top: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  tools: { display: "flex", alignItems: "center", gap: space.s0_5 },
  icon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: space.s7,
    height: space.s7,
    borderRadius: radius.md,
    color: { default: color.mutedForeground, ":hover": color.foreground },
    "--carbon-icon-size": space.s4,
  },
  glyph: { width: space.s4, height: space.s4 },
})

export function HomeShell({ children }: { children: ReactNode }) {
  return (
    <main {...stylex.props(styles.page)}>
      <header {...stylex.props(styles.top)}>
        <Brand />
        <div {...stylex.props(styles.tools)}>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            {...stylex.props(styles.icon)}
          >
            <GitHubIcon {...stylex.props(styles.glyph)} />
          </a>
          <ThemeToggle />
        </div>
      </header>
      {children}
    </main>
  )
}

export const homeStyles = stylex.create({
  intro: { display: "flex", flexDirection: "column", gap: space.s2 },
  title: {
    fontSize: text.xl3,
    lineHeight: leading.xl3,
    fontWeight: 600,
    letterSpacing: tracking.tight,
  },
  lede: { fontSize: text.base, lineHeight: leading.base, color: color.mutedForeground, textWrap: "pretty" },
  actions: { display: "flex", alignItems: "center", gap: space.s2, marginBlockStart: space.s4 },
  packages: {
    display: "grid",
    gridTemplateColumns: { default: "1fr", [breakpoints.sm]: "1fr 1fr" },
    gap: space.s1,
    marginInline: `calc(-1 * ${space.s3})`,
  },
  pkg: {
    display: "flex",
    flexDirection: "column",
    gap: space.s1,
    padding: space.s3,
    borderRadius: radius.lg,
    backgroundColor: { default: null, ":hover": color.itemHighlightBg },
    transitionProperty: "background-color",
    transitionDuration: duration.color,
    transitionTimingFunction: ease.standard,
  },
  pkgName: { fontFamily: font.mono, fontSize: text.sm, lineHeight: leading.sm, fontWeight: 500 },
  pkgText: { fontSize: text.xs, lineHeight: leading.xs, color: color.mutedForeground },
  foot: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: text.xs,
    lineHeight: leading.xs,
    color: color.mutedForeground,
  },
  footLink: {
    color: { default: color.mutedForeground, ":hover": color.foreground },
    textDecorationLine: { default: "none", ":hover": "underline" },
    textUnderlineOffset: "3px",
    transitionProperty: "color",
    transitionDuration: duration.color,
  },
})

export function PackageLink({ href, name, children }: { href: string; name: string; children: ReactNode }) {
  return (
    <Link href={href} {...stylex.props(homeStyles.pkg)}>
      <span {...stylex.props(homeStyles.pkgName)}>{name}</span>
      <span {...stylex.props(homeStyles.pkgText)}>{children}</span>
    </Link>
  )
}
