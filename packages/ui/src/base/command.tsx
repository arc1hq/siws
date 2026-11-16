"use client"

import { useEffect, useState } from "react"
import type { ComponentProps, CSSProperties, ReactNode } from "react"
import { useRender } from "@base-ui/react/use-render"
import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass"

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@ui/base/dialog"
import { Input } from "@ui/base/input"
import { InputGroup, InputGroupAddon } from "@ui/base/input-group"
import { stateStyles } from "@ui/lib/state-styles"
import { breakpoints } from "@ui/theme/breakpoints.stylex"
import { states } from "@ui/theme/states"
import {
  color,
  leading,
  radius,
  shadow,
  space,
  text,
  tracking,
  width,
} from "@ui/theme/tokens.stylex"

const panelRadius = `calc(var(--carbon-command-radius, ${radius.xl}) - ${space.s1})`

const styles = stylex.create({
  root: {
    display: "flex",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    "--carbon-command-radius": radius.xl,
    borderRadius: "var(--carbon-command-radius)",
    padding: space.s1,
    backgroundColor: color.tray,
    color: color.popoverForeground,
  },
  inputWrapper: {
    paddingInline: space.s1,
  },
  inputFrame: {
    minHeight: space.s10,
    borderColor: color.transparent,
    backgroundColor: color.transparent,
    boxShadow: "none",
  },
  list: {
    flexGrow: 1,
    minHeight: 0,
    maxHeight: "var(--carbon-command-list-height, 18rem)",
    overflowX: "hidden",
    overflowY: "auto",
    overscrollBehavior: "contain",
    borderRadius: panelRadius,
    backgroundColor: { default: color.popover, ":empty": color.transparent },
    boxShadow: { default: shadow.raised, ":empty": "none" },
    scrollPaddingTop: space.s1,
    scrollPaddingBottom: space.s1,
    outlineStyle: "none",
  },
  empty: {
    paddingBlock: { default: space.s8, ":empty": 0 },
    textAlign: "center",
    fontSize: text.sm,
    lineHeight: leading.sm,
    color: color.mutedForeground,
  },
  group: { overflow: "hidden", padding: space.s1, color: color.foreground },
  heading: {
    paddingInline: space.s2,
    paddingBlockStart: space.s2,
    paddingBlockEnd: space.s1,
    fontSize: text.xs,
    lineHeight: leading.xs,
    fontWeight: 500,
    color: color.mutedForeground,
  },
  separator: {
    height: 1,
    backgroundColor: color.border,
  },
  item: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: space.s2,
    cursor: "default",
    userSelect: "none",
    borderRadius: `max(0px, calc(var(--carbon-command-radius, ${radius.xl}) - 2 * ${space.s1}))`,
    paddingInline: space.s2,
    paddingBlock: space.s1_5,
    fontSize: text.sm,
    lineHeight: leading.sm,
    outlineStyle: "none",
    "--carbon-icon-size": space.s4,
  },
  shortcut: {
    marginInlineStart: "auto",
    fontSize: text.xs,
    lineHeight: leading.xs,
    letterSpacing: tracking.widest,
    color: color.mutedForeground,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    gap: space.s4,
    paddingInline: space.s2,
    paddingBlockStart: space.s2,
    paddingBlockEnd: space.s1,
    fontSize: text.xs,
    lineHeight: leading.xs,
    color: color.mutedForeground,
  },
  dialogContent: {
    overflow: "hidden",
    maxWidth: { default: "none", [breakpoints.md]: width.sm },
    height: { default: null, [breakpoints.maxMd]: "var(--carbon-visual-viewport-height, 100dvh)" },
    insetBlockStart: {
      default: null,
      [breakpoints.maxMd]: "var(--carbon-visual-viewport-top, 0px)",
    },
    padding: 0,
    borderRadius: { default: 0, [breakpoints.md]: radius.xl },
    boxShadow: { default: "none", [breakpoints.md]: shadow.popupLifted },
    "--carbon-command-list-height": { default: null, [breakpoints.maxMd]: "none" },
  },
  dialogViewport: {
    alignItems: "start",
    padding: { default: 0, [breakpoints.md]: space.s4 },
    paddingBlockStart: { default: 0, [breakpoints.md]: "33vh" },
  },
})

