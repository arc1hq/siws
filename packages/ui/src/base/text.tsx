"use client"

import type { CSSProperties } from "react"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"

import { color, leading, text } from "@ui/theme/tokens.stylex"

const sizes = stylex.create({
  xs: { fontSize: text.xs, lineHeight: leading.xs },
  sm: { fontSize: text.sm, lineHeight: leading.sm },
  base: { fontSize: text.base, lineHeight: leading.base },
  lg: { fontSize: text.lg, lineHeight: leading.lg },
  xl2: { fontSize: text.xl2, lineHeight: leading.xl2 },
  xl3: { fontSize: text.xl3, lineHeight: leading.xl3 },
  xl4: { fontSize: text.xl4, lineHeight: leading.xl4 },
})

const tones = stylex.create({
  muted: { color: color.mutedForeground },
})

const weights = stylex.create({
  normal: { fontWeight: 400 },
  medium: { fontWeight: 500 },
  semibold: { fontWeight: 600 },
  bold: { fontWeight: 700 },
})

const textStyles = { sizes, tones, weights }

type TextProps = useRender.ComponentProps<"span"> & {
  size?: keyof typeof sizes
  tone?: keyof typeof tones
  weight?: keyof typeof weights
  xstyle?: StyleXStyles
  style?: CSSProperties
}

function Text({ render, ref, size, tone, weight, xstyle, className, style, ...props }: TextProps) {
  const sx = stylex.props(
    size && sizes[size],
    tone && tones[tone],
    weight && weights[weight],
    xstyle,
  )
  return useRender({
    defaultTagName: "span",
    render,
    ref,
    props: {
      "data-slot": "text",
      "data-size": size,
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

export { Text, textStyles, type TextProps }
