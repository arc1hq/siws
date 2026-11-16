import Link from "next/link"
import * as stylex from "@stylexjs/stylex"
import { clsx } from "clsx"
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { breakpoints } from "@ui/theme/breakpoints.stylex"
import { color, duration, ease, font, leading, radius, shadow, space, text } from "@ui/theme/tokens.stylex"
import type { AdjacentPage } from "@/lib/get-adjacent-pages"

const styles = stylex.create({
  nav: {
    display: "grid",
    gridTemplateColumns: { default: "1fr", [breakpoints.sm]: "1fr 1fr" },
    gap: space.s3,
    marginBlockStart: space.s16,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: space.s1,
    minWidth: 0,
    paddingInline: space.s4,
    paddingBlock: space.s3_5,
    borderRadius: radius.xl,
    backgroundColor: color.card,
    boxShadow: { default: shadow.raised, ":hover": shadow.popup },
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    outlineColor: color.ring,
    transitionProperty: "box-shadow",
    transitionDuration: duration.color,
    transitionTimingFunction: ease.standard,
  },
  next: { gridColumnStart: { default: "1", [breakpoints.sm]: "2" }, alignItems: "flex-end", textAlign: "end" },
  label: {
    display: "flex",
    alignItems: "center",
    gap: space.s1,
    color: color.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    lineHeight: leading.xs,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    "--carbon-icon-size": space.s3,
  },
  title: {
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: text.sm,
    lineHeight: leading.sm,
    fontWeight: 500,
  },
})

export function DocsPager({ prev, next }: { prev: AdjacentPage; next: AdjacentPage }) {
  if (!prev && !next) return null
  const card = (end: boolean) => {
    const sx = stylex.props(styles.card, end && styles.next)
    return { ...sx, className: clsx("carbon-icons", sx.className) }
  }

  return (
    <nav aria-label="Pages" {...stylex.props(styles.nav)}>
      {prev && (
        <Link href={prev.href} {...card(false)}>
          <span {...stylex.props(styles.label)}>
            <ArrowLeftIcon aria-hidden />
            Previous
          </span>
          <span {...stylex.props(styles.title)}>{prev.title}</span>
        </Link>
      )}
      {next && (
        <Link href={next.href} {...card(true)}>
          <span {...stylex.props(styles.label)}>
            Next
            <ArrowRightIcon aria-hidden />
          </span>
          <span {...stylex.props(styles.title)}>{next.title}</span>
        </Link>
      )}
    </nav>
  )
}
