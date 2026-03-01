'use client'

import { Button } from '@siws/ui/shadcn/button'
import { cn } from '@siws/ui/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MobileNav } from './mobile'
import { ThemeToggler } from '@/components/theme/toggler'
import { CommandMenu } from '@/components/command-menu'

const navConfig = [
  { label: 'Docs', href: '/docs' },
  { label: 'Packages', href: '/docs/packages' },
]

export function Navbar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (!pathname) return false
    if (href === '/docs/packages') return pathname.startsWith('/docs/packages')
    if (href === '/docs') return pathname.startsWith('/docs') && !pathname.startsWith('/docs/packages')
    return pathname.startsWith(href)
  }

  return (
    <nav className="flex items-center w-full h-(--header-height) border-b border-grid">
      <div className="hidden md:flex items-center shrink-0 w-(--sidebar-width) px-4 h-full border-r border-grid text-sm font-semibold">
        SIWS
      </div>
      <MobileNav />
      <div className="hidden md:flex items-center pl-3">
        {navConfig.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href={item.href} />}
            className={cn(
              'rounded-sm text-sm',
              isActive(item.href) ? 'bg-muted text-foreground' : 'text-muted-foreground'
            )}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2 pr-3">
        <CommandMenu />
        <ThemeToggler />
      </div>
    </nav>
  )
}
