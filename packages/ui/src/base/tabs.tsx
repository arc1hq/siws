"use client"

import { createContext, use } from "react"
import type { CSSProperties } from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"

import { stateStyles } from "@ui/lib/state-styles"
import { states } from "@ui/theme/states"
import { color, duration, ease, leading, radius, space, text } from "@ui/theme/tokens.stylex"

const tabsTriggerIdle = `light-dark(color-mix(in oklab, ${color.foreground} 60%, transparent), ${color.mutedForeground})`

const TabsIndicatorContext = createContext(false)

const TabsOrientationContext = createContext<"horizontal" | "vertical">("horizontal")
const TabsVariantContext = createContext<TabsVariant>("default")

type TabsVariant = keyof typeof listVariants

const pillRadius = `var(--tabs-indicator-radius, calc(${radius.lg} - 3px))`

const styles = stylex.create({
  root: { display: "flex", gap: space.s2 },
  rootHorizontal: { flexDirection: "column" },
  rootVertical: { flexDirection: "row" },

  list: {
    position: "relative",
    display: "inline-flex",
    height: space.s9,
    width: "fit-content",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    padding: "3px",
    color: color.mutedForeground,
  },
  listVertical: { height: "fit-content", flexDirection: "column" },

  trigger: {
    position: "relative",
    display: "inline-flex",
    height: "100%",
    flexGrow: 1,
    flexBasis: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: space.s2,
    borderRadius: pillRadius,
    borderWidth: 1,
    borderStyle: "solid",
    paddingInline: space.s3,
    paddingBlock: space.s1,
    fontSize: text.sm,
    lineHeight: leading.sm,
    fontWeight: 500,
    whiteSpace: "nowrap",
    color: { default: tabsTriggerIdle, ":hover": color.foreground },
    transitionProperty: "color, background-color, border-color",
    transitionDuration: duration.color,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: { default: null, ":focus-visible": "1px" },
    outlineColor: { default: null, ":focus-visible": color.ring },
    pointerEvents: { default: null, ":disabled": "none" },
    opacity: { default: 1, ":disabled": 0.5 },
    "--carbon-icon-size": space.s4,
  },
  triggerVertical: { width: "100%", justifyContent: "flex-start" },
  triggerActive: { color: color.foreground },
  triggerIconStart: { paddingInlineStart: space.s2 },
  triggerIconEnd: { paddingInlineEnd: space.s2 },

  pill: {
    pointerEvents: "none",
    position: "absolute",
    borderRadius: pillRadius,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--carbon-border-color)",
    boxShadow: "var(--carbon-key-surface)",
    top: "var(--active-tab-top)",
    left: "var(--active-tab-left)",
    height: "var(--active-tab-height)",
    width: "var(--active-tab-width)",
    transitionProperty: "left, top, width, height",
    transitionDuration: {
      default: duration.panel,
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionTimingFunction: ease.spring,
  },

  clip: {
    pointerEvents: "none",
    position: "absolute",
    inset: 0,
    userSelect: "none",
    backgroundColor: color.transparent,
    boxShadow: "none",
    clipPath: `inset(var(--active-tab-top, 0px) calc(100% - var(--active-tab-left, 0px) - var(--active-tab-width, 0px)) calc(100% - var(--active-tab-top, 0px) - var(--active-tab-height, 0px)) var(--active-tab-left, 0px) round ${pillRadius})`,
    transitionProperty: "clip-path",
    transitionDuration: {
      default: duration.panel,
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionTimingFunction: ease.spring,
  },

  line: {
    pointerEvents: "none",
    position: "absolute",
    backgroundColor: `var(--tabs-indicator-color, ${color.foreground})`,
    transitionProperty: "left, top, width, height",
    transitionDuration: {
      default: duration.slide,
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionTimingFunction: ease.out,
  },
  lineHorizontal: {
    bottom: "-0.5px",
    left: "var(--active-tab-left)",
    height: "2px",
    width: "var(--active-tab-width)",
  },
  lineVertical: {
    top: "var(--active-tab-top)",
    right: "-0.25rem",
    height: "var(--active-tab-height)",
    width: "2px",
  },

  content: { flexGrow: 1, fontSize: text.sm, lineHeight: leading.sm, outlineStyle: "none" },
})

const lineList = stylex.create({
  line: {
    borderRadius: 0,
    gap: space.s1,
    backgroundColor: color.transparent,
    paddingInline: 0,
    "::before": {
      content: "''",
      position: "absolute",
      insetInline: 0,
      bottom: "-0.5px",
      height: 1,
      backgroundColor: color.border,
    },
  },
})

const listVariants = { default: states.well, line: lineList.line }

const tabsStyles = {
  list: styles.list,
  variants: listVariants,
  trigger: [states.focusRing, styles.trigger],
}

type TabsProps = Omit<TabsPrimitive.Root.Props, "className"> & {
  xstyle?: StyleXStyles
  className?: string
}

function Tabs({ xstyle, className, orientation = "horizontal", ...props }: TabsProps) {
  const sx = stylex.props(
    styles.root,
    orientation === "vertical" ? styles.rootVertical : styles.rootHorizontal,
    xstyle,
  )

  return (
    <TabsOrientationContext value={orientation}>
      <TabsPrimitive.Root
        data-slot="tabs"
        data-orientation={orientation}
        orientation={orientation}
        {...sx}
        {...props}
        className={clsx(sx.className, className)}
      />
    </TabsOrientationContext>
  )
}

type TabsListProps = Omit<TabsPrimitive.List.Props, "className"> & {
  variant?: TabsVariant
  xstyle?: StyleXStyles
  className?: string
}

function TabsList({ xstyle, className, variant = "default", children, ...props }: TabsListProps) {
  const orientation = use(TabsOrientationContext)
  const vertical = orientation === "vertical"

  const rowStyles = [styles.list, vertical && styles.listVertical, listVariants[variant], xstyle]
  const sx = stylex.props(...rowStyles)

  return (
    <TabsVariantContext value={variant}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        {...sx}
        {...props}
        className={clsx(sx.className, className)}
      >
        {children}
        {variant === "default" && (
          <>
            <TabsPrimitive.Indicator
              data-slot="tabs-indicator-pill"
              renderBeforeHydration
              {...stylex.props(states.wellKey, styles.pill)}
            />
            <TabsPrimitive.Indicator
              data-slot="tabs-indicator"
              aria-hidden
              renderBeforeHydration
              {...stylex.props(...rowStyles, styles.clip)}
            >
              <TabsIndicatorContext value={true}>{children}</TabsIndicatorContext>
            </TabsPrimitive.Indicator>
          </>
        )}
        {variant === "line" && (
          <TabsPrimitive.Indicator
            data-slot="tabs-indicator"
            renderBeforeHydration
            {...stylex.props(styles.line, vertical ? styles.lineVertical : styles.lineHorizontal)}
          />
        )}
      </TabsPrimitive.List>
    </TabsVariantContext>
  )
}

type TabsTriggerProps = Omit<TabsPrimitive.Tab.Props, "className" | "style"> & {
  iconPosition?: "start" | "end" | "both"
  xstyle?: StyleXStyles
  style?: CSSProperties
  className?: string
}

function TabsTrigger({
  xstyle,
  style,
  className,
  iconPosition,
  children,
  ...props
}: TabsTriggerProps) {
  const orientation = use(TabsOrientationContext)
  const variant = use(TabsVariantContext)
  const vertical = orientation === "vertical"

  const shared = [
    states.focusRing,
    styles.trigger,
    vertical && styles.triggerVertical,
    (iconPosition === "start" || iconPosition === "both") && styles.triggerIconStart,
    (iconPosition === "end" || iconPosition === "both") && styles.triggerIconEnd,
  ] as const

  if (use(TabsIndicatorContext)) {
    const sx = stylex.props(...shared, styles.triggerActive, xstyle)
    return (
      <span
        data-slot="tabs-indicator-tab"
        data-active=""
        {...sx}
        className={clsx("carbon-icons", sx.className, className)}
        style={{ ...sx.style, ...style }}
      >
        {children}
      </span>
    )
  }

  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      {...props}
      {...stateStyles(
        (state) => [
          ...shared,
          variant !== "default" && state.active && styles.triggerActive,
          xstyle,
        ],
        { className, style, hook: "carbon-icons" },
      )}
    >
      {children}
    </TabsPrimitive.Tab>
  )
}

type TabsContentProps = Omit<TabsPrimitive.Panel.Props, "className"> & {
  xstyle?: StyleXStyles
  className?: string
}

function TabsContent({ xstyle, className, ...props }: TabsContentProps) {
  const sx = stylex.props(styles.content, xstyle)
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      {...sx}
      {...props}
      className={clsx(sx.className, className)}
    />
  )
}

export { Tabs, TabsContent, TabsList, tabsStyles, TabsTrigger, type TabsVariant }
