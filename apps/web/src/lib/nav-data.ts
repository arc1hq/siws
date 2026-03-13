export type NavItem = {
  href: string
  title: string
}

export type NavSection = {
  title: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { href: "/docs/what-is-siws", title: "What is SIWS?" },
      { href: "/docs/specification", title: "Specification" },
      { href: "/docs/installation", title: "Installation" },
    ],
  },
  {
    title: "Packages",
    items: [
      { href: "/docs/packages/core", title: "@siws/core" },
      { href: "/docs/packages/better-auth", title: "@siws/better-auth" },
    ],
  },
]

export function getFlatNavItems(): NavItem[] {
  return navSections.flatMap((section) => section.items)
}
