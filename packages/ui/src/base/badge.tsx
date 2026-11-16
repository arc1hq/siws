"use client"

import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"

import { states } from "@ui/theme/states"
import {
  color,
  duration,
  ease,
  leading,
  radius,
  shadow,
  space,
  text,
} from "@ui/theme/tokens.stylex"

const styles = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "fit-content",
    flexShrink: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    height: space.s5,
    gap: space.s1,
    paddingInline: space.s2,
    paddingBlock: space.s0_5,
    borderRadius: radius.xl4,
    borderWidth: 1,
    borderStyle: "solid",
    fontSize: text.xs,
    lineHeight: leading.xs,
    fontWeight: 500,
    transitionProperty: "color, background-color, border-color, box-shadow",
    transitionDuration: duration.color,
    transitionTimingFunction: ease.standard,
    "--carbon-icon-size": space.s3,
  },
  iconStart: { paddingInlineStart: space.s1_5 },
  iconEnd: { paddingInlineEnd: space.s1_5 },
})

const variants = stylex.create({
  default: {
    backgroundColor: color.primary,
    color: color.primaryForeground,
  },
  secondary: {
    backgroundColor: color.secondary,
    color: color.secondaryForeground,
  },
  destructive: {
    backgroundColor: color.buttonDestructiveBg,
    color: color.destructive,
    boxShadow: { default: null, ":focus-visible": shadow.ringInvalid },
  },
  outline: {
    "--carbon-border-color": color.border,
    color: color.foreground,
  },
  ghost: {},
  link: {
    color: color.primary,
    textUnderlineOffset: "4px",
    textDecorationLine: "none",
  },
})

const badgeStyles = {
  base: [styles.base, states.focusRing],
  variants,
  iconStart: styles.iconStart,
  iconEnd: styles.iconEnd,
}

type BadgeVariant = keyof typeof variants

type BadgeProps = useRender.ComponentProps<"span"> & {
  variant?: BadgeVariant
  iconPosition?: "start" | "end" | "both"
  xstyle?: StyleXStyles
}

function Badge({
  variant = "default",
  iconPosition,
  xstyle,
  className,
  render,
  ...props
}: BadgeProps) {
  const sx = stylex.props(
    styles.base,
    states.focusRing,
    variants[variant] ?? variants.default,
    (iconPosition === "start" || iconPosition === "both") && styles.iconStart,
    (iconPosition === "end" || iconPosition === "both") && styles.iconEnd,
    props["aria-invalid"] && states.invalidRing,
    xstyle,
  )

  return useRender({
    defaultTagName: "span",
    render,
    props: {
      "data-slot": "badge",
      "data-variant": variant,
      ...sx,
      ...props,
      className: clsx("carbon-icons", sx.className, className),
    },
  })
}

export { Badge, badgeStyles, type BadgeVariant }
