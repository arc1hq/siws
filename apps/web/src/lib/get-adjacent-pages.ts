import { getFlatNavItems } from './nav-data'

export type AdjacentPage = { title: string; href: string } | null

export function getAdjacentPages(currentPath: string): {
  prev: AdjacentPage
  next: AdjacentPage
} {
  const items = getFlatNavItems()
  const index = items.findIndex((item) => item.href === currentPath)

  if (index === -1) {
    return { prev: null, next: null }
  }

  return {
    prev: index > 0 ? (items[index - 1] ?? null) : null,
    next: index < items.length - 1 ? (items[index + 1] ?? null) : null,
  }
}