const commandStyles = {
  root: styles.root,
  list: styles.list,
  empty: styles.empty,
  group: styles.group,
  heading: styles.heading,
  separator: styles.separator,
  item: styles.item,
  itemHighlighted: states.itemHighlight,
  itemDisabled: states.disabled,
  shortcut: styles.shortcut,
  footer: styles.footer,
}

type Overrides = { xstyle?: StyleXStyles; className?: string }

type StateOverrides = Overrides & { style?: CSSProperties }

type CommandProps<Item> = Omit<
  AutocompletePrimitive.Root.Props<Item>,
  | "inline"
  | "open"
  | "defaultOpen"
  | "onOpenChange"
  | "onOpenChangeComplete"
  | "openOnInputClick"
  | "modal"
  | "items"
> &
  Overrides & {
    render?: useRender.ComponentProps<"div">["render"]
    items: NonNullable<AutocompletePrimitive.Root.Props<Item>["items"]>
  }

function Command<Item>({
  render,
  xstyle,
  className,
  children,
  items,
  autoHighlight = "always",
  keepHighlight = true,
  ...props
}: CommandProps<Item>) {
  const sx = stylex.props(styles.root, xstyle)

  return useRender({
    defaultTagName: "div",
    render,
    props: {
      "data-slot": "command",
      ...sx,
      className: clsx(sx.className, className),
      children: (
        <AutocompletePrimitive.Root
          inline
          open
          autoHighlight={autoHighlight}
          keepHighlight={keepHighlight}
          {...props}
          items={items as readonly Item[]}
        >
          {children}
        </AutocompletePrimitive.Root>
      ),
    },
  })
}

type CommandDialogProps = Omit<ComponentProps<typeof Dialog>, "children"> &
  Overrides & {
    title?: string
    description?: string
    showCloseButton?: boolean
    children: ReactNode
  }

type VisualViewportBox = { height: number; top: number }

function useVisualViewport(active: boolean) {
  const [box, setBox] = useState<VisualViewportBox>()

  useEffect(() => {
    const viewport = window.visualViewport
    if (!active || !viewport) return
    const update = () => setBox({ height: viewport.height, top: viewport.offsetTop })
    update()
    viewport.addEventListener("resize", update)
    viewport.addEventListener("scroll", update)
    return () => {
      viewport.removeEventListener("resize", update)
      viewport.removeEventListener("scroll", update)
      setBox(undefined)
    }
  }, [active])

  return box
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  xstyle,
  className,
  showCloseButton = false,
  open,
  defaultOpen = false,
  onOpenChange,
  ...props
}: CommandDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const box = useVisualViewport(open ?? uncontrolledOpen)

  const viewportStyle:
    | (CSSProperties & {
        "--carbon-visual-viewport-height": string
        "--carbon-visual-viewport-top": string
      })
    | undefined = box
    ? {
        "--carbon-visual-viewport-height": `${box.height}px`,
        "--carbon-visual-viewport-top": `${box.top}px`,
      }
    : undefined

  return (
    <Dialog
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next, details) => {
        setUncontrolledOpen(next)
        onOpenChange?.(next, details)
      }}
      {...props}
    >
      <DialogContent
        xstyle={[styles.dialogContent, states.instant, xstyle]}
        className={className}
        style={viewportStyle}
        showCloseButton={showCloseButton}
        overlayProps={{ xstyle: states.instant }}
        viewportProps={{ xstyle: styles.dialogViewport }}
      >
        <DialogTitle xstyle={states.srOnly}>{title}</DialogTitle>
        <DialogDescription xstyle={states.srOnly}>{description}</DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  )
}

type CommandInputProps = Omit<AutocompletePrimitive.Input.Props, "className" | "children"> &
  Overrides & { children?: ReactNode }

function CommandInput({ xstyle, className, children, ...props }: CommandInputProps) {
  return (
    <div data-slot="command-input-wrapper" {...stylex.props(styles.inputWrapper)}>
      <InputGroup xstyle={[styles.inputFrame, xstyle]} className={className}>
        <AutocompletePrimitive.Input render={<Input />} {...props} />
        <InputGroupAddon>
          <MagnifyingGlassIcon aria-hidden="true" />
        </InputGroupAddon>
        {children}
      </InputGroup>
    </div>
  )
}

type CommandListProps = Omit<AutocompletePrimitive.List.Props, "className"> & Overrides

function CommandList({ xstyle, className, ...props }: CommandListProps) {
  const sx = stylex.props(styles.list, xstyle)
  return (
    <AutocompletePrimitive.List
      data-slot="command-list"
      {...sx}
      {...props}
      className={clsx("no-scrollbar", sx.className, className)}
    />
  )
}

type CommandEmptyProps = Omit<AutocompletePrimitive.Empty.Props, "className"> & Overrides

function CommandEmpty({ xstyle, className, ...props }: CommandEmptyProps) {
  const sx = stylex.props(styles.empty, xstyle)
  return (
    <AutocompletePrimitive.Empty
      data-slot="command-empty"
      {...sx}
      {...props}
      className={clsx(sx.className, className)}
    />
  )
}

type CommandGroupProps<Item> = Omit<
  AutocompletePrimitive.Group.Props,
  "className" | "children" | "items"
> &
  Overrides & {
    heading?: ReactNode
    items?: readonly Item[]
    children?: ReactNode | ((item: Item, index: number) => ReactNode)
  }

function CommandGroup<Item>({
  heading,
  items,
  xstyle,
  className,
  children,
  ...props
}: CommandGroupProps<Item>) {
  const sx = stylex.props(styles.group, xstyle)
  return (
    <AutocompletePrimitive.Group
      data-slot="command-group"
      items={items}
      {...sx}
      {...props}
      className={clsx(sx.className, className)}
    >
      {heading != null && (
        <AutocompletePrimitive.GroupLabel
          data-slot="command-group-heading"
          {...stylex.props(styles.heading)}
        >
          {heading}
        </AutocompletePrimitive.GroupLabel>
      )}
      {typeof children === "function" ? (
        <AutocompletePrimitive.Collection>{children}</AutocompletePrimitive.Collection>
      ) : (
        children
      )}
    </AutocompletePrimitive.Group>
  )
}

type CommandSeparatorProps = Omit<AutocompletePrimitive.Separator.Props, "className"> & Overrides

function CommandSeparator({ xstyle, className, ...props }: CommandSeparatorProps) {
  const sx = stylex.props(styles.separator, xstyle)
  return (
    <AutocompletePrimitive.Separator
      data-slot="command-separator"
      {...sx}
      {...props}
      className={clsx(sx.className, className)}
    />
  )
}

type CommandItemProps = Omit<AutocompletePrimitive.Item.Props, "className" | "style"> &
  StateOverrides

function CommandItem({ xstyle, style, className, ...props }: CommandItemProps) {
  return (
    <AutocompletePrimitive.Item
      data-slot="command-item"
      {...props}
      {...stateStyles(
        (state) => [
          styles.item,
          state.highlighted && states.itemHighlight,
          state.disabled && states.disabled,
          xstyle,
        ],
        { className, style, hook: "carbon-icons" },
      )}
    />
  )
}

function CommandShortcut({
  render,
  ref,
  style,
  xstyle,
  className,
  ...props
}: useRender.ComponentProps<"span"> & Overrides) {
  const sx = stylex.props(styles.shortcut, xstyle)
  return useRender({
    defaultTagName: "span",
    render,
    ref,
    props: {
      "data-slot": "command-shortcut",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

function CommandFooter({
  render,
  ref,
  style,
  xstyle,
  className,
  ...props
}: useRender.ComponentProps<"div"> & Overrides) {
  const sx = stylex.props(styles.footer, xstyle)
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "command-footer",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  commandStyles,
}
