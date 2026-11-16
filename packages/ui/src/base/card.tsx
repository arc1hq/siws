"use client"

import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"

import { states } from "@ui/theme/states"
import { color, leading, radius, shadow, space, text } from "@ui/theme/tokens.stylex"

const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    "--carbon-card-spacing": space.s4,
    "--carbon-card-title-size": text.base,
    rowGap: "var(--carbon-card-spacing)",
    paddingBlock: "var(--carbon-card-spacing)",
    overflow: "hidden",
    borderRadius: radius.xl,
    backgroundColor: color.card,
    color: color.cardForeground,
    boxShadow: shadow.raised,
    fontSize: text.sm,
    lineHeight: leading.sm,
  },
  header: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gridAutoRows: "min-content",
    alignItems: "start",
    rowGap: space.s1,
    paddingInline: "var(--carbon-card-spacing)",
  },
  title: {
    gridColumnStart: "1",
    fontSize: "var(--carbon-card-title-size)",
    lineHeight: leading.base,
    fontWeight: 500,
  },
  description: { gridColumnStart: "1", color: color.mutedForeground },
  action: {
    gridColumnStart: "2",
    gridRowStart: "1",
    gridRowEnd: "span 2",
    alignSelf: "start",
    justifySelf: "end",
  },
  content: { paddingInline: "var(--carbon-card-spacing)" },
  footer: {
    display: "flex",
    alignItems: "center",
    "--carbon-tray-spacing": "calc(var(--carbon-card-spacing) * 0.75)",
    "--carbon-tray-body-bg": color.card,
    marginBlockStart: `calc(-1 * ${radius.xl})`,
    marginBlockEnd: "calc(-1 * var(--carbon-card-spacing))",
  },
})

const sizes = stylex.create({
  default: {},
  sm: {
    "--carbon-card-spacing": space.s3,
    "--carbon-card-title-size": text.sm,
  },
})

const cardStyles = {
  base: styles.root,
  sizes,
  header: styles.header,
  title: styles.title,
  description: styles.description,
  action: styles.action,
  content: styles.content,
  footer: [states.trayFooter, styles.footer],
}

type CardSize = keyof typeof sizes

type Overrides = { xstyle?: StyleXStyles; className?: string }

type CardProps = useRender.ComponentProps<"div"> & Overrides & { size?: CardSize }

function Card({ render, ref, style, size = "default", xstyle, className, ...props }: CardProps) {
  const sx = stylex.props(styles.root, sizes[size], xstyle)
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "card",
      "data-size": size,
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

function CardHeader({
  render,
  ref,
  style,
  xstyle,
  className,
  ...props
}: useRender.ComponentProps<"div"> & Overrides) {
  const sx = stylex.props(styles.header, xstyle)
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "card-header",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

function CardTitle({
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
      "data-slot": "card-title",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

function CardDescription({
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
      "data-slot": "card-description",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

function CardAction({
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
      "data-slot": "card-action",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

function CardContent({
  render,
  ref,
  style,
  xstyle,
  className,
  ...props
}: useRender.ComponentProps<"div"> & Overrides) {
  const sx = stylex.props(styles.content, xstyle)
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "card-content",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

function CardFooter({
  render,
  ref,
  style,
  xstyle,
  className,
  ...props
}: useRender.ComponentProps<"div"> & Overrides) {
  const sx = stylex.props(states.trayFooter, styles.footer, xstyle)
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "card-footer",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardStyles,
  type CardSize,
}
