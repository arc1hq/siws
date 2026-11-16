"use client"

import {
  Children,
  createContext,
  isValidElement,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
  type RefObject,
} from "react"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type { StyleXStyles } from "@stylexjs/stylex"
import { clsx } from "clsx"
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check"
import { CopyIcon } from "@phosphor-icons/react/dist/csr/Copy"
import { TerminalIcon } from "@phosphor-icons/react/dist/csr/Terminal"
import { TextAlignLeftIcon } from "@phosphor-icons/react/dist/csr/TextAlignLeft"

import { Button } from "@ui/base/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/base/select"
import { useTabGroup } from "@ui/lib/tab-group"
import { codeBlock as codeBlockMarker } from "@ui/theme/markers.stylex"
import { states } from "@ui/theme/states"
import {
  color,
  duration,
  font,
  layer,
  leading,
  radius,
  shadow,
  space,
  text,
} from "@ui/theme/tokens.stylex"

const codeCommand = "light-dark(oklch(0.5 0.19 263), oklch(0.74 0.14 255))"

type ButtonProps = ComponentProps<typeof Button>

type Overrides = { xstyle?: StyleXStyles }

const InTabsContext = createContext(false)

const CodeBlockFrameContext = createContext<"framed" | "flush">("framed")

type CodeBlockFrame = "tray" | "panel" | "flush"

type CodeBlockContextValue = {
  frame: CodeBlockFrame
  viewportRef: RefObject<HTMLElement | null>
  copyable: boolean
  numbered: boolean
  lineNumbersStart?: number | string
  keepBackground: boolean
  wrap: boolean
  setWrap: (wrap: boolean) => void
  overflows: boolean
}

const CodeBlockContext = createContext<CodeBlockContextValue | null>(null)

const CodeBlockPrefixContext = createContext<ReactNode>(null)

function useCodeBlock(part: string) {
  const context = use(CodeBlockContext)
  if (!context) throw new Error(`<${part}> must be rendered inside <CodeBlockRoot>`)
  return context
}

