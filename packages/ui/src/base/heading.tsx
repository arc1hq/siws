"use client"

import type { CSSProperties } from "react"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"

import { textStyles } from "@ui/base/text"
import { tracking } from "@ui/theme/tokens.stylex"

const styles = stylex.create({ base: { letterSpacing: tracking.tight } })
const sizes = {
  sm: textStyles.sizes.sm,
  base: textStyles.sizes.base,
  lg: textStyles.sizes.lg,
  xl2: textStyles.sizes.xl2,
  xl3: textStyles.sizes.xl3,
  xl4: textStyles.sizes.xl4,
}
const levelSizes = {
  1: "xl2",
  2: "lg",
  3: "base",
  4: "sm",
  5: "sm",
  6: "sm",
} as const satisfies Record<number, keyof typeof sizes>
const headingStyles = { base: styles.base, sizes, weights: textStyles.weights }

type HeadingProps = useRender.ComponentProps<"h2"> & {
  level?: keyof typeof levelSizes
  size?: keyof typeof headingStyles.sizes
  weight?: keyof typeof headingStyles.weights
  xstyle?: StyleXStyles
  style?: CSSProperties
}

function Heading({
  render,
  ref,
  level = 2,
  size = levelSizes[level],
  weight = "semibold",
  xstyle,
  className,
  style,
  ...props
}: HeadingProps) {
  const sx = stylex.props(
    styles.base,
    headingStyles.sizes[size],
    headingStyles.weights[weight],
    xstyle,
  )
  return useRender({
    defaultTagName: `h${level}`,
    render,
    ref,
    props: {
      "data-slot": "heading",
      "data-size": size,
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

export { Heading, headingStyles, type HeadingProps }
