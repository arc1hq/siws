"use client"

import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"

import { color, font, leading, radius, space, text } from "@ui/theme/tokens.stylex"

const styles = stylex.create({
  kbd: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    gap: space.s0_5,
    height: space.s5,
    minWidth: space.s5,
    paddingInline: space.s1,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    backgroundColor: color.muted,
    color: color.mutedForeground,
    fontFamily: font.mono,
    fontSize: text.xs,
    lineHeight: leading.xs,
    fontWeight: 500,
    whiteSpace: "nowrap",
    userSelect: "none",
    "--carbon-icon-size": space.s3,
  },
  group: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.s1,
  },
})

const kbdStyles = {
  base: styles.kbd,
  group: styles.group,
}

type Overrides = { xstyle?: StyleXStyles; className?: string }

type KbdProps = useRender.ComponentProps<"kbd"> & Overrides

function Kbd({ render, ref, style, xstyle, className, ...props }: KbdProps) {
  const sx = stylex.props(styles.kbd, xstyle)
  return useRender({
    defaultTagName: "kbd",
    render,
    ref,
    props: {
      "data-slot": "kbd",
      ...sx,
      ...props,
      className: clsx("carbon-icons", sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

function KbdGroup({ render, ref, style, xstyle, className, ...props }: KbdProps) {
  const sx = stylex.props(styles.group, xstyle)
  return useRender({
    defaultTagName: "kbd",
    render,
    ref,
    props: {
      "data-slot": "kbd-group",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

export { Kbd, KbdGroup, kbdStyles }
