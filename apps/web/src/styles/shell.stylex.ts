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
  seal: "light-dark(oklch(0.53 0.2 263), oklch(0.66 0.17 258))",
  ink: "light-dark(oklch(0.5 0.19 263), oklch(0.74 0.14 255))",
  wash: "light-dark(oklch(0.53 0.2 263 / 8%), oklch(0.66 0.17 258 / 14%))",
  edge: "light-dark(oklch(0.53 0.2 263 / 24%), oklch(0.66 0.17 258 / 32%))",
})