const styles = stylex.create({
  root: {
    position: "relative",
    fontSize: text.code,
    lineHeight: leading.code,
    "--code-pad-x": space.s4,
  },
  rootTray: {
    borderRadius: radius.xl,
    padding: space.s1,
    backgroundColor: color.tray,
  },

  header: {
    display: "flex",
    height: space.s9,
    alignItems: "center",
    gap: space.s2,
    paddingInline: space.s3,
    color: color.foreground,
  },
  caption: {
    minWidth: 0,
    flexGrow: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily: font.mono,
    fontSize: text.xs,
    lineHeight: leading.xs,
    fontWeight: 500,
  },
  headerActions: { marginInlineEnd: `calc(-1 * ${space.s1_5})`, color: color.mutedForeground },
  actions: { display: "flex", alignItems: "center", gap: space.s0_5 },

  panel: { position: "relative", overflow: "clip", color: color.foreground },
  panelRaised: {
    borderRadius: radius.lg,
    backgroundColor: color.card,
    boxShadow: shadow.raised,
  },

  floatingAnchor: { position: "sticky", top: 0, zIndex: layer.overlay, height: 0 },

  floatingActions: {
    position: "absolute",
    top: space.s2,
    right: space.s2,
    zIndex: layer.overlay,
    padding: space.s0_5,
    borderRadius: radius.lg,
    backgroundColor: color.card,
    boxShadow: shadow.raised,
    color: color.mutedForeground,
    transitionProperty: "opacity",
    transitionDuration: duration.color,
    opacity: {
      default: 0,
      ":focus-within": 1,
      [stylex.when.ancestor(":hover", codeBlockMarker)]: 1,
      "@media (width < 48rem)": 1,
    },
  },

  inlineActions: {
    position: "absolute",
    insetBlock: 0,
    insetInlineEnd: 0,
    zIndex: layer.overlay,
    display: "flex",
    alignItems: "center",
    paddingInlineStart: space.s6,
    paddingInlineEnd: space.s2_5,
    backgroundImage: `linear-gradient(to right, transparent, ${color.card} ${space.s4})`,
    color: color.mutedForeground,
  },
  inlineActionsWrap: {
    alignItems: "flex-start",
    paddingBlockStart: space.s2,
    paddingInlineStart: space.s2,
    backgroundImage: "none",
  },

  viewport: {
    maxHeight: "40rem",
    overflow: "auto",
    paddingBlock: space.s3_5,
    outlineStyle: "none",
  },

  prefixed: {
    display: "flex",
    alignItems: "center",
    gap: space.s1,
    width: "max-content",
    minWidth: "100%",
    paddingInlineStart: "var(--code-pad-x)",
  },
  prefixedWrap: { alignItems: "flex-start", width: "100%" },
  prefixedBody: { display: "flex", flexGrow: 1, alignItems: "center" },
  prefixedBodyWrap: { display: "block", minWidth: 0 },
  prefixWord: { display: "flex", flexShrink: 0 },
  prefixWordWrap: { float: "inline-start" },
  prefixBadge: {
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    width: space.s4,
    height: space.s4,
    borderRadius: radius.sm,
    backgroundColor: color.foreground,
    color: color.background,
  },
  prefixBadgeWrap: { marginBlockStart: `calc((1.625em - ${space.s4}) / 2)` },
  prefixGlyph: { width: "0.6875rem", height: "0.6875rem" },
  prefixTrigger: {
    height: "auto",
    gap: space.s1,
    paddingInlineStart: space.s1,
    paddingInlineEnd: space.s1,
    marginInlineEnd: `calc(-1 * ${space.s1})`,
    paddingBlock: space.s0_5,
    borderRadius: radius.md,
    borderColor: color.transparent,
    boxShadow: { default: "none", ":focus-visible": shadow.ring },
    backgroundColor: { default: color.transparent, ":hover": color.muted },
    fontFamily: font.mono,
    fontSize: "inherit",
    lineHeight: "inherit",
    color: codeCommand,
    userSelect: "text",
    "--carbon-icon-size": space.s3,
  },
  prefixTriggerWrap: {
    paddingBlock: 0,
    marginBlock: "-1px",
    marginInlineEnd: 0,
    lineHeight: 1.625,
  },
  prefixItem: { fontFamily: font.mono, fontSize: text.code, lineHeight: leading.code },

  viewportFlush: { maxHeight: "none" },

  viewportCompact: { paddingBlock: space.s2 },

  viewportWrapReserve: {
    "--code-pad-end": `calc(2 * ${space.s6} + ${space.s0_5} + ${space.s2_5} + ${space.s2})`,
  },

  pre: {
    width: "max-content",
    minWidth: "100%",
    paddingInlineStart: "var(--code-pad-start, var(--code-pad-x))",
    paddingInlineEnd: "var(--code-pad-end, var(--code-pad-x))",
    fontFamily: font.mono,
    lineHeight: 1.625,
    tabSize: 2,
  },
  preWrap: { width: "100%", whiteSpace: "pre-wrap", overflowWrap: "anywhere" },

  icon: { flexShrink: 0, "--carbon-icon-size": space.s3_5 },
  actionIcon: { color: { default: null, ":hover": color.foreground } },
  actionIconPressed: { color: color.foreground, backgroundColor: color.muted },

  copySwatch: {
    position: "relative",
    display: "flex",
    width: space.s3_5,
    height: space.s3_5,
    alignItems: "center",
    justifyContent: "center",
  },
  copyGlyph: {
    position: "absolute",
    transitionProperty: "transform, opacity",
    transitionDuration: {
      default: duration.move,
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
  },
  copyGlyphHidden: { transform: "scale(0.5)", opacity: 0 },

  tabsRoot: {
    borderRadius: radius.xl,
    padding: space.s1,
    backgroundColor: color.tray,
  },
})

type CodeBlockRootProps = useRender.ComponentProps<"figure"> &
  Overrides & {
    allowCopy?: boolean | "true" | "false"
    keepBackground?: boolean
    wrap?: boolean
    defaultWrap?: boolean
    onWrapChange?: (wrap: boolean) => void
    "data-line-numbers"?: boolean | "true" | "false"
    "data-line-numbers-start"?: number | string
  }

function CodeBlockRoot({
  render,
  ref,
  allowCopy = true,
  keepBackground = false,
  wrap: wrapProp,
  defaultWrap = false,
  onWrapChange,
  xstyle,
  style,
  className,
  children,
  "data-line-numbers": lineNumbers,
  "data-line-numbers-start": lineNumbersStart,
  ...props
}: CodeBlockRootProps) {
  const viewportRef = useRef<HTMLElement>(null)
  const inTabs = use(InTabsContext)
  const frame: CodeBlockFrame = inTabs
    ? "panel"
    : use(CodeBlockFrameContext) === "flush"
      ? "flush"
      : "tray"
  const numbered = lineNumbers !== false && lineNumbers !== "false"
  const [uncontrolledWrap, setUncontrolledWrap] = useState(defaultWrap)
  const wrap = wrapProp ?? uncontrolledWrap
  const setWrap = (next: boolean) => {
    setUncontrolledWrap(next)
    onWrapChange?.(next)
  }
  const overflows = useOverflows(viewportRef)

  const sx = stylex.props(styles.root, frame === "tray" && styles.rootTray, codeBlockMarker, xstyle)

  const element = useRender({
    defaultTagName: "figure",
    render,
    ref,
    props: {
      dir: "ltr",
      "data-slot": "code-block",
      "data-frame": frame,
      "data-line-numbers": numbered,
      "data-line-numbers-start": lineNumbersStart,
      "data-wrap": wrap,
      ...sx,
      ...props,
      style: { ...sx.style, ...style },
      className: clsx("not-typeset", sx.className, className),
      children,
    },
  })

  return (
    <CodeBlockContext
      value={{
        frame,
        viewportRef,
        copyable: allowCopy !== false && allowCopy !== "false",
        numbered,
        lineNumbersStart,
        keepBackground,
        wrap,
        setWrap,
        overflows,
      }}
    >
      {element}
    </CodeBlockContext>
  )
}

function CodeBlockHeader({
  render,
  ref,
  xstyle,
  style,
  className,
  ...props
}: useRender.ComponentProps<"div"> & Overrides) {
  const sx = stylex.props(styles.header, xstyle)
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "code-block-header",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

type CodeBlockTitleProps = useRender.ComponentProps<"figcaption"> &
  Overrides & {
    icon?: ReactNode
  }

function CodeBlockTitle({
  render,
  ref,
  icon,
  xstyle,
  style,
  className,
  ...props
}: CodeBlockTitleProps) {
  const sx = stylex.props(styles.caption, xstyle)
  const caption = useRender({
    defaultTagName: "figcaption",
    render,
    ref,
    props: {
      "data-slot": "code-block-title",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })

  return (
    <>
      <CodeBlockIcon icon={icon} />
      {caption}
    </>
  )
}

type CodeBlockActionsProps = Omit<useRender.ComponentProps<"div">, "children"> &
  Overrides & {
    floating?: boolean
  }

function CodeBlockActions({
  render,
  ref,
  floating = false,
  xstyle,
  style,
  className,
  ...props
}: CodeBlockActionsProps) {
  const { frame, copyable, wrap, setWrap, overflows } = useCodeBlock("CodeBlockActions")
  const wrappable = wrap || overflows
  const anchored = floating && frame === "flush"
  const placement = !floating
    ? styles.headerActions
    : frame === "panel"
      ? [styles.inlineActions, wrap && styles.inlineActionsWrap]
      : styles.floatingActions

  const buttons = (
    <div {...stylex.props(styles.actions)}>
      {wrappable && <CodeBlockWrapButton wrap={wrap} onWrapChange={setWrap} />}
      {copyable && <CodeBlockCopyButton />}
    </div>
  )

  const sx = stylex.props(anchored ? styles.floatingAnchor : placement, xstyle)
  const element = useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "code-block-actions",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
      children: anchored ? <div {...stylex.props(placement)}>{buttons}</div> : buttons,
    },
  })

  return wrappable || copyable ? element : null
}

