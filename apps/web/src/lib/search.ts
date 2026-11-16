import { docs } from "#site/content"
import { navSections } from "./nav-data"

export type SearchHeading = { title: string; href: string }
export type SearchPage = {
  title: string
  href: string
  section: string
  excerpt: string
  headings: SearchHeading[]
}

type TocEntry = { title: string; url: string; items?: TocEntry[] }

function flatten(entries: TocEntry[], href: string): SearchHeading[] {
  return entries.flatMap((entry) => [
    { title: entry.title, href: `${href}${entry.url}` },
    ...flatten(entry.items ?? [], href),
  ])
}

export function getSearchPages(): SearchPage[] {
  return navSections.flatMap((section) =>
    section.items.flatMap((item) => {
      const doc = docs.find((d) => `/docs/${d.slugAsParams}` === item.href)
      if (!doc) return []
      return [
        {
          title: item.title,
          href: item.href,
          section: section.title,
          excerpt: doc.excerpt,
          headings: flatten(doc.toc as TocEntry[], item.href),
        },
      ]
    }),
  )
}
