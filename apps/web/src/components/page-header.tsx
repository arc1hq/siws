'use client'

import { Button } from '@siws/ui/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@siws/ui/shadcn/dropdown-menu'
import type { AdjacentPage } from '@/lib/get-adjacent-pages'
import {
  buildEncodedAssistantContext,
  getAssistantTargets,
} from '@/lib/assistant-targets'
import { useHotkey } from '@tanstack/react-hotkeys'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Copy } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { cn } from '@ui/lib/utils'

interface PageHeaderProps {
  title: string
  excerpt?: string
  markdownHref?: string
  rawContent?: string
  prev: AdjacentPage
  next: AdjacentPage
}

export function PageHeader({ title, excerpt, markdownHref, rawContent, prev, next }: PageHeaderProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const canCopy = Boolean(rawContent && markdownHref)
  const triggerId = markdownHref
    ? `copy-page-menu-trigger-${markdownHref.replace(/[^a-zA-Z0-9_-]/g, '-')}`
    : 'copy-page-menu-trigger'

  const handleCopy = async () => {
    if (!rawContent) return
    await navigator.clipboard.writeText(rawContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useHotkey(
    'H',
    () => {
      if (prev) router.push(prev.href)
    },
    { enabled: !!prev }
  )
  useHotkey(
    'L',
    () => {
      if (next) router.push(next.href)
    },
    { enabled: !!next }
  )

  const encoded = useMemo(() => buildEncodedAssistantContext(rawContent), [rawContent])
  const assistantTargets = useMemo(
    () => getAssistantTargets({ encoded, markdownHref, includeMarkdown: true }),
    [encoded, markdownHref]
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <div className="flex items-center gap-1.5">
          {canCopy && markdownHref ? (
            <div className="flex items-center bg-secondary rounded-lg">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-r-none border-0 gap-2"
                onClick={handleCopy}
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                <span>Copy Page</span>
              </Button>
              <div className="h-8 border-r border-dashed" />
              <DropdownMenu>
                <DropdownMenuTrigger
                  id={triggerId}
                  render={
                    <Button variant="secondary" size="sm" className="rounded-l-none border-0 px-1.5">
                      <ChevronDown className="size-3.5" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-48">
                  {assistantTargets.map((target) => (
                    <DropdownMenuItem
                      key={target.id}
                      className="gap-2"
                      render={
                        <a
                          href={target.href}
                          target={target.external ? '_blank' : undefined}
                          rel={target.external ? 'noopener noreferrer' : undefined}
                        />
                      }
                    >
                      <target.Icon className="size-3.5" />
                      {target.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null}
          <div className="flex items-center rounded-lg">
            <Button
              variant="secondary"
              size="icon"
              className={cn("rounded-r-none border-0", !prev && "text-muted-foreground")}
              disabled={!prev}
              nativeButton={false}
              render={<Link href={prev?.href ?? '#'} />}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="h-8 border-r border-dashed" />
            <Button
              variant="secondary"
              size="icon"
              className={cn("rounded-l-none border-0", !next && "text-muted-foreground")}
              disabled={!next}
              nativeButton={false}
              render={<Link href={next?.href ?? '#'} />}
            >
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
      {excerpt ? <p className="text-muted-foreground">{excerpt}</p> : null}
    </div>
  )
}
