"use client"

import type { CSSProperties } from "react"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"

import { widths } from "@ui/theme/widths"
import { space } from "@ui/theme/tokens.stylex"

const styles = stylex.create({
  base: { minWidth: 0, marginInline: "auto", paddingInline: space.s6 },
})
const containerStyles = { base: styles.base, widths }

type ContainerProps = useRender.ComponentProps<"div"> & {
  size?: keyof typeof widths
  xstyle?: StyleXStyles
  style?: CSSProperties
}

function Container({
  render,
  ref,
  size = "xl3",
  xstyle,
  className,
  style,
  ...props
}: ContainerProps) {
  const sx = stylex.props(styles.base, widths[size], xstyle)
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "container",
      "data-size": size,
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

export { Container, containerStyles, type ContainerProps }
