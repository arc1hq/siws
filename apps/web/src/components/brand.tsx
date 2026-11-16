import Link from "next/link"
import * as stylex from "@stylexjs/stylex"
import { color, leading, radius, space, text, tracking } from "@ui/theme/tokens.stylex"
import { accent } from "@/styles/shell.stylex"

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
  mark: { width: space.s5, height: space.s5, flexShrink: 0 },
  ink: { fill: color.foreground },
  key: { fill: accent.seal },
  word: {
    fontSize: text.base,
    lineHeight: leading.base,
    fontWeight: 600,
    letterSpacing: tracking.tight,
  },
})

const overlap = "M13 9H15V11A4 4 0 0 1 11 15H9V13A4 4 0 0 1 13 9Z"

export function BrandMark({ xstyle }: { xstyle?: stylex.StyleXStyles }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stylex.props(styles.mark, xstyle)}>
      <path fillRule="evenodd" d={`M6 2h5a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z${overlap}`} {...stylex.props(styles.ink)} />
      <path fillRule="evenodd" d={`M13 9h5a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4h-5a4 4 0 0 1-4-4v-5a4 4 0 0 1 4-4z${overlap}`} {...stylex.props(styles.key)} />
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
