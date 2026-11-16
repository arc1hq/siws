import * as stylex from "@stylexjs/stylex"

export const breakpoints = stylex.defineConsts({
  sm: "@media (width >= 40rem)",
  md: "@media (width >= 48rem)",
  lg: "@media (width >= 64rem)",
  xl: "@media (width >= 80rem)",
  maxSm: "@media (width < 40rem)",
  maxMd: "@media (width < 48rem)",
  maxLg: "@media (width < 64rem)",
  maxXl: "@media (width < 80rem)",
})
