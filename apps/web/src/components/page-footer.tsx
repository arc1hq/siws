import Link from 'next/link'

const GITHUB_REPO = 'https://github.com/osiws/siws'

const linkGroups = [
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs/introduction' },
      { label: 'GitHub', href: GITHUB_REPO, external: true },
    ],
  },
  {
    title: 'Packages',
    links: [
      { label: '@siws/core', href: 'https://www.npmjs.com/package/@siws/core', external: true },
      { label: '@siws/better-auth', href: 'https://www.npmjs.com/package/@siws/better-auth', external: true },
    ],
  },
]

export function PageFooter({ editPath }: { editPath?: string }) {
  return (
    <footer className="border-t border-border mt-12 pt-8 pb-12">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">SIWS</p>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} osiws contributors. All rights reserved.
          </p>
        </div>
        <div className="flex gap-12">
          {linkGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">{group.title}</p>
              {group.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      {editPath && (
        <div className="mt-8 pt-4 border-t border-border">
          <Link
            href={`${GITHUB_REPO}/edit/main/${editPath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Edit this page on GitHub
          </Link>
        </div>
      )}
    </footer>
  )
}
