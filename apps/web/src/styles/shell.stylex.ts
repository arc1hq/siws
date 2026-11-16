import * as stylex from "@stylexjs/stylex"

export const shell = stylex.defineConsts({
  headerHeight: "var(--header-height)",
  sidebarWidth: "var(--sidebar-width)",
})

export const shellLayer = stylex.defineConsts({
  header: 40,
  rail: 30,
})

export const accent = stylex.defineVars({
  ink: "light-dark(oklch(0.55 0.2 285), oklch(0.74 0.15 285))",
  wash: "light-dark(oklch(0.55 0.2 285 / 7%), oklch(0.74 0.15 285 / 12%))",
  edge: "light-dark(oklch(0.55 0.2 285 / 22%), oklch(0.74 0.15 285 / 28%))",
})
