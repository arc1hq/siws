"use client"

import type { CSSProperties, ElementType, ReactNode } from "react"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"

import {
  gapStyles,
  paddingInlineStartStyles,
  paddingInlineEndStyles,
  paddingBlockStartStyles,
  paddingBlockEndStyles,
  type SpacingStep,
} from "@ui/lib/spacing"

const styles = stylex.create({
  base: { display: "flex", minWidth: 0 },
  horizontal: { flexDirection: "row" },
  vertical: { flexDirection: "column" },
  grow: { flexGrow: 1 },
  scrollable: { overflow: "auto", minHeight: 0 },
})

const wrapStyles = stylex.create({
  nowrap: { flexWrap: "nowrap" },
  wrap: { flexWrap: "wrap" },
  "wrap-reverse": { flexWrap: "wrap-reverse" },
})

const justifyStyles = stylex.create({
  start: { justifyContent: "flex-start" },
  center: { justifyContent: "center" },
  end: { justifyContent: "flex-end" },
  between: { justifyContent: "space-between" },
  around: { justifyContent: "space-around" },
  evenly: { justifyContent: "space-evenly" },
})

const alignStyles = stylex.create({
  start: { alignItems: "flex-start" },
  center: { alignItems: "center" },
  end: { alignItems: "flex-end" },
  stretch: { alignItems: "stretch" },
  baseline: { alignItems: "baseline" },
})

type SizeValue = number | string

const toSize = (value: SizeValue) => (typeof value === "number" ? `${value}px` : value)

type StackOwnProps = {
  direction?: "horizontal" | "vertical"
  justify?: keyof typeof justifyStyles
  align?: keyof typeof alignStyles
  gap?: SpacingStep
  padding?: SpacingStep
  paddingInline?: SpacingStep
  paddingInlineStart?: SpacingStep
  paddingInlineEnd?: SpacingStep
  paddingBlock?: SpacingStep
  paddingBlockStart?: SpacingStep
  paddingBlockEnd?: SpacingStep
  wrap?: keyof typeof wrapStyles
  grow?: boolean
  scrollable?: boolean
  width?: SizeValue
  height?: SizeValue
  maxWidth?: SizeValue
  minHeight?: SizeValue
  xstyle?: StyleXStyles
  style?: CSSProperties
  className?: string
  children?: ReactNode
}

type StackProps<T extends ElementType = "div"> = StackOwnProps &
  Omit<useRender.ComponentProps<T>, keyof StackOwnProps>

function Stack<T extends ElementType = "div">({
  render,
  ref,
  direction = "vertical",
  justify,
  align,
  gap,
  padding,
  paddingInline,
  paddingInlineStart,
  paddingInlineEnd,
  paddingBlock,
  paddingBlockStart,
  paddingBlockEnd,
  wrap,
  grow,
  scrollable,
  width,
  height,
  maxWidth,
  minHeight,
  xstyle,
  style,
  className,
  ...props
}: StackProps<T>) {
  const inlineStart = paddingInlineStart ?? paddingInline ?? padding
  const inlineEnd = paddingInlineEnd ?? paddingInline ?? padding
  const blockStart = paddingBlockStart ?? paddingBlock ?? padding
  const blockEnd = paddingBlockEnd ?? paddingBlock ?? padding

  const sx = stylex.props(
    styles.base,
    direction === "vertical" ? styles.vertical : styles.horizontal,
    justify && justifyStyles[justify],
    align && alignStyles[align],
    gap != null && gapStyles[gap],
    inlineStart != null && paddingInlineStartStyles[inlineStart],
    inlineEnd != null && paddingInlineEndStyles[inlineEnd],
    blockStart != null && paddingBlockStartStyles[blockStart],
    blockEnd != null && paddingBlockEndStyles[blockEnd],
    wrap != null && wrapStyles[wrap],
    grow && styles.grow,
    scrollable && styles.scrollable,
    xstyle,
  )

  const sizing: CSSProperties = {
    ...sx.style,
    ...(width != null && { width: toSize(width) }),
    ...(height != null && { height: toSize(height) }),
    ...(maxWidth != null && { maxWidth: toSize(maxWidth) }),
    ...(minHeight != null && { minHeight: toSize(minHeight) }),
    ...style,
  }

  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "stack",
      "data-orientation": direction,
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: Object.keys(sizing).length > 0 ? sizing : undefined,
    },
  })
}

function HStack<T extends ElementType = "div">(props: Omit<StackProps<T>, "direction">) {
  return <Stack {...props} direction="horizontal" />
}

function VStack<T extends ElementType = "div">(props: Omit<StackProps<T>, "direction">) {
  return <Stack {...props} direction="vertical" />
}

export { HStack, Stack, VStack, type SpacingStep }
