import * as stylex from "@stylexjs/stylex"

export const color = stylex.defineVars({
  background: "light-dark(oklch(1 0 0), oklch(0.145 0 0))",
  foreground: "light-dark(oklch(0.145 0 0), oklch(0.985 0 0))",
  card: "light-dark(oklch(1 0 0), oklch(0.205 0 0))",
  cardForeground: "light-dark(oklch(0.145 0 0), oklch(0.985 0 0))",
  popover: "light-dark(oklch(1 0 0), oklch(0.205 0 0))",
  popoverForeground: "light-dark(oklch(0.145 0 0), oklch(0.985 0 0))",
  primary: "light-dark(oklch(0.205 0 0), oklch(0.922 0 0))",
  primaryForeground: "light-dark(oklch(0.985 0 0), oklch(0.205 0 0))",
  secondary: "light-dark(oklch(0.97 0 0), oklch(0.269 0 0))",
  secondaryForeground: "light-dark(oklch(0.205 0 0), oklch(0.985 0 0))",
  muted: "light-dark(oklch(0.97 0 0), oklch(0.269 0 0))",
  mutedForeground: "light-dark(oklch(0.556 0 0), oklch(0.708 0 0))",
  destructive: "light-dark(oklch(0.577 0.245 27.325), oklch(0.704 0.191 22.216))",
  border: "light-dark(oklch(0.922 0 0), oklch(1 0 0 / 10%))",
  input: "light-dark(oklch(0.922 0 0), oklch(1 0 0 / 15%))",
  ring: "light-dark(oklch(0.708 0 0), oklch(0.556 0 0))",

  overlay: "light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 40%))",
  sidebar: "light-dark(oklch(0.985 0 0), oklch(0.205 0 0))",

  buttonDestructiveBg: (): string =>
    `light-dark(color-mix(in oklab, ${color.destructive} 10%, transparent), color-mix(in oklab, ${color.destructive} 20%, transparent))`,

  buttonPrimaryEdge: "light-dark(oklch(0 0 0 / 40%), oklch(0 0 0 / 10%))",
  buttonPrimaryHighlight: "light-dark(oklch(1 0 0 / 16%), oklch(1 0 0 / 60%))",
  buttonPrimarySheen: "light-dark(oklch(1 0 0 / 14%), oklch(1 0 0 / 40%))",
  buttonDestructiveHighlight: "oklch(1 0 0 / 16%)",
  buttonDrop: "light-dark(oklch(0 0 0 / 20%), oklch(0 0 0 / 50%))",
  secondaryHoverBg: "light-dark(oklch(0.94 0 0), oklch(0.3 0 0))",
  keyBg: "light-dark(oklch(0.98 0 0), oklch(0.21 0 0))",
  keyTop: "light-dark(oklch(1 0 0), oklch(1 0 0 / 5%))",
  keyEdge: "light-dark(oklch(0 0 0 / 6%), oklch(0 0 0 / 36%))",
  keyHighlight: "light-dark(oklch(1 0 0 / 90%), oklch(1 0 0 / 7%))",
  keyDrop: "light-dark(oklch(0 0 0 / 4%), oklch(0 0 0 / 30%))",

  tray: "light-dark(oklch(0.985 0 0), oklch(0.17 0 0))",
  raisedHighlight: "light-dark(transparent, oklch(1 0 0 / 4%))",
  raisedShadow: "light-dark(oklch(0.2 0 0 / 6%), oklch(0 0 0 / 16%))",
  raisedRing: "light-dark(oklch(0 0 0 / 4%), oklch(0 0 0 / 40%))",
  popupRing: "light-dark(oklch(0 0 0 / 8%), oklch(0 0 0 / 50%))",
  popupShadowNear: "light-dark(oklch(0 0 0 / 6%), oklch(0 0 0 / 24%))",
  popupShadowFar: "light-dark(oklch(0 0 0 / 8%), oklch(0 0 0 / 40%))",
  itemHighlightBg: "light-dark(oklch(0 0 0 / 4%), oklch(1 0 0 / 7%))",
  itemHighlightRing: "light-dark(oklch(0 0 0 / 6%), oklch(1 0 0 / 6%))",
  invalidRing: (): string =>
    `light-dark(color-mix(in oklab, ${color.destructive} 20%, transparent), color-mix(in oklab, ${color.destructive} 40%, transparent))`,
  inputDisabledBg: (): string =>
    `light-dark(color-mix(in oklab, ${color.input} 50%, transparent), color-mix(in oklab, ${color.input} 80%, transparent))`,
  grooveShadow: "light-dark(oklch(0 0 0 / 3.5%), oklch(0 0 0 / 18%))",
  thumbShade: "oklch(0 0 0 / 3%)",
  thumbRing: "oklch(0 0 0 / 6%)",
  raisedEdge: "oklch(0 0 0 / 8%)",
  fieldHoverEdge: "light-dark(oklch(0 0 0 / 16%), oklch(1 0 0 / 14%))",
  fieldFocusEdge: "light-dark(oklch(0 0 0 / 20%), oklch(1 0 0 / 20%))",
  fieldHalo: "light-dark(oklch(0 0 0 / 6%), oklch(1 0 0 / 12%))",
  fieldDrop: "light-dark(oklch(0 0 0 / 6%), oklch(0 0 0 / 24%))",
  fieldBg: (): string =>
    `light-dark(${color.background}, color-mix(in oklab, ${color.input} 30%, transparent))`,
  well: "light-dark(oklch(0.965 0 0), oklch(0.205 0 0))",
  wellKey: "light-dark(oklch(1 0 0), oklch(0.3 0 0))",
  wellKeyEdge: "light-dark(transparent, oklch(0 0 0 / 60%))",

  infoBorder:
    "light-dark(color-mix(in oklab, oklch(68.5% 0.169 237.323) 25%, transparent), color-mix(in oklab, oklch(74.6% 0.16 232.661) 25%, transparent))",
  infoBg:
    "light-dark(color-mix(in oklab, oklch(68.5% 0.169 237.323) 6%, transparent), color-mix(in oklab, oklch(74.6% 0.16 232.661) 6%, transparent))",
  info: "light-dark(oklch(58.8% 0.158 241.966), oklch(74.6% 0.16 232.661))",
  tipBorder:
    "light-dark(color-mix(in oklab, oklch(60.6% 0.25 292.717) 25%, transparent), color-mix(in oklab, oklch(70.2% 0.183 293.541) 25%, transparent))",
  tipBg:
    "light-dark(color-mix(in oklab, oklch(60.6% 0.25 292.717) 6%, transparent), color-mix(in oklab, oklch(70.2% 0.183 293.541) 6%, transparent))",
  tip: "light-dark(oklch(54.1% 0.281 293.009), oklch(70.2% 0.183 293.541))",
  warningBorder:
    "light-dark(color-mix(in oklab, oklch(76.9% 0.188 70.08) 30%, transparent), color-mix(in oklab, oklch(82.8% 0.189 84.429) 25%, transparent))",
  warningBg:
    "light-dark(color-mix(in oklab, oklch(76.9% 0.188 70.08) 7%, transparent), color-mix(in oklab, oklch(82.8% 0.189 84.429) 6%, transparent))",
  warning: "light-dark(oklch(66.6% 0.179 58.318), oklch(82.8% 0.189 84.429))",
  successBorder:
    "light-dark(color-mix(in oklab, oklch(69.6% 0.17 162.48) 25%, transparent), color-mix(in oklab, oklch(76.5% 0.177 163.223) 25%, transparent))",
  successBg:
    "light-dark(color-mix(in oklab, oklch(69.6% 0.17 162.48) 6%, transparent), color-mix(in oklab, oklch(76.5% 0.177 163.223) 6%, transparent))",
  success: "light-dark(oklch(59.6% 0.145 163.225), oklch(76.5% 0.177 163.223))",

  transparent: "transparent",
  current: "currentColor",
})

