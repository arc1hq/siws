import * as stylex from "@stylexjs/stylex"

import { color, layer, radius, shadow, space } from "./tokens.stylex"

const invalidBorder = `light-dark(${color.destructive}, color-mix(in oklab, ${color.destructive} 50%, transparent))`
const inputBg = `light-dark(transparent, color-mix(in oklab, ${color.input} 30%, transparent))`
const fieldEdge = "light-dark(oklch(0 0 0 / 10%), oklch(1 0 0 / 8%))"

export const states = stylex.create({
  transparent: { opacity: 0 },
  popupTransparent: { opacity: 0, transform: "scale(0.95)" },
  popupSlideTop: { transform: `scale(0.95) translateY(${space.s2})` },
  popupSlideBottom: { transform: `scale(0.95) translateY(calc(-1 * ${space.s2}))` },
  popupSlideLeft: { transform: `scale(0.95) translateX(${space.s2})` },
  popupSlideRight: { transform: `scale(0.95) translateX(calc(-1 * ${space.s2}))` },
  instant: { transitionDuration: "0s" },

  focusRing: {
    borderColor: {
      default: `var(--carbon-border-color, ${color.transparent})`,
      ":focus-visible": color.ring,
    },
    boxShadow: { default: null, ":focus-visible": shadow.ring },
    outlineStyle: "none",
  },

  focusWithinRing: {
    borderColor: {
      default: `var(--carbon-border-color, ${color.transparent})`,
      ":focus-within": color.ring,
    },
    boxShadow: { default: null, ":focus-within": shadow.ring },
    outlineStyle: "none",
  },

  ring: { borderColor: color.ring, boxShadow: shadow.ring },

  rowFocusRing: {
    boxShadow: { default: null, ":focus-visible": shadow.rowRing },
    outlineStyle: "none",
  },

  invalidRing: {
    borderColor: invalidBorder,
    boxShadow: { default: shadow.ringInvalid, ":focus-visible": shadow.ringInvalid },
  },

  disabled: { opacity: 0.5, pointerEvents: "none" },

  popupSurface: {
    backgroundColor: color.popover,
    color: color.popoverForeground,
    boxShadow: shadow.popup,
    outlineStyle: "none",
  },

  itemHighlight: {
    backgroundColor: color.itemHighlightBg,
    boxShadow: `inset 0 0 0 1px ${color.itemHighlightRing}`,
  },

  itemHighlightDestructive: {
    backgroundColor: `color-mix(in oklab, ${color.destructive} 6%, transparent)`,
    boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color.destructive} 10%, transparent)`,
  },

  key: {
    "--carbon-border-color": color.keyEdge,
    backgroundColor: color.keyBg,
    backgroundImage: `linear-gradient(to bottom, ${color.keyTop}, transparent)`,
    backgroundOrigin: "border-box",
    "--carbon-key-surface": shadow.key,
  },

  choice: {
    "--carbon-border-color": color.input,
    backgroundColor: inputBg,
  },

  choiceChecked: {
    "--carbon-border-color": color.primary,
    backgroundColor: color.primary,
    color: color.primaryForeground,
  },

  keySurface: {
    boxShadow: {
      default: "var(--carbon-key-surface)",
      ":focus-visible": `var(--carbon-key-surface), ${shadow.ring}`,
    },
  },

  fieldSurface: {
    "--carbon-border-color": fieldEdge,
    borderColor: {
      default: "var(--carbon-border-color)",
      ":hover": color.fieldHoverEdge,
      ":focus-visible": color.fieldFocusEdge,
    },
    backgroundColor: { default: color.fieldBg, ":disabled": color.inputDisabledBg },
    backgroundClip: "padding-box",
    boxShadow: { default: shadow.field, ":focus-visible": `${shadow.field}, ${shadow.fieldFocus}` },
  },

  fieldFocused: {
    borderColor: color.fieldFocusEdge,
    boxShadow: `${shadow.field}, ${shadow.fieldFocus}`,
  },

  fieldFocusedInset: {
    "::after": {
      content: "''",
      position: "absolute",
      inset: 0,
      zIndex: layer.overlay,
      borderRadius: "inherit",
      boxShadow: `inset 0 0 0 1px ${color.fieldFocusEdge}, inset 0 0 0 3px ${color.fieldHalo}`,
      pointerEvents: "none",
    },
  },

  well: {
    backgroundColor: color.well,
    boxShadow: shadow.well,
  },

  wellKey: {
    "--carbon-border-color": color.wellKeyEdge,
    backgroundColor: color.wellKey,
    backgroundImage: "none",
    "--carbon-key-surface": shadow.wellKey,
  },

  popupItem: {
    borderRadius: `max(0px, calc(var(--carbon-popup-radius, ${radius.lg}) - ${space.s1}))`,
  },

  iconTile: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderRadius: radius.lg,
    backgroundColor: color.card,
    boxShadow: `0 0 0 1px ${color.border}`,
    color: color.foreground,
  },

  trayFooter: {
    position: "relative",
    padding: `var(--carbon-tray-spacing, ${space.s3})`,
    paddingBlockStart: `calc(${radius.xl} + var(--carbon-tray-spacing, ${space.s3}))`,
    backgroundColor: color.tray,
    "::before": {
      content: "''",
      position: "absolute",
      insetInline: 0,
      insetBlockStart: `calc(-1 * ${space.s1})`,
      height: `calc(${radius.xl} + ${space.s1})`,
      borderEndStartRadius: radius.xl,
      borderEndEndRadius: radius.xl,
      backgroundColor: `var(--carbon-tray-body-bg, ${color.popover})`,
      boxShadow: shadow.raised,
      clipPath: `inset(${space.s1} 0 calc(-1 * ${space.s2}) 0)`,
      pointerEvents: "none",
    },
  },

  srOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  },

  positioner: { isolation: "isolate", zIndex: layer.popup, outlineStyle: "none" },
})

export const popupSlide = {
  top: states.popupSlideTop,
  bottom: states.popupSlideBottom,
  left: states.popupSlideLeft,
  right: states.popupSlideRight,
  "inline-start": states.popupSlideLeft,
  "inline-end": states.popupSlideRight,
}
