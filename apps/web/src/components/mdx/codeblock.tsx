"use client"

import { cn } from "@ui/lib/utils"
import { Button } from "@ui/shadcn/button"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { CopyButton } from "./copy-button"

interface CodeBlockContextValue {
  title?: string
  hasTitle: boolean
  collapsible: boolean
  isCollapsed: boolean
  setIsCollapsed: (v: boolean) => void
  codeChildren: React.ReactNode
  preRef: React.RefObject<HTMLPreElement | null>
  preBackgroundColor?: string
}

const CodeBlockContext = createContext<CodeBlockContextValue | null>(null)

function useCodeBlock() {
  const ctx = useContext(CodeBlockContext)
  if (!ctx)
    throw new Error(
      "CodeBlock compound components must be used within <CodeBlock>",
    )
  return ctx
}

function CodeBlockRoot({
  title,
  collapsible = false,
  defaultCollapsed = false,
  dataTheme,
  codeChildren,
  className,
  children,
}: {
  title?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
  dataTheme?: string
  codeChildren: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(
    collapsible && defaultCollapsed,
  )
  const preRef = useRef<HTMLPreElement>(null)
  const [preBackgroundColor, setPreBackgroundColor] = useState<string>()

  useEffect(() => {
    const updatePreBackgroundColor = () => {
      if (!preRef.current) return
      const nextBackgroundColor = window.getComputedStyle(
        preRef.current,
      ).backgroundColor
      if (nextBackgroundColor) setPreBackgroundColor(nextBackgroundColor)
    }

    updatePreBackgroundColor()
    const raf = window.requestAnimationFrame(updatePreBackgroundColor)

    const observer = new MutationObserver(updatePreBackgroundColor)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      window.cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [])

  return (
    <CodeBlockContext.Provider
      value={{
        title,
        hasTitle: !!title,
        collapsible,
        isCollapsed,
        setIsCollapsed,
        codeChildren,
        preRef,
        preBackgroundColor,
      }}
    >
      <div
        data-theme={dataTheme}
        className={cn(
          "relative overflow-hidden rounded-xl text-sm group/codeblock border border-border",
          className,
        )}
      >
        {children}
      </div>
    </CodeBlockContext.Provider>
  )
}

function CodeBlockHeader({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-muted/40 font-sans",
        className,
      )}
    >
      {children}
    </div>
  )
}

function CodeBlockTitle({ className }: { className?: string }) {
  const { title } = useCodeBlock()
  if (!title) return null
  return (
    <span
      className={cn(
        "text-sm font-mono text-muted-foreground truncate",
        className,
      )}
    >
      {title}
    </span>
  )
}

function CodeBlockExpandButton({ className }: { className?: string }) {
  const { collapsible, isCollapsed, setIsCollapsed } = useCodeBlock()
  if (!collapsible) return null
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsCollapsed(!isCollapsed)}
      className={cn(className)}
    >
      {isCollapsed ? "Expand" : "Collapse"}
    </Button>
  )
}

function CodeBlockCopyButton({
  className,
  floating,
}: {
  className?: string
  floating?: boolean
}) {
  const { codeChildren, preBackgroundColor } = useCodeBlock()

  if (floating) {
    return (
      <div className="pointer-events-none absolute top-1.5 right-1.5 z-10">
        <div
          className="pointer-events-auto rounded-md bg-muted/80 p-1"
          style={
            preBackgroundColor
              ? { backgroundColor: preBackgroundColor }
              : undefined
          }
        >
          <CopyButton className={cn("[&_svg]:size-3.5", className)}>
            {codeChildren}
          </CopyButton>
        </div>
      </div>
    )
  }

  return <CopyButton className={className}>{codeChildren}</CopyButton>
}

function CodeBlockContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { collapsible, isCollapsed } = useCodeBlock()

  return (
    <div
      className={cn(
        "relative font-mono codeblock-scroll-fades",
        collapsible ? "overflow-hidden" : "overflow-visible",
        collapsible && "transition-[max-height] duration-300 ease-in-out",
        collapsible && isCollapsed ? "max-h-[200px]" : "max-h-none",
        className,
      )}
    >
      {children}
      {collapsible && isCollapsed && <CodeBlockCollapsedOverlay />}
    </div>
  )
}

function CodeBlockCollapsedOverlay({ className }: { className?: string }) {
  const { setIsCollapsed } = useCodeBlock()
  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-muted to-transparent flex items-end justify-center pb-2",
        className,
      )}
    >
      <Button
        type="button"
        onClick={() => setIsCollapsed(false)}
        variant="ghost"
        size="sm"
        className="bg-transparent hover:bg-transparent text-muted-foreground"
      >
        Expand
      </Button>
    </div>
  )
}

function CodeBlockPre({
  className,
  preProps,
  children,
}: {
  className?: string
  preProps: Omit<
    PreBlockProps,
    | "children"
    | "className"
    | "__title__"
    | "__collapsed__"
    | "__rawString__"
    | "__withMeta__"
    | "__src__"
    | "__event__"
    | "__style__"
    | "data-theme"
  >
  children: React.ReactNode
}) {
  const { preRef } = useCodeBlock()

  return (
    <pre
      ref={preRef}
      className={cn("overflow-x-auto font-mono no-scrollbar", className)}
      {...preProps}
    >
      {children}
    </pre>
  )
}

export interface PreBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  __title__?: string
  __collapsed__?: string
  __rawString__?: string
  __withMeta__?: boolean
  __src__?: string
  __event__?: string
  __style__?: string
  "data-theme"?: string
}

export const CodeBlock = ({
  children,
  className,
  __title__: title,
  __collapsed__: collapsed,
  __rawString__: _rawString,
  __withMeta__: _withMeta,
  __src__: _src,
  __event__: _event,
  __style__: _style,
  "data-theme": dataTheme,
  ...props
}: PreBlockProps) => {
  const hasTitle = !!title
  const isCollapsible = collapsed === "true"

  return (
    <CodeBlockRoot
      title={title}
      collapsible={isCollapsible}
      defaultCollapsed={isCollapsible}
      dataTheme={dataTheme}
      codeChildren={children}
    >
      {hasTitle && (
        <CodeBlockHeader>
          <CodeBlockTitle />
          <div className="flex items-center gap-2 shrink-0">
            <CodeBlockExpandButton />
            <CodeBlockCopyButton />
          </div>
        </CodeBlockHeader>
      )}

      <CodeBlockContent>
        {!hasTitle && <CodeBlockCopyButton floating />}
        <CodeBlockPre className={className} preProps={props}>
          {children}
        </CodeBlockPre>
      </CodeBlockContent>
    </CodeBlockRoot>
  )
}

export {
  CodeBlockRoot,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockExpandButton,
  CodeBlockCopyButton,
  CodeBlockContent,
  CodeBlockCollapsedOverlay,
}