function CodeBlockPanel({
  render,
  ref,
  xstyle,
  style,
  className,
  onFocus,
  onBlur,
  ...props
}: useRender.ComponentProps<"div"> & Overrides) {
  const { frame, viewportRef, keepBackground } = useCodeBlock("CodeBlockPanel")
  const [focused, setFocused] = useState(false)
  const sx = stylex.props(
    styles.panel,
    frame !== "flush" && styles.panelRaised,
    focused && states.fieldFocusedInset,
    xstyle,
  )
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "code-block-panel",
      "data-keep-background": keepBackground,
      ...sx,
      ...props,
      onFocus: (event: FocusEvent<HTMLDivElement>) => {
        if (event.target === viewportRef.current) {
          setFocused(event.target.matches(":focus-visible"))
        }
        onFocus?.(event)
      },
      onBlur: (event: FocusEvent<HTMLDivElement>) => {
        if (event.target === viewportRef.current) setFocused(false)
        onBlur?.(event)
      },
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

type CodeBlockViewportProps = useRender.ComponentProps<"section"> &
  Overrides & {
    reserveActions?: boolean
  }

function prefixedSelection(body: HTMLElement) {
  const word = body.firstElementChild
  const line = body.querySelector(".line")
  const selection = window.getSelection()
  if (!word || !line || !selection?.rangeCount) return null
  const range = selection.getRangeAt(0)
  if (!body.contains(range.startContainer) || !body.contains(range.endContainer)) return null
  return { word, line, selection, range }
}

function usePrefixedSelection(bodyRef: RefObject<HTMLDivElement | null>, prefixed: boolean) {
  useEffect(() => {
    const body = bodyRef.current
    if (!body) return

    const selectWord = (event: MouseEvent) => {
      if (event.detail < 2) return
      const found = prefixedSelection(body)
      if (!found) return
      const { word, line, selection, range } = found
      const lead = document.createRange()
      lead.setStart(line, 0)
      lead.setEnd(range.startContainer, range.startOffset)
      const skipped = lead.toString().trim()
      if (skipped !== "" && skipped !== line.firstElementChild?.textContent) return
      selection.setBaseAndExtent(word, 0, range.endContainer, range.endOffset)
    }

    const copyCommand = (event: ClipboardEvent) => {
      const found = prefixedSelection(body)
      if (!found || !event.clipboardData || !found.range.intersectsNode(found.word)) return
      const command = document.createRange()
      command.setStart(found.line, 0)
      command.setEnd(found.range.endContainer, found.range.endOffset)
      event.preventDefault()
      event.clipboardData.setData("text/plain", command.toString().trimEnd())
    }

    body.addEventListener("click", selectWord)
    body.addEventListener("copy", copyCommand)
    return () => {
      body.removeEventListener("click", selectWord)
      body.removeEventListener("copy", copyCommand)
    }
  }, [bodyRef, prefixed])
}

function CodeBlockViewport({
  render,
  ref,
  reserveActions = false,
  xstyle,
  style,
  className,
  children,
  ...props
}: CodeBlockViewportProps) {
  const { frame, viewportRef, numbered, lineNumbersStart, wrap } = useCodeBlock("CodeBlockViewport")
  const prefix = use(CodeBlockPrefixContext)
  const prefixedBodyRef = useRef<HTMLDivElement>(null)
  usePrefixedSelection(prefixedBodyRef, prefix != null)
  const reserveWrapped = reserveActions && wrap && frame === "panel"
  const sx = stylex.props(
    styles.viewport,
    prefix != null && styles.viewportCompact,
    frame === "flush" && styles.viewportFlush,
    reserveWrapped && styles.viewportWrapReserve,
    xstyle,
  )
  const viewportStyle: CSSProperties & {
    "--code-pad-end": string | undefined
    "--code-pad-start": string | undefined
  } = {
    ...sx.style,
    "--code-pad-end": reserveActions && !reserveWrapped ? "2.75rem" : undefined,
    "--code-pad-start": prefix ? "0px" : undefined,
    counterSet: numbered ? `line ${Number(lineNumbersStart ?? 1) - 1}` : undefined,
    ...style,
  }

  return useRender({
    defaultTagName: "section",
    render,
    ref: [ref ?? null, viewportRef],
    props: {
      tabIndex: 0,
      "data-slot": "code-block-viewport",
      ...sx,
      ...props,
      className: clsx("mdx-scrollbar scroll-fade-x scroll-fade-y", sx.className, className),
      children: prefix ? (
        <div
          data-slot="code-block-prefixed"
          {...stylex.props(styles.prefixed, wrap && styles.prefixedWrap)}
        >
          <span aria-hidden {...stylex.props(styles.prefixBadge, wrap && styles.prefixBadgeWrap)}>
            <TerminalIcon aria-hidden="true" weight="bold" {...stylex.props(styles.prefixGlyph)} />
          </span>
          <div
            ref={prefixedBodyRef}
            {...stylex.props(styles.prefixedBody, wrap && styles.prefixedBodyWrap)}
          >
            <span {...stylex.props(styles.prefixWord, wrap && styles.prefixWordWrap)}>
              {prefix}
            </span>
            {children}
          </div>
        </div>
      ) : (
        children
      ),
      style: viewportStyle,
    },
  })
}

type CodeBlockProps = Omit<CodeBlockRootProps, "title"> & {
  title?: ReactNode
  icon?: ReactNode
  viewportProps?: CodeBlockViewportProps
}

function CodeBlock({ title, icon, viewportProps, children, ...props }: CodeBlockProps) {
  return (
    <CodeBlockRoot {...props}>
      {title && (
        <CodeBlockHeader>
          <CodeBlockTitle icon={icon}>{title}</CodeBlockTitle>
          <CodeBlockActions />
        </CodeBlockHeader>
      )}
      <CodeBlockPanel>
        {!title && <CodeBlockActions floating />}
        <CodeBlockViewport
          aria-label={typeof title === "string" ? `Code: ${title}` : "Code block"}
          reserveActions={!title}
          {...viewportProps}
        >
          {children}
        </CodeBlockViewport>
      </CodeBlockPanel>
    </CodeBlockRoot>
  )
}

function Pre({
  render,
  ref,
  style,
  xstyle,
  className,
  ...props
}: useRender.ComponentProps<"pre"> & Overrides) {
  const wrap = use(CodeBlockContext)?.wrap ?? false
  const sx = stylex.props(styles.pre, wrap && styles.preWrap, xstyle)
  return useRender({
    defaultTagName: "pre",
    render,
    ref,
    props: {
      "data-slot": "code-block-pre",
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })
}

function useOverflows(ref: RefObject<HTMLElement | null>) {
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    const viewport = ref.current
    if (!viewport) return

    const check = () => setOverflows(viewport.scrollWidth > viewport.clientWidth + 1)
    const observer = new ResizeObserver(check)
    observer.observe(viewport)

    const pre = viewport.querySelector("pre")
    if (pre) observer.observe(pre)

    check()
    return () => observer.disconnect()
  }, [ref])

  return overflows
}