export const interop = stylex.defineVars({
  "--background": color.background,
  "--foreground": color.foreground,
  "--border": color.border,
  "--card": color.card,
  "--muted": color.muted,
  "--muted-foreground": color.mutedForeground,
  "--primary": color.primary,
  "--ring": color.ring,
  "--ring-50": `color-mix(in oklab, ${color.ring} 50%, transparent)`,
})

export const radius = stylex.defineConsts({
  xs: "0.125rem",
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  xl2: "1rem",
  xl4: "1.5rem",
  full: "9999px",
})

export const shadow = stylex.defineConsts({
  ring: `0 0 0 2px color-mix(in oklab, ${color.ring} 30%, transparent)`,
  ringInvalid: `0 0 0 2px ${color.invalidRing}`,
  rowRing: `0 0 0 2px ${color.ring}`,

  buttonPrimary: `inset 0 1px 0 ${color.buttonPrimaryHighlight}, 0 1px 2px ${color.buttonDrop}`,
  buttonDestructive: `inset 0 1px 0 ${color.buttonDestructiveHighlight}, 0 1px 2px ${color.buttonDrop}`,
  key: `inset 0 1px 0 ${color.keyHighlight}, 0 1px 1px ${color.keyDrop}`,

  popup: `inset 0 0 1px 1px ${color.raisedHighlight}, 0 0 0 1px ${color.popupRing}, 0 1px 2px ${color.popupShadowNear}, 0 4px 12px -2px ${color.popupShadowFar}`,
  popupLifted: `inset 0 0 1px 1px ${color.raisedHighlight}, 0 0 0 1px ${color.popupRing}, 0 2px 4px ${color.popupShadowNear}, 0 16px 40px -8px ${color.popupShadowFar}`,

  tooltip: `inset 0 1px 0 ${color.buttonPrimaryHighlight}, 0 4px 12px -2px ${color.popupShadowFar}`,

  thumb: `0 0 0 0.5px ${color.thumbRing}, 0 1px 1px ${color.keyDrop}`,

  peekLeft: `4px 0 8px -4px ${color.popupShadowNear}, 12px 0 24px -12px ${color.popupShadowFar}`,
  peekRight: `-4px 0 8px -4px ${color.popupShadowNear}, -12px 0 24px -12px ${color.popupShadowFar}`,

  raised: `inset 0 0 1px 1px ${color.raisedHighlight}, 0 1px 2px ${color.raisedShadow}, 0 0 2px ${color.raisedEdge}, 0 0 0 1px ${color.raisedRing}`,

  field: `0 2px 2px -1px ${color.fieldDrop}`,
  fieldFocus: `0 0 0 3px ${color.fieldHalo}`,

  groove: `inset 0 1px 1px ${color.grooveShadow}`,
  well: "inset 0 1px 1.5px light-dark(oklch(0 0 0 / 6%), oklch(0 0 0 / 25%))",
  wellKey:
    "inset 0 1px 0 light-dark(transparent, oklch(1 0 0 / 8%)), 0 0 0 0.5px light-dark(oklch(0 0 0 / 10%), transparent), 0 1px 2px light-dark(oklch(0 0 0 / 8%), oklch(0 0 0 / 45%)), 0 2px 4px -1px light-dark(oklch(0 0 0 / 5%), transparent)",
})

