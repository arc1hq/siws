'use client'

import { Button } from '@siws/ui/shadcn/button'
import { cn } from '@siws/ui/lib/utils'
import { navSections } from '@/lib/nav-data'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!pathname) return

    const nav = navRef.current
    if (!nav) return

    const activeLink = nav.querySelector<HTMLAnchorElement>('a[data-active="true"]')
    if (!activeLink) return

    activeLink.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [pathname])

  return (
    <div>
      <nav ref={navRef} className="flex flex-col gap-6 px-2 py-4 text-sm">
        {navSections.map((section) => (
          <div key={section.title} className="flex flex-col gap-1">
            <p className="px-3 mb-1 font-medium text-sm">{section.title}</p>
            <div className="flex flex-col">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    nativeButton={false}
                    render={
                      <Link
                        href={item.href}
                        onClick={onLinkClick}
                        data-active={isActive ? 'true' : undefined}
                      />
                    }
                    className={cn(
                      'justify-start w-full rounded-sm',
                      isActive ? 'bg-muted text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {item.title}
                  </Button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}
