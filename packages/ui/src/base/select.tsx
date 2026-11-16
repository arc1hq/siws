"use client"

import { use, type CSSProperties, type ReactNode } from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check"
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown"
import { CaretUpIcon } from "@phosphor-icons/react/dist/csr/CaretUp"

import { stateStyles } from "@ui/lib/state-styles"
import { FieldStateContext } from "@ui/lib/field-state"
import { popupSlide, states } from "@ui/theme/states"
import { color, duration, ease, layer, leading, radius, space, text } from "@ui/theme/tokens.stylex"

const fieldHoverBg = `light-dark(${color.keyBg}, color-mix(in oklab, ${color.input} 50%, transparent))`

const styles = stylex.create({
  trigger: {
    display: "flex",
    width: "fit-content",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.s1_5,
    whiteSpace: "nowrap",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "solid",
    paddingInlineStart: space.s2_5,
    paddingInlineEnd: space.s2,
    paddingBlock: space.s1,
    fontSize: text.sm,
    lineHeight: leading.sm,
    color: color.foreground,
    userSelect: "none",
    transitionProperty: "color, background-color, border-color, box-shadow",
    transitionDuration: duration.color,
    transitionTimingFunction: ease.standard,
    "--carbon-icon-size": space.s4,
  },
  triggerFill: {
    backgroundColor: {
      default: color.fieldBg,
      ":hover": fieldHoverBg,
      ":disabled": color.inputDisabledBg,
    },
  },
  triggerPlaceholder: { color: color.mutedForeground },
  value: {
    display: "block",
    flexGrow: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    textAlign: "start",
  },
  icon: { display: "flex", color: color.mutedForeground },
  content: {
    position: "relative",
    zIndex: layer.popup,
    display: "flex",
    flexDirection: "column",
    width: "var(--anchor-width)",
    minWidth: "9rem",
    maxHeight: "var(--available-height)",
    overflow: "hidden",
    "--carbon-popup-radius": radius.lg,
    borderRadius: "var(--carbon-popup-radius)",
    transformOrigin: "var(--transform-origin)",
    transitionProperty: "opacity, transform",
    transitionDuration: {
      default: duration.fade,
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionTimingFunction: ease.standard,
  },
  list: { minHeight: 0 },
  scrollArrow: {
    position: "absolute",
    insetInline: 0,
    zIndex: layer.overlay,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingBlock: space.s1,
    cursor: "default",
    backgroundColor: color.popover,
    "--carbon-icon-size": space.s4,
  },
  scrollUp: { top: 0 },
  scrollDown: { bottom: 0 },
  group: { padding: space.s1, scrollMarginTop: space.s1, scrollMarginBottom: space.s1 },
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
    width: "100%",
    alignItems: "center",
    gap: space.s1_5,
    cursor: "default",
    userSelect: "none",
    paddingBlock: space.s1,
    paddingInlineStart: space.s1_5,
    paddingInlineEnd: space.s8,
    fontSize: text.sm,
    lineHeight: leading.sm,
    outlineStyle: "none",
    "--carbon-icon-size": space.s4,
  },
  itemText: {
    display: "flex",
    flexGrow: 1,
    flexShrink: 0,
    alignItems: "center",
    gap: space.s2,
    whiteSpace: "nowrap",
  },
  indicator: {
    pointerEvents: "none",
    position: "absolute",
    insetInlineEnd: space.s2,
    display: "flex",
    width: space.s4,
    height: space.s4,
    alignItems: "center",
    justifyContent: "center",
  },
  separator: { height: 1, backgroundColor: color.border },
})

const sizes = stylex.create({
  default: { height: space.s8 },
  sm: { height: space.s7, borderRadius: radius.md },
})

const selectStyles = {
  trigger: [styles.trigger, states.focusRing, states.fieldSurface, styles.triggerFill],
  triggerPlaceholder: styles.triggerPlaceholder,
  triggerDisabled: states.disabled,
  invalid: states.invalidRing,
  sizes,
  content: [states.popupSurface, styles.content],
  item: [styles.item, states.popupItem],
  itemHighlighted: states.itemHighlight,
  itemDisabled: states.disabled,
  label: styles.label,
  separator: styles.separator,
}

type SelectSize = keyof typeof sizes

const slideStyles = stylex.create({ none: { transform: "none" } })

const slide = { ...popupSlide, none: slideStyles.none }

type Overrides = { xstyle?: StyleXStyles; className?: string }

type StateOverrides = Overrides & { style?: CSSProperties }

function Select<Value, Multiple extends boolean | undefined = false>(
  props: SelectPrimitive.Root.Props<Value, Multiple>,
) {
  return <SelectPrimitive.Root {...props} />
}

type SelectGroupProps = Omit<SelectPrimitive.Group.Props, "className"> & Overrides