function CodeBlockWrapButton({
  wrap,
  onWrapChange,
}: {
  wrap: boolean
  onWrapChange: (wrap: boolean) => void
}) {
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={() => onWrapChange(!wrap)}
      aria-pressed={wrap}
      aria-label={wrap ? "Disable soft wrap" : "Enable soft wrap"}
      xstyle={[styles.actionIcon, wrap && styles.actionIconPressed]}
    >
      <TextAlignLeftIcon aria-hidden="true" {...stylex.props(styles.icon)} />
    </Button>
  )
}

function CodeBlockIcon({ icon }: { icon?: ReactNode }) {
  if (!icon) return null

  const iconSx = stylex.props(styles.icon)

  if (typeof icon === "string") {
    return (
      <span
        aria-hidden
        {...iconSx}
        className={clsx("carbon-icons", iconSx.className)}
        dangerouslySetInnerHTML={{ __html: icon }}
      />
    )
  }

  return (
    <span {...iconSx} className={clsx("carbon-icons", iconSx.className)}>
      {icon}
    </span>
  )
}

function CodeBlockCopyButton({ xstyle, ...props }: ButtonProps) {
  const { viewportRef } = useCodeBlock("CodeBlockCopyButton")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(timeout)
  }, [copied])

  const copy = useCallback(() => {
    const pre = viewportRef.current?.querySelector("pre")
    if (!pre) return

    const clone = pre.cloneNode(true)
    if (!(clone instanceof HTMLElement)) return
    for (const line of clone.querySelectorAll(".line.diff.remove")) {
      const newline = line.nextSibling
      if (newline?.nodeType === Node.TEXT_NODE && newline.textContent === "\n") newline.remove()
      line.remove()
    }

    void navigator.clipboard.writeText(clone.textContent ?? "").then(() => setCopied(true))
  }, [viewportRef])

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy code"}
      xstyle={[styles.actionIcon, xstyle]}
      {...props}
    >
      <span {...stylex.props(styles.copySwatch)}>
        <CopyIcon
          aria-hidden="true"
          {...stylex.props(styles.copyGlyph, copied && styles.copyGlyphHidden)}
        />
        <CheckIcon
          aria-hidden="true"
          {...stylex.props(styles.copyGlyph, !copied && styles.copyGlyphHidden)}
        />
      </span>
    </Button>
  )
}

