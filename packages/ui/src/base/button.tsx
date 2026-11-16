"use client"

import { createContext, use, type CSSProperties } from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"

import { states } from "@ui/theme/states"
import {
  color,
  duration,
  ease,
  layer,
  leading,
  radius,
  shadow,
  space,
  text,
} from "@ui/theme/tokens.stylex"

const buttonGhostHoverBg = `light-dark(${color.muted}, color-mix(in oklab, ${color.muted} 50%, transparent))`
const buttonDestructiveFill = "oklch(0.577 0.245 27.325)"
const buttonDestructiveForeground = "oklch(0.985 0 0)"
const buttonDestructiveEdge = "oklch(0 0 0 / 20%)"
const buttonDestructiveSheen = "oklch(1 0 0 / 20%)"
const buttonReflection = "oklch(1 0 0 / 10%)"
const keyHoverBg = "light-dark(oklch(0.96 0 0), oklch(0.245 0 0))"

type ButtonGroupOrientation = "horizontal" | "vertical"

const ButtonGroupContext = createContext<{ orientation: ButtonGroupOrientation } | null>(null)

const styles = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    flexShrink: 0,
    userSelect: "none",
    borderRadius: "var(--carbon-button-radius)",
    borderWidth: 1,
    borderStyle: "solid",
    fontSize: text.sm,
    lineHeight: leading.sm,
    fontWeight: 500,
    transitionProperty: "color, background-color, border-color, box-shadow, opacity, transform",
    transitionDuration: duration.color,
    transitionTimingFunction: ease.standard,
    pointerEvents: { default: null, ":disabled": "none" },
    opacity: { default: 1, ":disabled": 0.5 },
    "--carbon-icon-size": space.s4,
    "--carbon-button-radius": radius.lg,
  },
  pressable: {
    transform: {
      default: null,
      "@media (hover: hover)": { default: null, ":active": "scale(0.97)" },
    },
  },
  gloss: {
    position: "relative",
    isolation: "isolate",
    "--carbon-button-sheen-opacity": { default: 0.5, ":hover": 1 },
    "::before": {
      content: "''",
      position: "absolute",
      inset: -1,
      zIndex: -1,
      borderRadius: "inherit",
      pointerEvents: "none",
      backgroundImage: "linear-gradient(to bottom, var(--carbon-button-sheen), transparent)",
      opacity: "var(--carbon-button-sheen-opacity)",
      transitionProperty: "opacity",
      transitionDuration: duration.sheen,
      transitionTimingFunction: ease.tactile,
    },
    "::after": {
      content: "''",
      position: "absolute",
      inset: -1,
      zIndex: -1,
      borderRadius: "inherit",
      pointerEvents: "none",
      backgroundImage: `linear-gradient(to bottom, ${buttonReflection} 46%, transparent 54%)`,
      mixBlendMode: "overlay",
    },
  },
})

const variants = stylex.create({
  default: {
    backgroundColor: color.primary,
    color: color.primaryForeground,
    boxShadow: {
      default: shadow.buttonPrimary,
      ":focus-visible": `${shadow.buttonPrimary}, ${shadow.ring}`,
    },
    "--carbon-border-color": color.buttonPrimaryEdge,
    "--carbon-button-sheen": color.buttonPrimarySheen,
    "--carbon-button-highlight": color.buttonPrimaryHighlight,
    "--carbon-button-drop": color.buttonDrop,
  },
  outline: {
    backgroundColor: { default: color.keyBg, ":hover": keyHoverBg },
    backgroundImage: `linear-gradient(to bottom, ${color.keyTop}, transparent)`,
    backgroundOrigin: "border-box",
    "--carbon-border-color": color.keyEdge,
    "--carbon-button-highlight": color.keyHighlight,
    "--carbon-button-drop": color.keyDrop,
    color: color.foreground,
    boxShadow: {
      default: shadow.key,
      ":focus-visible": `${shadow.key}, ${shadow.ring}`,
    },
    "--carbon-menu-open-bg": keyHoverBg,
    "--carbon-menu-open-fg": color.foreground,
  },
  secondary: {
    "--carbon-border-color": color.transparent,
    backgroundColor: { default: color.secondary, ":hover": color.secondaryHoverBg },
    color: color.secondaryForeground,
    "--carbon-menu-open-bg": color.secondaryHoverBg,
    "--carbon-menu-open-fg": color.secondaryForeground,
  },
  ghost: {
    "--carbon-border-color": color.transparent,
    backgroundColor: { default: null, ":hover": buttonGhostHoverBg },
    color: { default: null, ":hover": color.foreground },
    "--carbon-menu-open-bg": color.itemHighlightBg,
    "--carbon-menu-open-fg": color.foreground,
  },
  destructive: {
    backgroundColor: buttonDestructiveFill,
    color: buttonDestructiveForeground,
    borderColor: {
      default: buttonDestructiveEdge,
      ":focus-visible": `color-mix(in oklab, ${color.destructive} 40%, transparent)`,
    },
    boxShadow: {
      default: shadow.buttonDestructive,
      ":focus-visible": `${shadow.buttonDestructive}, ${shadow.ringInvalid}`,
    },
    "--carbon-button-sheen": buttonDestructiveSheen,
    "--carbon-button-highlight": color.buttonDestructiveHighlight,
    "--carbon-button-drop": color.buttonDrop,
  },
  link: {
    "--carbon-border-color": color.transparent,
    color: color.primary,
    textUnderlineOffset: "4px",
    textDecorationLine: { default: "none", ":hover": "underline" },
  },
})

