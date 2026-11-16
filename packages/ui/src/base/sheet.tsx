"use client"

import type { CSSProperties } from "react"
import { useRender } from "@base-ui/react/use-render"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"
import { XIcon } from "@phosphor-icons/react/dist/csr/X"

import { Button } from "@ui/base/button"
import { stateStyles } from "@ui/lib/state-styles"
import { breakpoints } from "@ui/theme/breakpoints.stylex"
import { states } from "@ui/theme/states"
import { color, duration, ease, layer, leading, shadow, space, text } from "@ui/theme/tokens.stylex"

const styles = stylex.create({
  hidden: { transform: "var(--carbon-sheet-closed-transform)" },
  ending: {
    transitionDuration: {
      default: duration.panel,
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: layer.popup,
    backgroundColor: color.overlay,
    backdropFilter: "blur(2px)",
    transitionProperty: "opacity",
    transitionDuration: {
      default: duration.sheet,
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionTimingFunction: ease.decelerate,
  },
  content: {
    position: "fixed",
    zIndex: layer.popup,
    display: "flex",
    flexDirection: "column",
    gap: space.s4,
    boxShadow: shadow.popupLifted,
    fontSize: text.sm,
    lineHeight: leading.sm,
    transitionProperty: "transform",
    transitionDuration: {
      default: duration.sheet,
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionTimingFunction: ease.decelerate,
  },
  close: { position: "absolute", top: space.s2_5, right: space.s2_5 },
  header: { display: "grid", rowGap: space.s1, padding: space.s4 },
  footer: {
    display: "flex",
    flexDirection: "column",
    gap: space.s2,
    marginBlockStart: "auto",
  },
  title: { fontSize: text.base, lineHeight: leading.base, fontWeight: 500 },
  description: { color: color.mutedForeground },
})

const sides = stylex.create({
  top: {
    top: 0,
    insetInline: 0,
    height: "auto",
    "--carbon-sheet-closed-transform": "translate3d(0, calc(-100% - 2px), 0)",
  },
  right: {
    right: 0,
    insetBlock: 0,
    height: "100%",
    width: { default: "75%", [breakpoints.md]: "24rem" },
    "--carbon-sheet-closed-transform": "translate3d(calc(100% + 2px), 0, 0)",
  },
  bottom: {
    bottom: 0,
    insetInline: 0,
    height: "auto",
    "--carbon-sheet-closed-transform": "translate3d(0, calc(100% + 2px), 0)",
  },
  left: {
    left: 0,
    insetBlock: 0,
    height: "100%",
    width: { default: "75%", [breakpoints.md]: "24rem" },
    "--carbon-sheet-closed-transform": "translate3d(calc(-100% - 2px), 0, 0)",
  },
})

const sheetStyles = { content: [states.popupSurface, styles.content], sides }

type SheetSide = keyof typeof sides

type Overrides = { xstyle?: StyleXStyles; className?: string }
type StateOverrides = Overrides & { style?: CSSProperties }

function Sheet<Payload>(props: SheetPrimitive.Root.Props<Payload>) {
  return <SheetPrimitive.Root {...props} />
}

function SheetTrigger(props: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetPortal(props: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal {...props} />
}

function SheetClose(props: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

type SheetOverlayProps = Omit<SheetPrimitive.Backdrop.Props, "className" | "style"> & StateOverrides

function SheetOverlay({ xstyle, className, style, ...props }: SheetOverlayProps) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      {...props}
      {...stateStyles(
        (state) => [
          styles.overlay,
          (state.transitionStatus === "starting" || state.transitionStatus === "ending") &&
            states.transparent,
          state.transitionStatus === "ending" && styles.ending,
          xstyle,
        ],
        { className, style },
      )}
    />
  )
}

type SheetContentProps = Omit<SheetPrimitive.Popup.Props, "className" | "style"> &
  StateOverrides & {
    side?: SheetSide
    showCloseButton?: boolean
    overlayProps?: SheetOverlayProps
  }

function SheetContent({
  xstyle,
  className,
  style,
  children,
  side = "right",
  showCloseButton = true,
  overlayProps,
  ...props
}: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay {...overlayProps} />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        {...props}
        {...stateStyles(
          (state) => [
            states.popupSurface,
            styles.content,
            sides[side] ?? sides.right,
            (state.transitionStatus === "starting" || state.transitionStatus === "ending") &&
              styles.hidden,
            state.transitionStatus === "ending" && styles.ending,
            xstyle,
          ],
          { className, style },
        )}
      >
        {children}
        {showCloseButton && (
          <SheetClose
            render={<Button variant="ghost" size="icon-sm" xstyle={styles.close} />}
            aria-label="Close"
          >
            <XIcon aria-hidden="true" />
          </SheetClose>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({
  render,
  ref,
  style,
  xstyle,
  className,
  ...props
}: useRender.ComponentProps<"div"> & Overrides) {
  const sx = stylex.props(styles.header, xstyle)
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "sheet-header",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

function SheetFooter({
  render,
  ref,
  style,
  xstyle,
  className,
  ...props
}: useRender.ComponentProps<"div"> & Overrides) {
  const sx = stylex.props(states.trayFooter, styles.footer, xstyle)
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "sheet-footer",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

function SheetTitle({ xstyle, className, ...props }: SheetPrimitive.Title.Props & Overrides) {
  const sx = stylex.props(styles.title, xstyle)
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      {...sx}
      {...props}
      className={clsx(sx.className, className)}
    />
  )
}

function SheetDescription({
  xstyle,
  className,
  ...props
}: SheetPrimitive.Description.Props & Overrides) {
  const sx = stylex.props(styles.description, xstyle)
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      {...sx}
      {...props}
      className={clsx(sx.className, className)}
    />
  )
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
  sheetStyles,
  type SheetSide,
}
