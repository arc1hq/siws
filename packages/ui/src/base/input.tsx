"use client"

import { createContext, use } from "react"
import type { CSSProperties } from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"

import { stateStyles } from "@ui/lib/state-styles"
import { breakpoints } from "@ui/theme/breakpoints.stylex"
import { FieldStateContext } from "@ui/lib/field-state"
import { states } from "@ui/theme/states"
import { color, duration, ease, leading, radius, space, text } from "@ui/theme/tokens.stylex"

const InputGroupContext = createContext<{ disabled: boolean; invalid: boolean } | null>(null)

const styles = stylex.create({
  base: {
    width: "100%",
    minWidth: 0,
    height: space.s8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "solid",
    paddingInline: space.s2_5,
    paddingBlock: space.s1,
    fontSize: { default: text.base, [breakpoints.md]: text.sm },
    lineHeight: { default: leading.base, [breakpoints.md]: leading.sm },
    color: color.foreground,
    transitionProperty: "color, background-color, border-color, box-shadow",
    transitionDuration: duration.color,
    transitionTimingFunction: ease.standard,
    opacity: { default: 1, ":disabled": 0.5 },
    pointerEvents: { default: null, ":disabled": "none" },
    "::placeholder": { color: color.mutedForeground },
    "::file-selector-button": {
      height: space.s6,
      marginInlineEnd: space.s2,
      borderWidth: 0,
      backgroundColor: color.transparent,
      color: color.foreground,
      fontSize: text.sm,
      lineHeight: leading.sm,
      fontWeight: 500,
    },
  },
  inGroup: {
    flexGrow: 1,
    flexBasis: 0,
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: { default: color.transparent, ":disabled": color.transparent },
    boxShadow: { default: "none", ":focus-visible": "none" },
    opacity: { default: 1, ":disabled": 1 },
  },
})

const inputStyles = {
  base: [styles.base, states.focusRing, states.fieldSurface],
  invalid: states.invalidRing,
  inGroup: styles.inGroup,
}

type InputProps = Omit<InputPrimitive.Props, "className" | "style"> & {
  style?: CSSProperties
  xstyle?: StyleXStyles
  className?: string
}

function Input({
  disabled,
  "aria-invalid": ariaInvalid,
  xstyle,
  className,
  style,
  ...props
}: InputProps) {
  const fieldState = use(FieldStateContext)
  const group = use(InputGroupContext)
  const invalid = group?.invalid || (ariaInvalid != null && ariaInvalid !== false)

  return (
    <InputPrimitive
      data-slot={group ? "input-group-control" : "input"}
      {...props}
      disabled={group?.disabled || disabled}
      aria-invalid={invalid || undefined}
      {...stateStyles(
        (state) => [
          styles.base,
          states.focusRing,
          states.fieldSurface,
          (state.valid === false || fieldState?.valid === false || invalid) &&
            !group &&
            states.invalidRing,
          state.disabled && !group && states.disabled,
          group && styles.inGroup,
          xstyle,
        ],
        { className, style },
      )}
    />
  )
}

export { Input, InputGroupContext, inputStyles }