const sizes = stylex.create({
  default: { height: space.s8, gap: space.s1_5, paddingInline: space.s2_5 },
  xs: {
    height: space.s6,
    gap: space.s1,
    "--carbon-button-radius": radius.md,
    paddingInline: space.s2,
    fontSize: text.xs,
    lineHeight: leading.xs,
    "--carbon-icon-size": space.s3,
  },
  sm: {
    height: space.s7,
    gap: space.s1,
    "--carbon-button-radius": radius.md,
    paddingInline: space.s2_5,
    fontSize: text.compact,
    lineHeight: leading.compact,
    "--carbon-icon-size": space.s3_5,
  },
  lg: { height: space.s9, gap: space.s1_5, paddingInline: space.s2_5 },
  icon: { width: space.s8, height: space.s8 },
  "icon-xs": {
    width: space.s6,
    height: space.s6,
    "--carbon-button-radius": radius.md,
    "--carbon-icon-size": space.s3,
  },
  "icon-sm": {
    width: space.s7,
    height: space.s7,
    "--carbon-button-radius": radius.md,
  },
  "icon-lg": { width: space.s9, height: space.s9 },
})

const iconStart = stylex.create({
  default: { paddingInlineStart: space.s2 },
  xs: { paddingInlineStart: space.s1_5 },
  sm: { paddingInlineStart: space.s1_5 },
  lg: { paddingInlineStart: space.s3 },
  icon: {},
  "icon-xs": {},
  "icon-sm": {},
  "icon-lg": {},
})

const iconEnd = stylex.create({
  default: { paddingInlineEnd: space.s2 },
  xs: { paddingInlineEnd: space.s1_5 },
  sm: { paddingInlineEnd: space.s1_5 },
  lg: { paddingInlineEnd: space.s3 },
  icon: {},
  "icon-xs": {},
  "icon-sm": {},
  "icon-lg": {},
})

const group = stylex.create({
  horizontal: {
    position: "relative",
    zIndex: { default: null, ":focus-visible": layer.raised },
    boxShadow: {
      default:
        "inset 0 1px 0 var(--carbon-button-highlight, transparent), 0 1px 0 var(--carbon-button-drop, transparent)",
      ":focus-visible": `inset 0 1px 0 var(--carbon-button-highlight, transparent), 0 1px 0 var(--carbon-button-drop, transparent), ${shadow.ring}`,
    },
    borderStartStartRadius: {
      default: 0,
      ":nth-child(1 of [data-slot])": "var(--carbon-button-radius)",
    },
    borderEndStartRadius: {
      default: 0,
      ":nth-child(1 of [data-slot])": "var(--carbon-button-radius)",
    },
    borderStartEndRadius: {
      default: 0,
      ":nth-last-child(1 of [data-slot])": "var(--carbon-button-radius)",
    },
    borderEndEndRadius: {
      default: 0,
      ":nth-last-child(1 of [data-slot])": "var(--carbon-button-radius)",
    },
    borderInlineStartWidth: { default: 0, ":nth-child(1 of [data-slot])": 1 },
  },
  vertical: {
    position: "relative",
    zIndex: { default: null, ":focus-visible": layer.raised },
    boxShadow: {
      default:
        "inset 0 1px 0 var(--carbon-button-highlight, transparent), 0 1px 0 var(--carbon-button-drop, transparent)",
      ":focus-visible": `inset 0 1px 0 var(--carbon-button-highlight, transparent), 0 1px 0 var(--carbon-button-drop, transparent), ${shadow.ring}`,
    },
    borderStartStartRadius: {
      default: 0,
      ":nth-child(1 of [data-slot])": "var(--carbon-button-radius)",
    },
    borderStartEndRadius: {
      default: 0,
      ":nth-child(1 of [data-slot])": "var(--carbon-button-radius)",
    },
    borderEndStartRadius: {
      default: 0,
      ":nth-last-child(1 of [data-slot])": "var(--carbon-button-radius)",
    },
    borderEndEndRadius: {
      default: 0,
      ":nth-last-child(1 of [data-slot])": "var(--carbon-button-radius)",
    },
    borderBlockStartWidth: { default: 0, ":nth-child(1 of [data-slot])": 1 },
  },
})

const buttonStyles = {
  base: [styles.base, states.focusRing],
  pressable: styles.pressable,
  gloss: styles.gloss,
  variants,
  sizes,
  iconStart,
  iconEnd,
  group,
}

type ButtonVariant = keyof typeof variants
type ButtonSize = keyof typeof sizes

type ButtonProps = Omit<ButtonPrimitive.Props, "className" | "style"> & {
  variant?: ButtonVariant
  size?: ButtonSize
  iconPosition?: "start" | "end" | "both"
  xstyle?: StyleXStyles
  className?: string
  style?: CSSProperties
}

function Button({
  variant = "default",
  size = "default",
  iconPosition,
  xstyle,
  className,
  style,
  ...props
}: ButtonProps) {
  const grouped = use(ButtonGroupContext)
  const glossy = variant === "default" || variant === "destructive"
  const raised = glossy || variant === "outline"

  const sx = stylex.props(
    styles.base,
    states.focusRing,
    glossy && styles.gloss,
    !grouped && raised && styles.pressable,
    variants[variant],
    sizes[size],
    (iconPosition === "start" || iconPosition === "both") && iconStart[size],
    (iconPosition === "end" || iconPosition === "both") && iconEnd[size],
    grouped && group[grouped.orientation],
    props["aria-invalid"] && states.invalidRing,
    xstyle,
  )

  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      {...sx}
      {...props}
      className={clsx("carbon-icons", sx.className, className)}
      style={{ ...sx.style, ...style }}
    />
  )
}

export {
  Button,
  ButtonGroupContext,
  buttonStyles,
  type ButtonGroupOrientation,
  type ButtonSize,
  type ButtonVariant,
}