type CodeBlockTabOption = { value: string; prefix: string }

type CodeBlockTabsContextValue = {
  value: string
  options: readonly CodeBlockTabOption[]
  onValueChange: (value: string) => void
}

const CodeBlockTabsContext = createContext<CodeBlockTabsContextValue | null>(null)

function useCodeBlockTabs(part: string) {
  const context = use(CodeBlockTabsContext)
  if (!context) throw new Error(`<${part}> must be rendered inside <CodeBlockTabs>`)
  return context
}

function optionsFrom(children: ReactNode): CodeBlockTabOption[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<CodeBlockTabProps>(child) && typeof child.props.value === "string"
      ? [{ value: child.props.value, prefix: child.props.prefix ?? child.props.value }]
      : [],
  )
}

type CodeBlockTabsProps = useRender.ComponentProps<"div"> &
  Overrides & {
    defaultValue: string
    groupId?: string
    persist?: boolean
  }

function CodeBlockTabs({
  render,
  ref,
  defaultValue,
  groupId,
  persist = false,
  xstyle,
  style,
  className,
  children,
  ...props
}: CodeBlockTabsProps) {
  const [value, onValueChange] = useTabGroup(defaultValue, groupId, persist)
  const sx = stylex.props(styles.tabsRoot, xstyle)

  const element = useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "code-block-tabs",
      ...sx,
      ...props,
      className: clsx("not-typeset", sx.className, className),
      style: { ...sx.style, ...style },
      children: <InTabsContext value={true}>{children}</InTabsContext>,
    },
  })

  return (
    <CodeBlockTabsContext value={{ value, options: optionsFrom(children), onValueChange }}>
      {element}
    </CodeBlockTabsContext>
  )
}

