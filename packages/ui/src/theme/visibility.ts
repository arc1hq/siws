import * as stylex from "@stylexjs/stylex"

import { breakpoints } from "./breakpoints.stylex"

export const visibility = stylex.create({
  flexFromSm: { display: { default: "none", [breakpoints.sm]: "flex" } },
  blockFromSm: { display: { default: "none", [breakpoints.sm]: "block" } },
  flexBelowMd: { display: { default: "flex", [breakpoints.md]: "none" } },
  flexFromMd: { display: { default: "none", [breakpoints.md]: "flex" } },
  inlineFlexBelowMd: { display: { default: "inline-flex", [breakpoints.md]: "none" } },
  inlineFlexFromMd: { display: { default: "none", [breakpoints.md]: "inline-flex" } },
  blockFromMd: { display: { default: "none", [breakpoints.md]: "block" } },
  blockFromXl: { display: { default: "none", [breakpoints.xl]: "block" } },
})
