"use client"

import type { ComponentProps, FocusEvent, MouseEvent } from "react"
import { createContext, use, useState } from "react"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"

import { FieldStateContext } from "@ui/lib/field-state"
import { Button, type ButtonSize, type ButtonVariant } from "@ui/base/button"
import { InputGroupContext } from "@ui/base/input"
import { states } from "@ui/theme/states"
import { color, duration, ease, leading, radius, space, text } from "@ui/theme/tokens.stylex"

type InputGroupAlign = keyof typeof aligns

const InputGroupAddonContext = createContext<{ align: InputGroupAlign } | null>(null)

const styles = stylex.create({
  group: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    alignContent: "center",
    width: "100%",
    minWidth: 0,
    minHeight: space.s8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--carbon-border-color)",
    transitionProperty: "color, background-color, border-color, box-shadow",
    transitionDuration: duration.color,
    transitionTimingFunction: ease.standard,
    outlineStyle: "none",
  },
  disabledFill: { backgroundColor: color.inputDisabledBg },
  addon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: space.s2,
    cursor: "text",
    userSelect: "none",
    color: color.mutedForeground,
    fontSize: text.sm,
    lineHeight: leading.sm,
    fontWeight: 500,
    "--carbon-icon-size": space.s4,
  },
  text: {
    display: "flex",
    alignItems: "center",
    gap: space.s2,
    color: color.mutedForeground,
    fontSize: text.sm,
    lineHeight: leading.sm,
    "--carbon-icon-size": space.s4,
  },
  pullStart: { marginInlineStart: `calc(-1 * ${space.s1})` },
  pullEnd: { marginInlineEnd: `calc(-1 * ${space.s1})` },
})

const buttons = stylex.create({
  xs: { boxShadow: "none", "--carbon-button-radius": `calc(${radius.lg} - ${space.s1})` },
  sm: { boxShadow: "none", "--carbon-button-radius": `calc(${radius.lg} - ${space.s0_5})` },
})

const aligns = stylex.create({
  "inline-start": {
    order: -1,
    paddingInlineStart: space.s2,
    marginInlineEnd: `calc(-1 * ${space.s1})`,
  },
  "inline-end": {
    order: 1,
    paddingInlineEnd: space.s2,
    marginInlineStart: `calc(-1 * ${space.s1})`,
  },
  "block-start": {
    order: -2,
    flexBasis: "100%",
    justifyContent: "flex-start",
    paddingInline: space.s2_5,
    paddingBlockStart: space.s2,
  },
  "block-end": {
    order: 2,
    flexBasis: "100%",
    justifyContent: "flex-start",
    paddingInline: space.s2_5,
    paddingBlockEnd: space.s2,
  },
})

const inputGroupStyles = {
  base: [styles.group, states.fieldSurface],
  focused: states.fieldFocused,
  invalid: states.invalidRing,
  disabled: [styles.disabledFill, states.disabled],
  addon: styles.addon,
  aligns,
  text: styles.text,
  buttons,
}

type Overrides = { xstyle?: StyleXStyles; className?: string }

type InputGroupProps = Omit<
  useRender.ComponentProps<"div", { disabled: boolean }>,
  "onFocus" | "onBlur"
> &
  Overrides & {
    disabled?: boolean
    invalid?: boolean
    onFocus?: (event: FocusEvent<HTMLDivElement>) => void
    onBlur?: (event: FocusEvent<HTMLDivElement>) => void
  }

function InputGroup({
  render,
  ref,
  style,
  disabled: disabledProp = false,
  invalid: invalidProp = false,
  xstyle,
  className,
  onFocus,
  onBlur,
  ...props
}: InputGroupProps) {
  const fieldState = use(FieldStateContext)
  const disabled = disabledProp || fieldState?.disabled === true
  const invalid = invalidProp || fieldState?.valid === false
  const [focused, setFocused] = useState(false)

  const sx = stylex.props(
    styles.group,
    states.fieldSurface,
    focused && states.fieldFocused,
    invalid && states.invalidRing,
    disabled && styles.disabledFill,
    disabled && states.disabled,
    xstyle,
  )

  const isControl = (target: EventTarget) =>
    target instanceof Element && target.matches('[data-slot="input-group-control"]')

  return (
    <InputGroupContext value={{ disabled, invalid }}>
      {useRender({
        defaultTagName: "div",
        render,
        ref,
        state: { disabled },
        props: {
          role: "group",
          "data-slot": "input-group",
          ...sx,
          ...props,
          onFocus: (event: FocusEvent<HTMLDivElement>) => {
            if (isControl(event.target)) setFocused(true)
            onFocus?.(event)
          },
          onBlur: (event: FocusEvent<HTMLDivElement>) => {
            if (isControl(event.target)) setFocused(false)
            onBlur?.(event)
          },
          className: clsx(sx.className, className),
          style: { ...sx.style, ...style },
        },
      })}
    </InputGroupContext>
  )
}

type InputGroupAddonProps = useRender.ComponentProps<"div"> &
  Overrides & { align?: InputGroupAlign }

function InputGroupAddon({
  render,
  ref,
  style,
  align = "inline-start",
  xstyle,
  className,
  onClick,
  ...props
}: InputGroupAddonProps) {
  const sx = stylex.props(styles.addon, aligns[align], xstyle)

  return (
    <InputGroupAddonContext value={{ align }}>
      {useRender({
        defaultTagName: "div",
        render,
        ref,
        props: {
          "data-slot": "input-group-addon",
          "data-align": align,
          ...sx,
          ...props,
          onClick: (event: MouseEvent<HTMLDivElement>) => {
            if (event.target instanceof Element && !event.target.closest("button")) {
              event.currentTarget.parentElement
                ?.querySelector<HTMLElement>('[data-slot="input-group-control"]')
                ?.focus()
            }
            onClick?.(event)
          },
          className: clsx("carbon-icons", sx.className, className),
          style: { ...sx.style, ...style },
        },
      })}
    </InputGroupAddonContext>
  )
}

type InputGroupButtonProps = Omit<ComponentProps<typeof Button>, "size"> & {
  size?: Extract<ButtonSize, "xs" | "sm" | "icon-xs" | "icon-sm">
  variant?: ButtonVariant
}

function InputGroupButton({
  variant = "ghost",
  size = "xs",
  xstyle,
  ...props
}: InputGroupButtonProps) {
  const align = use(InputGroupAddonContext)?.align

  return (
    <Button
      data-slot="input-group-button"
      variant={variant}
      size={size}
      xstyle={[
        buttons[size === "xs" || size === "icon-xs" ? "xs" : "sm"],
        align === "inline-start" && styles.pullStart,
        align === "inline-end" && styles.pullEnd,
        xstyle,
      ]}
      {...props}
    />
  )
}

function InputGroupText({
  render,
  ref,
  style,
  xstyle,
  className,
  ...props
}: useRender.ComponentProps<"span"> & Overrides) {
  const sx = stylex.props(styles.text, xstyle)

  return useRender({
    defaultTagName: "span",
    render,
    ref,
    props: {
      "data-slot": "input-group-text",
      ...sx,
      ...props,
      className: clsx("carbon-icons", sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  inputGroupStyles,
  type InputGroupAlign,
}
