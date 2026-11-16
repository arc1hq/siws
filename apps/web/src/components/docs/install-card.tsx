"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import * as stylex from "@stylexjs/stylex"
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight"
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check"
import { CopyIcon } from "@phosphor-icons/react/dist/csr/Copy"
import { states } from "@ui/theme/states"
import { color, duration, ease, font, leading, radius, shadow, space, text } from "@ui/theme/tokens.stylex"
import GitHubIcon from "@siws/icons/GitHubIcon"
import NpmIcon from "@siws/icons/NpmIcon"
import { siteConfig } from "@/lib/site"
import { withClass } from "@/lib/with-class"

const styles = stylex.create({
  card: {
    display: "flex",
    flexDirection: "column",
    gap: space.s3,
    padding: space.s3,
    borderRadius: radius.xl,
    backgroundColor: color.tray,
    boxShadow: `inset 0 0 0 1px ${color.border}`,
  },
  label: {
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    lineHeight: leading.xs,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: color.mutedForeground,
  },
  command: {
    display: "flex",
    alignItems: "center",
    gap: space.s2,
    width: "100%",
    height: space.s9,
    paddingInlineStart: space.s3,
    paddingInlineEnd: space.s2,
    borderRadius: radius.lg,
    backgroundColor: color.card,
    boxShadow: { default: shadow.raised, ":hover": shadow.popup },
    fontFamily: font.mono,
    fontSize: text.compact,
    lineHeight: leading.compact,
    textAlign: "start",
    cursor: "pointer",
    transitionProperty: "box-shadow",
    transitionDuration: duration.color,
    transitionTimingFunction: ease.standard,
    "--carbon-icon-size": space.s3_5,
  },
  prompt: { color: color.mutedForeground },
  cmd: { flexGrow: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  copy: { color: color.mutedForeground },
  links: { display: "flex", gap: space.s3 },
  link: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.s1,
    fontSize: text.xs,
    lineHeight: leading.xs,
    color: { default: color.mutedForeground, ":hover": color.foreground },
  },
  icon: { width: space.s3, height: space.s3 },
})

export function InstallCard() {
  const pathname = usePathname() ?? ""
  const pkg = pathname.startsWith("/docs/packages/better-auth") ? "@siws/better-auth" : "@siws/core"
  const command = `npm i ${pkg}`
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timeout)
  }, [copied])

  return (
    <div {...stylex.props(styles.card)}>
      <p {...stylex.props(styles.label)}>Install</p>
      <button
        type="button"
        aria-label={`Copy ${command}`}
        onClick={() => navigator.clipboard.writeText(command).then(() => setCopied(true))}
        {...withClass("carbon-icons", states.focusRing, styles.command)}
      >
        <span aria-hidden {...stylex.props(styles.prompt)}>$</span>
        <span {...stylex.props(styles.cmd)}>{command}</span>
        <span {...stylex.props(styles.copy)}>{copied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}</span>
      </button>
      <div {...stylex.props(styles.links)}>
        <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" {...stylex.props(styles.link)}>
          <GitHubIcon {...stylex.props(styles.icon)} />
          Source
          <ArrowUpRightIcon aria-hidden {...stylex.props(styles.icon)} />
        </a>
        <a href={`https://www.npmjs.com/package/${pkg}`} target="_blank" rel="noopener noreferrer" {...stylex.props(styles.link)}>
          <NpmIcon {...stylex.props(styles.icon)} />
          npm
          <ArrowUpRightIcon aria-hidden {...stylex.props(styles.icon)} />
        </a>
      </div>
    </div>
  )
}
