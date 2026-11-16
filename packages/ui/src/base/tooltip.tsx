"use client"

import type { CSSProperties } from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"

import { stateStyles } from "@ui/lib/state-styles"
import { popupSlide, states } from "@ui/theme/states"
import {
  color,
  duration,
  ease,
  layer,
  leading,
  radius,
  shadow,
  space,
  text,
  width,
} from "@ui/theme/tokens.stylex"

const styles = stylex.create({
  content: {
    zIndex: layer.popup,
    display: "inline-flex",
    alignItems: "center",
    gap: space.s1_5,
    width: "fit-content",
    maxWidth: width.xs,
    borderRadius: radius.md,
    paddingInline: space.s3,
    paddingBlock: space.s1_5,
    backgroundColor: color.foreground,
    color: color.background,
    boxShadow: shadow.tooltip,
    fontSize: text.xs,
    lineHeight: leading.xs,
    transformOrigin: "var(--transform-origin)",
    transitionProperty: "opacity, transform",
    transitionDuration: {
      default: duration.fade,
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionTimingFunction: ease.standard,
  },
  arrow: {
    zIndex: layer.popup,
    width: space.s2_5,
    height: space.s2_5,
    borderRadius: 2,
    backgroundColor: color.foreground,
  },
})

const arrowSides = stylex.create({
  top: {
    bottom: `calc(-1 * ${space.s2_5})`,
    transform: "translateY(calc(-50% - 2px)) rotate(45deg)",
  },
  bottom: { top: space.s1, transform: "translateY(calc(-50% - 2px)) rotate(45deg)" },
  left: { right: `calc(-1 * ${space.s1})`, transform: "rotate(45deg)" },
  right: { left: `calc(-1 * ${space.s1})`, transform: "rotate(45deg)" },
  "inline-start": { right: `calc(-1 * ${space.s1})`, transform: "rotate(45deg)" },
  "inline-end": { left: `calc(-1 * ${space.s1})`, transform: "rotate(45deg)" },
})

type Overrides = { xstyle?: StyleXStyles; className?: string }

type StateOverrides = Overrides & { style?: CSSProperties }

function TooltipProvider({ delay = 0, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider delay={delay} {...props} />
}

function Tooltip<Payload>(props: TooltipPrimitive.Root.Props<Payload>) {
  return <TooltipPrimitive.Root {...props} />
}

function TooltipTrigger<Payload>(props: TooltipPrimitive.Trigger.Props<Payload>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

type TooltipContentProps = Omit<TooltipPrimitive.Popup.Props, "className" | "style"> &
  Pick<TooltipPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> &
  StateOverrides

function TooltipContent({
  xstyle,
  style,
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        {...stylex.props(states.positioner)}
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          {...props}
          {...stateStyles(
            (state) => [
              styles.content,
              (state.transitionStatus === "starting" || state.transitionStatus === "ending") &&
                states.transparent,
              (state.transitionStatus === "starting" || state.transitionStatus === "ending") &&
                popupSlide[state.side],
              state.instant && states.instant,
              xstyle,
            ],
            {
              className,
              style,
            },
          )}
        >
          {children}
          <TooltipPrimitive.Arrow
            data-slot="tooltip-arrow"
            {...stateStyles((state) => [styles.arrow, arrowSides[state.side]])}
          />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
