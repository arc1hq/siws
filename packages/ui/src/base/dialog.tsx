"use client"

import { useState } from "react"
import type { CSSProperties, ReactNode } from "react"
import { useRender } from "@base-ui/react/use-render"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"
import { XIcon } from "@phosphor-icons/react/dist/csr/X"

import { Button } from "@ui/base/button"
import { stateStyles } from "@ui/lib/state-styles"
import { breakpoints } from "@ui/theme/breakpoints.stylex"
import { states } from "@ui/theme/states"
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
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: layer.popup,
    backgroundColor: color.overlay,
    backdropFilter: "blur(2px)",
    transitionProperty: "opacity",
    transitionDuration: {
      default: duration.modal,
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionTimingFunction: ease.standard,
  },
  viewport: {
    position: "fixed",
    inset: 0,
    zIndex: layer.popup,
    display: "grid",
    alignItems: "safe center",
    justifyItems: "center",
    overflow: "auto",
    padding: space.s4,
  },
  content: {
    position: "relative",
    display: "grid",
    gap: space.s4,
    width: "100%",
    maxWidth: width.sm,
    borderRadius: radius.xl,
    padding: space.s5,
    boxShadow: shadow.popupLifted,
    fontSize: text.sm,
    lineHeight: leading.sm,
    transitionProperty: "opacity, transform",
    transitionDuration: {
      default: duration.modal,
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionTimingFunction: ease.standard,
  },
  close: { position: "absolute", insetBlockStart: space.s3, insetInlineEnd: space.s3 },
  header: { display: "grid", rowGap: space.s1 },
  footer: {
    display: "flex",
    flexDirection: { default: "column-reverse", [breakpoints.md]: "row" },
    justifyContent: { default: null, [breakpoints.md]: "flex-end" },
    gap: space.s2,
    marginInline: `calc(-1 * ${space.s5})`,
    marginBlockStart: `calc(${space.s1} - ${radius.xl})`,
    marginBlockEnd: `calc(-1 * ${space.s5})`,
    borderEndStartRadius: radius.xl,
    borderEndEndRadius: radius.xl,
  },
  title: { fontSize: text.base, lineHeight: leading.base, fontWeight: 500 },
  description: { color: color.mutedForeground },
})

type Overrides = { xstyle?: StyleXStyles; className?: string }
type StateOverrides = Overrides & { style?: CSSProperties }

function Dialog<Payload>(props: DialogPrimitive.Root.Props<Payload>) {
  return <DialogPrimitive.Root {...props} />
}

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal(props: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal {...props} />
}

function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

type DialogOverlayProps = Omit<DialogPrimitive.Backdrop.Props, "className" | "style"> &
  StateOverrides

function DialogOverlay({ xstyle, className, style, ...props }: DialogOverlayProps) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      {...props}
      {...stateStyles(
        (state) => [
          styles.overlay,
          (state.transitionStatus === "starting" || state.transitionStatus === "ending") &&
            states.transparent,
          xstyle,
        ],
        { className, style },
      )}
    />
  )
}

type DialogViewportProps = Omit<DialogPrimitive.Viewport.Props, "className"> & Overrides

function DialogViewport({ xstyle, className, ...props }: DialogViewportProps) {
  const sx = stylex.props(styles.viewport, xstyle)
  return (
    <DialogPrimitive.Viewport
      data-slot="dialog-viewport"
      {...sx}
      {...props}
      className={clsx(sx.className, className)}
    />
  )
}

type DialogContentProps = Omit<DialogPrimitive.Popup.Props, "className" | "style"> &
  StateOverrides & {
    showCloseButton?: boolean
    overlayProps?: DialogOverlayProps
    viewportProps?: DialogViewportProps
  }

function DialogContent({
  xstyle,
  className,
  style,
  children,
  showCloseButton = true,
  overlayProps,
  viewportProps,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay {...overlayProps} />
      <DialogViewport {...viewportProps}>
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          {...props}
          {...stateStyles(
            (state) => [
              states.popupSurface,
              styles.content,
              (state.transitionStatus === "starting" || state.transitionStatus === "ending") &&
                states.popupTransparent,
              xstyle,
            ],
            { className, style },
          )}
        >
          {children}
          {showCloseButton && (
            <DialogClose
              render={<Button variant="ghost" size="icon-sm" xstyle={styles.close} />}
              aria-label="Close"
            >
              <XIcon aria-hidden="true" />
            </DialogClose>
          )}
        </DialogPrimitive.Popup>
      </DialogViewport>
    </DialogPortal>
  )
}

function DialogHeader({
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
      "data-slot": "dialog-header",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

type DialogFooterProps = useRender.ComponentProps<"div"> & Overrides & { showCloseButton?: boolean }

function DialogFooter({
  render,
  ref,
  style,
  xstyle,
  className,
  children,
  showCloseButton = false,
  ...props
}: DialogFooterProps) {
  const sx = stylex.props(states.trayFooter, styles.footer, xstyle)
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "dialog-footer",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
      children: (
        <>
          {children}
          {showCloseButton && (
            <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
          )}
        </>
      ),
    },
  })
}

function DialogTitle({ xstyle, className, ...props }: DialogPrimitive.Title.Props & Overrides) {
  const sx = stylex.props(styles.title, xstyle)
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      {...sx}
      {...props}
      className={clsx(sx.className, className)}
    />
  )
}

function DialogDescription({
  xstyle,
  className,
  ...props
}: DialogPrimitive.Description.Props & Overrides) {
  const sx = stylex.props(styles.description, xstyle)
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      {...sx}
      {...props}
      className={clsx(sx.className, className)}
    />
  )
}

type DefinedDialogRootProps<Payload> = Omit<
  DialogPrimitive.Root.Props<Payload>,
  "children" | "handle" | "open" | "defaultOpen" | "triggerId" | "defaultTriggerId"
>

type DefinedDialog<Payload> = {
  open: (payload: Payload) => void
  close: () => void
  Root: (props: DefinedDialogRootProps<Payload>) => ReactNode
}

function defineDialog<Payload = void>(
  render: (payload: Payload) => ReactNode,
): DefinedDialog<Payload> {
  const handle = DialogPrimitive.createHandle<Payload>()

  function Root({ onOpenChange, onOpenChangeComplete, ...props }: DefinedDialogRootProps<Payload>) {
    const [mounted, setMounted] = useState(false)

    return (
      <DialogPrimitive.Root
        handle={handle}
        onOpenChange={(open, details) => {
          onOpenChange?.(open, details)
          if (open && !details.isCanceled) setMounted(true)
        }}
        onOpenChangeComplete={(open) => {
          onOpenChangeComplete?.(open)
          if (!open) setMounted(false)
        }}
        {...props}
      >
        {({ payload }) => (mounted ? render(payload as Payload) : null)}
      </DialogPrimitive.Root>
    )
  }

  return {
    open: (payload: Payload) => handle.openWithPayload(payload),
    close: () => handle.close(),
    Root,
  }
}

export {
  defineDialog,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DialogViewport,
  type DefinedDialog,
}