export const ease = stylex.defineConsts({
  out: "cubic-bezier(0, 0, 0.2, 1)",
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  decelerate: "cubic-bezier(0.32, 0.72, 0, 1)",
  tactile: "cubic-bezier(0.4, 0.36, 0, 1)",
  spring:
    "linear(0, 0.0575, 0.1802, 0.3206, 0.4549, 0.5727, 0.6709, 0.7499, 0.812, 0.86, 0.8965, 0.9239, 0.9444, 0.9596, 0.9707, 0.9789, 0.9848, 0.9891, 0.9922, 0.9944, 0.996, 0.9972, 0.998, 0.9986, 1)",
})

export const duration = stylex.defineConsts({
  fade: "100ms",
  color: "150ms",
  modal: "150ms",
  sheen: "300ms",
  move: "200ms",
  slide: "250ms",
  stackFade: "250ms",
  panel: "300ms",
  sheet: "400ms",
  drawer: "450ms",
  stack: "500ms",
})

export const layer = stylex.defineConsts({
  raised: 1,
  overlay: 10,
  sticky: 20,
  popup: 50,
})

export const font = stylex.defineConsts({
  sans: "var(--font-sans)",
  mono: "var(--font-mono)",
})

export const space = stylex.defineConsts({
  s0: "0",
  s0_5: "0.125rem",
  s1: "0.25rem",
  s1_5: "0.375rem",
  s2: "0.5rem",
  s2_5: "0.625rem",
  s3: "0.75rem",
  s3_5: "0.875rem",
  s4: "1rem",
  s5: "1.25rem",
  s6: "1.5rem",
  s7: "1.75rem",
  s8: "2rem",
  s9: "2.25rem",
  s10: "2.5rem",
  s12: "3rem",
  s16: "4rem",
  s24: "6rem",
})

export const width = stylex.defineConsts({
  narrow: "12rem",
  xs: "20rem",
  sm: "24rem",
  md: "28rem",
  lg: "32rem",
  xl3: "48rem",
})

export const text = stylex.defineConsts({
  xs: "0.75rem",
  compact: "0.8rem",
  code: "0.8125rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl2: "1.5rem",
  xl3: "1.875rem",
  xl4: "2.25rem",
})

export const leading = stylex.defineConsts({
  xs: "calc(1 / 0.75)",
  compact: "calc(1.125 / 0.8)",
  code: "1.75",
  sm: "calc(1.25 / 0.875)",
  base: "1.5",
  lg: "calc(1.75 / 1.125)",
  xl2: "calc(2 / 1.5)",
  xl3: "calc(2.25 / 1.875)",
  xl4: "calc(2.5 / 2.25)",
})

export const tracking = stylex.defineConsts({
  tight: "-0.025em",
  widest: "0.1em",
})
