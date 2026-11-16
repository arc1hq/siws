"use client"

import { useEffect, useState, type ComponentType } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as stylex from "@stylexjs/stylex"
import { clsx } from "clsx"
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight"
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown"
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check"
import { CopyIcon } from "@phosphor-icons/react/dist/csr/Copy"
import { Button, buttonStyles } from "@ui/base/button"
import { ButtonGroup, ButtonGroupSeparator } from "@ui/base/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from "@ui/base/dropdown-menu"
import { space } from "@ui/theme/tokens.stylex"
import ChatGPTIcon from "@siws/icons/ChatGPTIcon"
import ClaudeIcon from "@siws/icons/ClaudeIcon"
import CursorIcon from "@siws/icons/CursorIcon"
import MarkdownIcon from "@siws/icons/MarkdownIcon"
import type { AdjacentPage } from "@/lib/get-adjacent-pages"
import { siteConfig } from "@/lib/site"

type Assistant = {
  name: string
  Icon: ComponentType<{ className?: string }>
  href: (prompt: string) => string
}

const assistants: Assistant[] = [
  { name: "ChatGPT", Icon: ChatGPTIcon, href: (q) => `https://chatgpt.com/?hints=search&q=${q}` },
  { name: "Claude", Icon: ClaudeIcon, href: (q) => `https://claude.ai/new?q=${q}` },
  { name: "Cursor", Icon: CursorIcon, href: (q) => `cursor://anysphere.cursor-deeplink/prompt?text=${q}` },
]

const newTab = { target: "_blank", rel: "noopener noreferrer" } as const

const styles = stylex.create({
  row: { display: "flex", alignItems: "center", gap: space.s2, flexShrink: 0 },
  square: { width: space.s7, paddingInline: 0 },
  menuItem: { gap: space.s2, "--carbon-icon-size": space.s3_5 },
})

const arrowSx = stylex.props(
  buttonStyles.base,
  buttonStyles.variants.outline,
  buttonStyles.sizes.sm,
  buttonStyles.group.horizontal,
  styles.square,
)

function CopyPage({ markdownHref }: { markdownHref: string }) {
  const [copied, setCopied] = useState(false)
  const prompt = encodeURIComponent(
    `Read ${new URL(markdownHref, siteConfig.url)}, I want to ask questions about it.`,
  )

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(timeout)
  }, [copied])

  const copy = async () => {
    const text = fetch(markdownHref).then((response) => response.text())
    try {
      await navigator.clipboard.write([new ClipboardItem({ "text/plain": text.then((t) => new Blob([t], { type: "text/plain" })) })])
    } catch {
      await navigator.clipboard.writeText(await text)
    }
    setCopied(true)
  }

  return (
    <ButtonGroup aria-label="Page">
      <Button variant="outline" size="sm" iconPosition="start" onClick={copy}>
        {copied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
        Copy page
      </Button>
      <ButtonGroupSeparator />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="outline" size="sm" aria-label="More page actions" xstyle={styles.square} />}
        >
          <CaretDownIcon aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLinkItem href={markdownHref} closeOnClick xstyle={styles.menuItem} {...newTab}>
            <MarkdownIcon />
            View as Markdown
          </DropdownMenuLinkItem>
          {assistants.map(({ name, Icon, href }) => {
            const url = href(prompt)
            return (
              <DropdownMenuLinkItem
                key={name}
                href={url}
                closeOnClick
                xstyle={styles.menuItem}
                {...(url.startsWith("https:") ? newTab : {})}
              >
                <Icon />
                Open with {name}
              </DropdownMenuLinkItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}

function PageArrow({ page, direction }: { page: AdjacentPage; direction: "previous" | "next" }) {
  const Icon = direction === "previous" ? ArrowLeftIcon : ArrowRightIcon
  const label = direction === "previous" ? "Previous page" : "Next page"
  const key = direction === "previous" ? "H" : "L"

  if (!page) {
    return (
      <Button variant="outline" size="sm" disabled aria-label={label} xstyle={styles.square}>
        <Icon aria-hidden />
      </Button>
    )
  }

  return (
    <Link
      href={page.href}
      aria-label={`${label}: ${page.title}`}
      aria-keyshortcuts={key}
      title={`${page.title} (${key})`}
      data-slot="button"
      data-variant="outline"
      {...arrowSx}
      className={clsx("carbon-icons", arrowSx.className)}
    >
      <Icon aria-hidden />
    </Link>
  )
}

export function PageActions({
  markdownHref,
  prev,
  next,
}: {
  markdownHref: string
  prev: AdjacentPage
  next: AdjacentPage
}) {
  const router = useRouter()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.defaultPrevented) return
      const target = event.target
      if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return
      const key = event.key.toLowerCase()
      if (key === "h" && prev) router.push(prev.href)
      if (key === "l" && next) router.push(next.href)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [router, prev, next])

  return (
    <div {...stylex.props(styles.row)}>
      <CopyPage markdownHref={markdownHref} />
      <ButtonGroup aria-label="Pages">
        <PageArrow page={prev} direction="previous" />
        <ButtonGroupSeparator />
        <PageArrow page={next} direction="next" />
      </ButtonGroup>
    </div>
  )
}
