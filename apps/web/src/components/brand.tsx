import Link from "next/link"
import * as stylex from "@stylexjs/stylex"
import { color, leading, radius, space, text, tracking } from "@ui/theme/tokens.stylex"

const styles = stylex.create({
  link: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.s2,
    color: color.foreground,
    borderRadius: radius.md,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    outlineOffset: 2,
    outlineColor: color.ring,
  },
  mark: { width: space.s6, height: space.s6, flexShrink: 0 },
  tile: { fill: color.foreground },
  stroke: { stroke: color.background },
  word: {
    fontSize: text.base,
    lineHeight: leading.base,
    fontWeight: 600,
    letterSpacing: tracking.tight,
  },
})

export function BrandMark({ xstyle }: { xstyle?: stylex.StyleXStyles }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stylex.props(styles.mark, xstyle)}>
      <rect width="24" height="24" rx="6.5" {...stylex.props(styles.tile)} />
      <path
        d="M5.5 15.25c1.6-3.4 2.9-5.75 4-5.75 1.4 0 .4 5.5 2.1 5.5 1.5 0 2-3.75 3.4-3.75 1 0 1.1 1.9 3.5 1.9"
        fill="none"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...stylex.props(styles.stroke)}
      />
      <path d="M6 18h12" strokeWidth="1.25" strokeLinecap="round" {...stylex.props(styles.stroke)} opacity="0.45" />
    </svg>
  )
}

export function Brand() {
  return (
    <Link href="/" aria-label="SIWS home" {...stylex.props(styles.link)}>
      <BrandMark />
      <span {...stylex.props(styles.word)}>siws</span>
    </Link>
  )
}
