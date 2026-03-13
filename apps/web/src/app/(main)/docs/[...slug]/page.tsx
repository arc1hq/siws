import { docs } from '#site/content'
import { MDXContentRenderer } from '@/components/mdx/renderer'
import { TableOfContents } from '@/components/mdx/toc'
import { PageFooter } from '@/components/page-footer'
import { PageHeader } from '@/components/page-header'
import { PageNavigation } from '@/components/page-navigation'
import { TocPromoCard } from '@/components/toc-promo-card'
import { getAdjacentPages } from '@/lib/get-adjacent-pages'
import { notFound } from 'next/navigation'

async function getDocFromParams(slugParts: string[]) {
  const slug = slugParts.join('/')
  return docs.find((doc) => doc.slugAsParams === slug)
}

export async function generateStaticParams() {
  return docs.map((doc) => ({ slug: doc.slugAsParams.split('/') }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const doc = await getDocFromParams(slug)
  if (!doc) return {}
  return { title: doc.title, description: doc.excerpt }
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const doc = await getDocFromParams(slug)

  if (!doc || !doc.published) {
    notFound()
  }

  const currentPath = `/docs/${doc.slugAsParams}`
  const { prev, next } = getAdjacentPages(currentPath)
  const editPath = `apps/web/content/docs/${doc.slugAsParams}.mdx`

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col gap-6 px-4 py-6 md:px-0 lg:py-10">
          <PageHeader
            title={doc.title}
            excerpt={doc.excerpt}
            rawContent={doc.raw}
            prev={prev}
            next={next}
            markdownHref={`/docs/${doc.slugAsParams}.md`}
          />
          <MDXContentRenderer code={doc.body} />
          <PageNavigation prev={prev} next={next} />
          <PageFooter editPath={editPath} />
        </div>
      </div>
      <aside className="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[calc(100svh-var(--header-height)-2rem)] w-(--sidebar-width) flex-col gap-8 overflow-x-hidden overflow-y-auto overscroll-none pb-8 px-3 pt-6 lg:pt-10 xl:flex">
        {doc.showToc && doc.toc.length > 0 && (
          <TableOfContents toc={doc.toc} markerVariant={doc.tocMarkerVariant} size='sm' />
        )}
        <TocPromoCard />
      </aside>
    </>
  )
}
