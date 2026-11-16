"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as stylex from "@stylexjs/stylex"
import { clsx } from "clsx"
import { buttonStyles } from "@ui/base/button"
import { breakpoints } from "@ui/theme/breakpoints.stylex"
import { color, duration, ease, leading, radius, space, text } from "@ui/theme/tokens.stylex"
import { visibility } from "@ui/theme/visibility"
import GitHubIcon from "@siws/icons/GitHubIcon"
import { Brand } from "@/components/brand"
import { MobileNav } from "@/components/docs/mobile-nav"
import { Search } from "@/components/search"
import { ThemeToggle } from "@/components/theme/toggle"
import type { SearchPage } from "@/lib/search"
import { primaryNav, siteConfig } from "@/lib/site"
import { shell, shellLayer } from "@/styles/shell.stylex"

const styles = stylex.create({
  header: {
    position: "fixed",
    insetInline: 0,
    top: 0,
    zIndex: shellLayer.header,
    height: shell.headerHeight,
    backgroundColor: `color-mix(in oklab, ${color.background} 82%, transparent)`,
    backdropFilter: "blur(8px) saturate(1.4)",
    borderBlockEndWidth: 1,
    borderBlockEndStyle: "solid",
  },
  row: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    paddingInlineEnd: { default: space.s3, [breakpoints.md]: space.s4 },
  },
  brandCell: {
    display: "flex",
    alignItems: "center",
    gap: space.s1,
    height: "100%",
    flexShrink: 0,
    width: { default: null, [breakpoints.md]: shell.sidebarWidth },
    paddingInlineStart: { default: space.s2, [breakpoints.md]: space.s5 },
    borderInlineEndWidth: { default: 0, [breakpoints.md]: 1 },
    borderInlineEndStyle: "solid",
  },
  nav: { alignItems: "center", gap: space.s0_5, marginInlineStart: space.s4 },
  link: {
    display: "inline-flex",
    alignItems: "center",
    height: space.s7,
    paddingInline: space.s2_5,
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
  linkActive: { color: color.foreground, fontWeight: 500 },
  trailing: {
    display: "flex",
    alignItems: "center",
    gap: space.s0_5,
    marginInlineStart: "auto",
  },
  githubIcon: { width: space.s4, height: space.s4 },
})

const githubSx = stylex.props(
  buttonStyles.base,
  buttonStyles.variants.ghost,
  buttonStyles.sizes["icon-sm"],
)

export function SiteHeader({ pages }: { pages: SearchPage[] }) {
  const pathname = usePathname() ?? "/"

  return (
    <header {...stylex.props(styles.header)}>
      <div {...stylex.props(styles.row)}>
        <div {...stylex.props(styles.brandCell)}>
          <MobileNav />
          <Brand />
        </div>

        <nav
          aria-label="Primary"
          {...stylex.props(visibility.flexFromMd, styles.nav)}
        >
          {primaryNav.map((item) => {
            const active = item.match(pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                {...stylex.props(styles.link, active && styles.linkActive)}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div {...stylex.props(styles.trailing)}>
          <Search pages={pages} />
          <ThemeToggle />
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            data-variant="ghost"
            {...githubSx}
            className={clsx("carbon-icons", githubSx.className)}
          >
            <GitHubIcon {...stylex.props(styles.githubIcon)} />
          </a>
        </div>
      </div>
    </header>
  )
}
