import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"

import { color } from "@ui/theme/tokens.stylex"

const styles = stylex.create({
  base: {
    flexShrink: 0,
    backgroundColor: color.border,
  },
})

const orientations = stylex.create({
  horizontal: { width: "100%", height: 1 },
  vertical: { width: 1, alignSelf: "stretch" },
})

const separatorStyles = { base: styles.base, orientations }

type SeparatorOrientation = keyof typeof orientations

type SeparatorProps = Omit<SeparatorPrimitive.Props, "className"> & {
  xstyle?: StyleXStyles
  className?: string
}

function Separator({ orientation = "horizontal", xstyle, className, ...props }: SeparatorProps) {
  const sx = stylex.props(styles.base, orientations[orientation] ?? orientations.horizontal, xstyle)

  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      {...sx}
      {...props}
      className={clsx(sx.className, className)}
    />
  )
}

export { Separator, separatorStyles, type SeparatorOrientation }
