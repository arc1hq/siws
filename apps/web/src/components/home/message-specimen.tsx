"use client"

import { useState } from "react"
import * as stylex from "@stylexjs/stylex"
import { color, duration, ease, font, leading, radius, shadow, space, text } from "@ui/theme/tokens.stylex"
import { accent } from "@/styles/shell.stylex"

const lines: { key: string; text: string; gap?: boolean }[] = [
  { key: "domain", text: "example.com wants you to sign in with your Solana account:" },
  { key: "address", text: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU" },
  { key: "statement", text: "Sign in to Example", gap: true },
  { key: "uri", text: "URI: https://example.com/auth", gap: true },
  { key: "version", text: "Version: 1" },
  { key: "nonce", text: "Nonce: 8Xk2pQz7Lm4vR9tW" },
  { key: "issuedAt", text: "Issued At: 2026-11-16T09:41:00Z" },
  { key: "cluster", text: "Cluster: mainnet-beta" },
]

const styles = stylex.create({
  tray: {
    padding: space.s1,
    borderRadius: radius.xl,
    backgroundColor: color.tray,
    boxShadow: `inset 0 0 0 1px ${color.border}`,
  },
  caption: {
    display: "flex",
    justifyContent: "space-between",
    paddingInline: space.s3,
    paddingBlockStart: space.s1_5,
    paddingBlockEnd: space.s2,
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    lineHeight: leading.xs,
    color: color.mutedForeground,
  },
  field: { color: accent.ink, transitionProperty: "opacity", transitionDuration: duration.color },
  idle: { opacity: 0 },
  panel: {
    paddingBlock: space.s3,
    borderRadius: radius.lg,
    backgroundColor: color.card,
    boxShadow: shadow.raised,
    overflowX: "auto",
  },
  line: {
    display: "block",
    paddingInline: space.s4,
    fontFamily: font.mono,
    fontSize: text.xs,
    lineHeight: leading.code,
    whiteSpace: "pre",
    cursor: "default",
    transitionProperty: "background-color, box-shadow",
    transitionDuration: duration.color,
    transitionTimingFunction: ease.standard,
  },
  gap: { marginBlockStart: space.s3 },
  active: { backgroundColor: accent.wash, boxShadow: `inset 2px 0 0 ${accent.ink}` },
})

export function MessageSpecimen() {
  const [active, setActive] = useState<string | null>(null)

  return (
    <figure {...stylex.props(styles.tray)}>
      <figcaption {...stylex.props(styles.caption)}>
        <span>what the wallet signs</span>
        <span {...stylex.props(styles.field, !active && styles.idle)}>{active ?? "field"}</span>
      </figcaption>
      <div {...stylex.props(styles.panel)} onMouseLeave={() => setActive(null)}>
        {lines.map((line) => (
          <span
            key={line.key}
            onMouseEnter={() => setActive(line.key)}
            {...stylex.props(styles.line, line.gap && styles.gap, active === line.key && styles.active)}
          >
            {line.text}
          </span>
        ))}
      </div>
    </figure>
  )
}
