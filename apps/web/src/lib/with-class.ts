import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"

export function withClass(className: string, ...styles: ReadonlyArray<StyleXStyles | false | null | undefined>) {
  const sx = stylex.props(...styles)
  return { ...sx, className: clsx(className, sx.className) }
}
