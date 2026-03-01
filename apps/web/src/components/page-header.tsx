'use client'

import { Button } from '@siws/ui/shadcn/button'
import type { AdjacentPage } from '@/lib/get-adjacent-pages'
import { ArrowLeft, ArrowRight, Check, Copy } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface PageHeaderProps {
  title: string
  rawContent?: string
  prev: AdjacentPage
  next: AdjacentPage
}

export function PageHeader({ title, rawContent, prev, next }: PageHeaderProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!rawContent) return
    await navigator.clipboard.writeText(rawContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex justify-between items-start">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <div className="flex items-center gap-1.5">
        {rawContent && (
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={handleCopy}
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            <span>Copy Page</span>
          </Button>
        )}
        {prev ? (
          <Button
            variant="secondary"
            size="icon"
            className="border-0"
            nativeButton={false}
            render={<Link href={prev.href} />}
          >
            <ArrowLeft className="size-4" />
          </Button>
        ) : (
          <Button variant="secondary" size="icon" className="border-0" disabled>
            <ArrowLeft className="size-4" />
          </Button>
        )}
        {next ? (
          <Button
            variant="secondary"
            size="icon"
            className="border-0"
            nativeButton={false}
            render={<Link href={next.href} />}
          >
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button variant="secondary" size="icon" className="border-0" disabled>
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
