"use client"

import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"

import { breakpoints } from "@ui/theme/breakpoints.stylex"
import { color, leading, radius, space, text } from "@ui/theme/tokens.stylex"

const styles = stylex.create({
  root: {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    rowGap: space.s0_5,
    width: "100%",
    paddingInline: space.s4,
    paddingBlock: space.s3,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "solid",
    color: color.foreground,
    textAlign: "start",
    fontSize: text.sm,
    lineHeight: leading.sm,
    "--carbon-icon-size": space.s4,
  },
  title: { gridColumn: "2", fontWeight: 500 },
  description: {
    gridColumn: "2",
    color: color.mutedForeground,
    textWrap: { default: "balance", [breakpoints.md]: "pretty" },
  },
  action: {
    gridColumn: "3",
    gridRowStart: "1",
    gridRowEnd: "span 2",
    alignSelf: "start",
    marginInlineStart: space.s2,
  },
})

const variants = stylex.create({
  default: {
    borderColor: color.border,
    backgroundColor: color.card,
    "--carbon-alert-accent": color.foreground,
  },
  info: {
    borderColor: color.infoBorder,
    backgroundColor: color.infoBg,
    "--carbon-alert-accent": color.info,
  },
  success: {
    borderColor: color.successBorder,
    backgroundColor: color.successBg,
    "--carbon-alert-accent": color.success,
  },
  warning: {
    borderColor: color.warningBorder,
    backgroundColor: color.warningBg,
    "--carbon-alert-accent": color.warning,
  },
  destructive: {
    borderColor: `color-mix(in oklab, ${color.destructive} 30%, transparent)`,
    backgroundColor: `color-mix(in oklab, ${color.destructive} 6%, transparent)`,
    "--carbon-alert-accent": color.destructive,
  },
})

const alertStyles = { base: styles.root, variants }

type AlertVariant = keyof typeof variants

type Overrides = { xstyle?: StyleXStyles; className?: string }

type AlertProps = useRender.ComponentProps<"div"> & Overrides & { variant?: AlertVariant }

function Alert({
  render,
  ref,
  style,
  variant = "default",
  xstyle,
  className,
  ...props
}: AlertProps) {
  const sx = stylex.props(styles.root, variants[variant] ?? variants.default, xstyle)
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "alert",
      "data-variant": variant,
      role: "alert",
      ...sx,
      ...props,
      className: clsx("carbon-icons", sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

function AlertTitle({
  render,
  ref,
  style,
  xstyle,
  className,
  ...props
}: useRender.ComponentProps<"div"> & Overrides) {
  const sx = stylex.props(styles.title, xstyle)
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "alert-title",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

function AlertDescription({
  render,
  ref,
  style,
  xstyle,
  className,
  ...props
}: useRender.ComponentProps<"div"> & Overrides) {
  const sx = stylex.props(styles.description, xstyle)
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "alert-description",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

function AlertAction({
  render,
  ref,
  style,
  xstyle,
  className,
  ...props
}: useRender.ComponentProps<"div"> & Overrides) {
  const sx = stylex.props(styles.action, xstyle)
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "alert-action",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

export { Alert, AlertAction, AlertDescription, AlertTitle, alertStyles, type AlertVariant }
