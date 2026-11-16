import type { CSSProperties } from "react"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"

type VarStyles = StyleXStyles<{ [key: `--${string}`]: string | number }>

type ExpressionStyles = StyleXStyles<{ zIndex: string }>

type Marker = ReturnType<typeof stylex.defineMarker>

type StyleList = ReadonlyArray<
  StyleXStyles | VarStyles | ExpressionStyles | Marker | false | null | undefined
>

type StateProps<State> = {
  className: (state: State) => string
  style: (state: State) => CSSProperties | undefined
}

type Overrides = {
  className?: string
  style?: CSSProperties
  hook?: string
}

export function stateStyles<State>(
  resolve: (state: State) => StyleList,
  { className, style, hook }: Overrides = {},
): StateProps<State> {
  return {
    className: (state) => clsx(hook, stylex.props(...resolve(state)).className, className),
    style: (state) => {
      const merged: CSSProperties = { ...stylex.props(...resolve(state)).style, ...style }
      return Object.keys(merged).length > 0 ? merged : undefined
    },
  }
}
