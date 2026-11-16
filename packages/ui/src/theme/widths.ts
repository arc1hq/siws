import * as stylex from "@stylexjs/stylex"

import { width } from "./tokens.stylex"

export const widths = stylex.create({
  narrow: { width: "100%", maxWidth: width.narrow },
  xs: { width: "100%", maxWidth: width.xs },
  sm: { width: "100%", maxWidth: width.sm },
  md: { width: "100%", maxWidth: width.md },
  lg: { width: "100%", maxWidth: width.lg },
  xl3: { width: "100%", maxWidth: width.xl3 },
})