function SelectGroup({ xstyle, className, ...props }: SelectGroupProps) {
  const sx = stylex.props(styles.group, xstyle)
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      {...sx}
      {...props}
      className={clsx(sx.className, className)}
    />
  )
}

type SelectValueProps = Omit<SelectPrimitive.Value.Props, "className"> & Overrides

function SelectValue({ xstyle, className, ...props }: SelectValueProps) {
  const sx = stylex.props(styles.value, xstyle)
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      {...sx}
      {...props}
      className={clsx(sx.className, className)}
    />
  )
}

type SelectTriggerProps = Omit<SelectPrimitive.Trigger.Props, "className" | "style"> &
  StateOverrides & {
    size?: SelectSize
    icon?: ReactNode
  }

function SelectTrigger({
  xstyle,
  style,
  className,
  size = "default",
  icon = <CaretDownIcon aria-hidden="true" />,
  "aria-invalid": ariaInvalid,
  children,
  ...props
}: SelectTriggerProps) {
  const fieldState = use(FieldStateContext)
  const invalid = ariaInvalid != null && ariaInvalid !== false
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      aria-invalid={invalid || undefined}
      {...props}
      {...stateStyles(
        (state) => [
          styles.trigger,
          states.focusRing,
          states.fieldSurface,
          styles.triggerFill,
          sizes[size],
          state.placeholder && styles.triggerPlaceholder,
          (state.valid === false || fieldState?.valid === false || invalid) && states.invalidRing,
          state.disabled && states.disabled,
          xstyle,
        ],
        { className, style, hook: "carbon-icons" },
      )}
    >
      {children}
      {icon != null && (
        <SelectPrimitive.Icon data-slot="select-trigger-icon" {...stylex.props(styles.icon)}>
          {icon}
        </SelectPrimitive.Icon>
      )}
    </SelectPrimitive.Trigger>
  )
}

type SelectContentProps = Omit<SelectPrimitive.Popup.Props, "className" | "style"> &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  > &
  StateOverrides

function SelectContent({
  xstyle,
  style,
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        {...stylex.props(states.positioner)}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          {...props}
          {...stateStyles(
            (state) => [
              states.popupSurface,
              styles.content,
              (state.transitionStatus === "starting" || state.transitionStatus === "ending") &&
                states.transparent,
              (state.transitionStatus === "starting" || state.transitionStatus === "ending") &&
                slide[state.side],
              xstyle,
            ],
            { className, style },
          )}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List data-slot="select-list" {...stylex.props(styles.list)}>
            {children}
          </SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

type SelectLabelProps = Omit<SelectPrimitive.GroupLabel.Props, "className"> & Overrides

function SelectLabel({ xstyle, className, ...props }: SelectLabelProps) {
  const sx = stylex.props(styles.label, xstyle)
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      {...sx}
      {...props}
      className={clsx(sx.className, className)}
    />
  )
}

type SelectItemProps = Omit<SelectPrimitive.Item.Props, "className" | "style"> & StateOverrides

function SelectItem({ xstyle, style, className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      {...props}
      {...stateStyles(
        (state) => [
          styles.item,
          states.popupItem,
          state.highlighted && states.itemHighlight,
          state.disabled && states.disabled,
          xstyle,
        ],
        { className, style, hook: "carbon-icons" },
      )}
    >
      <SelectPrimitive.ItemText data-slot="select-item-text" {...stylex.props(styles.itemText)}>
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={<span data-slot="select-item-indicator" {...stylex.props(styles.indicator)} />}
      >
        <CheckIcon aria-hidden="true" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

type SelectSeparatorProps = Omit<SelectPrimitive.Separator.Props, "className"> & Overrides

function SelectSeparator({ xstyle, className, ...props }: SelectSeparatorProps) {
  const sx = stylex.props(styles.separator, xstyle)
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      {...sx}
      {...props}
      className={clsx(sx.className, className)}
    />
  )
}

type SelectScrollUpButtonProps = Omit<SelectPrimitive.ScrollUpArrow.Props, "className"> & Overrides

function SelectScrollUpButton({ xstyle, className, ...props }: SelectScrollUpButtonProps) {
  const sx = stylex.props(styles.scrollArrow, styles.scrollUp, xstyle)
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      {...sx}
      {...props}
      className={clsx("carbon-icons", sx.className, className)}
    >
      <CaretUpIcon aria-hidden="true" />
    </SelectPrimitive.ScrollUpArrow>
  )
}

type SelectScrollDownButtonProps = Omit<SelectPrimitive.ScrollDownArrow.Props, "className"> &
  Overrides

function SelectScrollDownButton({ xstyle, className, ...props }: SelectScrollDownButtonProps) {
  const sx = stylex.props(styles.scrollArrow, styles.scrollDown, xstyle)
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      {...sx}
      {...props}
      className={clsx("carbon-icons", sx.className, className)}
    >
      <CaretDownIcon aria-hidden="true" />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  selectStyles,
  type SelectSize,
}
