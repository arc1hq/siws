'use client'

import { Check, Copy } from 'lucide-react'
import GitHubIcon from '@siws/icons/GitHubIcon'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/lib/site'

const PACKAGES: Record<string, string> = {
  core: '@siws/core',
  'better-auth': '@siws/better-auth',
}

function getPackageForPath(pathname: string): string {
  if (pathname.startsWith('/docs/packages/better-auth')) return PACKAGES['better-auth']!
  return PACKAGES.core!
}

export function TocPromoCard() {
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)

  const pkg = getPackageForPath(pathname)
  const installCommand = `npm i ${pkg}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(installCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-muted/50 p-3">
      <button
        type="button"
        onClick={handleCopy}
        className="group relative flex w-full items-center gap-2.5 rounded-lg border border-border/60 bg-background px-3 py-2.5 text-left font-mono text-[13px] transition-colors hover:bg-muted/50"
      >
        <span className="flex-1 truncate text-foreground/80">{installCommand}</span>
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground">
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </span>
      </button>
      <a
        href={siteConfig.links.github}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto pr-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground/70 transition-colors hover:text-foreground"
      >
        <GitHubIcon className="size-3" />
        <span>Source</span>
      </a>
    </div>
  )
}
