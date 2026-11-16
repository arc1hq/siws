"use client"

import { use } from "react"
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"

import { ButtonGroupContext, buttonStyles, type ButtonGroupOrientation } from "@ui/base/button"
import { color, leading, radius, space, text } from "@ui/theme/tokens.stylex"

const styles = stylex.create({
  group: { display: "flex", width: "fit-content", alignItems: "stretch" },
  vertical: { flexDirection: "column" },
  text: {
    display: "flex",
    alignItems: "center",
    gap: space.s2,
    borderRadius: "var(--carbon-button-radius)",
    borderWidth: 1,
    borderStyle: "solid",
    backgroundColor: color.muted,
    paddingInline: space.s2_5,
    fontSize: text.sm,
    lineHeight: leading.sm,
    fontWeight: 500,
    "--carbon-icon-size": space.s4,
    "--carbon-button-radius": radius.lg,
  },
  separator: {
    position: "relative",
    alignSelf: "stretch",
    flexShrink: 0,
    backgroundColor: color.keyEdge,
  },
  separatorVertical: { width: 1, marginInlineStart: -1 },
  separatorHorizontal: { height: 1, marginBlockStart: -1 },
})

type ButtonGroupProps = useRender.ComponentProps<"div"> & {
  orientation?: ButtonGroupOrientation
  xstyle?: StyleXStyles
}

function ButtonGroup({
  render,
  ref,
  style,
  orientation = "horizontal",
  xstyle,
  className,
  children,
  ...props
}: ButtonGroupProps) {
  const sx = stylex.props(styles.group, orientation === "vertical" && styles.vertical, xstyle)

  return (
    <ButtonGroupContext value={{ orientation }}>
      {useRender({
        defaultTagName: "div",
        render,
        ref,
        props: {
          role: "group",
          "data-slot": "button-group",
          "data-orientation": orientation,
          ...sx,
          ...props,
          className: clsx(sx.className, className),
          style: { ...sx.style, ...style },
          children,
        },
      })}
    </ButtonGroupContext>
  )
}

type ButtonGroupTextProps = useRender.ComponentProps<"div"> & {
  xstyle?: StyleXStyles
}

function ButtonGroupText({ xstyle, className, render, ...props }: ButtonGroupTextProps) {
  const grouped = use(ButtonGroupContext)
  const sx = stylex.props(styles.text, grouped && buttonStyles.group[grouped.orientation], xstyle)

  return useRender({
    defaultTagName: "div",
    render,
    props: {
      "data-slot": "button-group-text",
      ...sx,
      ...props,
      className: clsx("carbon-icons", sx.className, className),
    },
  })
}

type ButtonGroupSeparatorProps = Omit<SeparatorPrimitive.Props, "className"> & {
  xstyle?: StyleXStyles
  className?: string
}

function ButtonGroupSeparator({
  orientation,
  xstyle,
  className,
  ...props
}: ButtonGroupSeparatorProps) {
  const grouped = use(ButtonGroupContext)
  const resolved = orientation ?? (grouped?.orientation === "vertical" ? "horizontal" : "vertical")
  const sx = stylex.props(
    styles.separator,
    resolved === "vertical" ? styles.separatorVertical : styles.separatorHorizontal,
    xstyle,
  )

  return (
    <SeparatorPrimitive
      data-slot="button-group-separator"
      orientation={resolved}
      {...sx}
      {...props}
      className={clsx(sx.className, className)}
    />
  )
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText }
