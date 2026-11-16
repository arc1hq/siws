"use client"

import type { CSSProperties } from "react"
import { useRender } from "@base-ui/react/use-render"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check"
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight"

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
  tracking,
} from "@ui/theme/tokens.stylex"

const styles = stylex.create({
  content: {
    zIndex: layer.popup,
    maxHeight: "var(--available-height)",
    minWidth: "max(8rem, var(--anchor-width))",
    overflowX: "hidden",
    overflowY: "auto",
    "--carbon-popup-radius": radius.lg,
    borderRadius: "var(--carbon-popup-radius)",
    padding: space.s1,
    transformOrigin: "var(--transform-origin)",
    transitionProperty: "opacity, transform",
    transitionDuration: {
      default: duration.fade,
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionTimingFunction: ease.standard,
  },
  subContent: {
    width: "auto",
    minWidth: "6rem",
    boxShadow: shadow.popupLifted,
  },
  label: {
    paddingInline: space.s1_5,
    paddingBlock: space.s1,
    fontSize: text.xs,
    lineHeight: leading.xs,
    fontWeight: 500,
    color: color.mutedForeground,
  },
  item: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: space.s1_5,
    cursor: "default",
    userSelect: "none",
    paddingInline: space.s1_5,
    paddingBlock: space.s1,
    fontSize: text.sm,
    lineHeight: leading.sm,
    outlineStyle: "none",
    "--carbon-icon-size": space.s4,
  },
  inset: { paddingInlineStart: space.s7 },
  destructive: { color: color.destructive },
  indicatorItem: { paddingInlineEnd: space.s8 },
  indicator: {
    pointerEvents: "none",
    position: "absolute",
    insetInlineEnd: space.s2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chevron: { marginInlineStart: "auto" },
  separator: {
    marginInline: `calc(-1 * ${space.s1})`,
    marginBlock: space.s1,
    height: 1,
    backgroundColor: color.border,
  },
  shortcut: {
    marginInlineStart: "auto",
    fontSize: text.xs,
    lineHeight: leading.xs,
    letterSpacing: tracking.widest,
    color: color.mutedForeground,
  },
})

type ItemVariant = "default" | "destructive"

type Overrides = { xstyle?: StyleXStyles; className?: string }

type StateOverrides = Overrides & { style?: CSSProperties }

function DropdownMenu(props: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root {...props} />
}

function DropdownMenuPortal(props: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal {...props} />
}

function DropdownMenuTrigger(props: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

type DropdownMenuContentProps = Omit<MenuPrimitive.Popup.Props, "className" | "style"> &
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> &
  StateOverrides

function DropdownMenuContent({
  xstyle,
  style,
  className,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  ...props
}: DropdownMenuContentProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        {...stylex.props(states.positioner)}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          {...props}
          {...stateStyles(
            (state) => [
              states.popupSurface,
              styles.content,
              (state.transitionStatus === "starting" || state.transitionStatus === "ending") &&
                states.transparent,
              (state.transitionStatus === "starting" || state.transitionStatus === "ending") &&
                popupSlide[state.side],
              xstyle,
            ],
            { className, style },
          )}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuGroup(props: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

type DropdownMenuLabelProps = Omit<MenuPrimitive.GroupLabel.Props, "className"> &
  Overrides & { inset?: boolean }

function DropdownMenuLabel({ xstyle, className, inset, ...props }: DropdownMenuLabelProps) {
  const sx = stylex.props(styles.label, inset && styles.inset, xstyle)
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset || undefined}
      {...sx}
      {...props}
      className={clsx(sx.className, className)}
    />
  )
}

type DropdownMenuItemProps = Omit<MenuPrimitive.Item.Props, "className" | "style"> &
  StateOverrides & { inset?: boolean; variant?: ItemVariant }

function DropdownMenuItem({
  xstyle,
  style,
  className,
  inset,
  variant = "default",
  ...props
}: DropdownMenuItemProps) {
  const destructive = variant === "destructive"
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset || undefined}
      data-variant={variant}
      {...props}
      {...stateStyles(
        (state) => [
          styles.item,
          states.popupItem,
          inset && styles.inset,
          destructive && styles.destructive,
          state.highlighted &&
            (destructive ? states.itemHighlightDestructive : states.itemHighlight),
          state.disabled && states.disabled,
          xstyle,
        ],
        { className, style, hook: "carbon-icons" },
      )}
    />
  )
}

type DropdownMenuLinkItemProps = Omit<MenuPrimitive.LinkItem.Props, "className" | "style"> &
  StateOverrides & { inset?: boolean }

function DropdownMenuLinkItem({
  xstyle,
  style,
  className,
  inset,
  ...props
}: DropdownMenuLinkItemProps) {
  return (
    <MenuPrimitive.LinkItem
      data-slot="dropdown-menu-link-item"
      data-inset={inset || undefined}
      {...props}
      {...stateStyles(
        (state) => [
          styles.item,
          states.popupItem,
          inset && styles.inset,
          state.highlighted && states.itemHighlight,
          xstyle,
        ],
        { className, style, hook: "carbon-icons" },
      )}
    />
  )
}

type DropdownMenuCheckboxItemProps = Omit<MenuPrimitive.CheckboxItem.Props, "className" | "style"> &
  StateOverrides & { inset?: boolean }

function DropdownMenuCheckboxItem({
  xstyle,
  style,
  className,
  inset,
  children,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset || undefined}
      {...props}
      {...stateStyles(
        (state) => [
          styles.item,
          states.popupItem,
          styles.indicatorItem,
          inset && styles.inset,
          state.highlighted && states.itemHighlight,
          state.disabled && states.disabled,
          xstyle,
        ],
        { className, style, hook: "carbon-icons" },
      )}
    >
      <span data-slot="dropdown-menu-checkbox-item-indicator" {...stylex.props(styles.indicator)}>
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon aria-hidden="true" />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup(props: MenuPrimitive.RadioGroup.Props) {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

type DropdownMenuRadioItemProps = Omit<MenuPrimitive.RadioItem.Props, "className" | "style"> &
  StateOverrides & { inset?: boolean }

function DropdownMenuRadioItem({
  xstyle,
  style,
  className,
  inset,
  children,
  ...props
}: DropdownMenuRadioItemProps) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset || undefined}
      {...props}
      {...stateStyles(
        (state) => [
          styles.item,
          states.popupItem,
          styles.indicatorItem,
          inset && styles.inset,
          state.highlighted && states.itemHighlight,
          state.disabled && states.disabled,
          xstyle,
        ],
        { className, style, hook: "carbon-icons" },
      )}
    >
      <span data-slot="dropdown-menu-radio-item-indicator" {...stylex.props(styles.indicator)}>
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon aria-hidden="true" />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

type DropdownMenuSeparatorProps = Omit<MenuPrimitive.Separator.Props, "className"> & Overrides

function DropdownMenuSeparator({ xstyle, className, ...props }: DropdownMenuSeparatorProps) {
  const sx = stylex.props(styles.separator, xstyle)
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      {...sx}
      {...props}
      className={clsx(sx.className, className)}
    />
  )
}

type DropdownMenuShortcutProps = useRender.ComponentProps<"span"> & Overrides

function DropdownMenuShortcut({
  render,
  ref,
  style,
  xstyle,
  className,
  ...props
}: DropdownMenuShortcutProps) {
  const sx = stylex.props(styles.shortcut, xstyle)
  return useRender({
    defaultTagName: "span",
    render,
    ref,
    props: {
      "data-slot": "dropdown-menu-shortcut",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

function DropdownMenuSub(props: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot {...props} />
}

type DropdownMenuSubTriggerProps = Omit<MenuPrimitive.SubmenuTrigger.Props, "className" | "style"> &
  StateOverrides & { inset?: boolean }

function DropdownMenuSubTrigger({
  xstyle,
  style,
  className,
  inset,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset || undefined}
      {...props}
      {...stateStyles(
        (state) => [
          styles.item,
          states.popupItem,
          inset && styles.inset,
          (state.highlighted || state.open) && states.itemHighlight,
          state.disabled && states.disabled,
          xstyle,
        ],
        { className, style, hook: "carbon-icons" },
      )}
    >
      {children}
      <CaretRightIcon aria-hidden="true" {...stylex.props(styles.chevron)} />
    </MenuPrimitive.SubmenuTrigger>
  )
}

function DropdownMenuSubContent({
  xstyle,
  side = "right",
  sideOffset = 0,
  align = "start",
  alignOffset = -3,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      xstyle={[styles.subContent, xstyle]}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
}