function CodeBlockTabsSelect({ "aria-label": label }: { "aria-label": string }) {
  const { value, options, onValueChange } = useCodeBlockTabs("CodeBlockTabsSelect")
  const { wrap } = useCodeBlock("CodeBlockTabsSelect")

  return (
    <Select
      value={value}
      items={options.map((option) => ({ value: option.value, label: option.prefix }))}
      onValueChange={(next: string | null) => {
        if (next != null) onValueChange(next)
      }}
    >
      <SelectTrigger
        size="sm"
        icon={null}
        aria-label={label}
        xstyle={[styles.prefixTrigger, wrap && styles.prefixTriggerWrap]}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} xstyle={styles.prefixItem}>
            {option.prefix}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

type CodeBlockTabProps = useRender.ComponentProps<"div"> &
  Overrides & {
    value: string
    prefix?: string
    selectLabel?: string
  }

function CodeBlockTab({
  render,
  ref,
  value,
  prefix: _prefix,
  selectLabel = "Package manager",
  xstyle,
  style,
  className,
  ...props
}: CodeBlockTabProps) {
  const { value: active } = useCodeBlockTabs("CodeBlockTab")
  const sx = stylex.props(xstyle)

  const element = useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "code-block-tab",
      "data-value": value,
      hidden: value !== active,
      ...sx,
      ...props,
      className: clsx(sx.className, className),
      style: { ...sx.style, ...style },
    },
  })

  return (
    <CodeBlockPrefixContext value={<CodeBlockTabsSelect aria-label={selectLabel} />}>
      {element}
    </CodeBlockPrefixContext>
  )
}

export {
  CodeBlock,
  CodeBlockActions,
  CodeBlockFrameContext,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockPanel,
  CodeBlockRoot,
  CodeBlockTitle,
  CodeBlockViewport,
  CodeBlockTab,
  CodeBlockTabs,
  Pre,
}
