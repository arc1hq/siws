import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode, { type LineElement } from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'
import { defineCollection, defineConfig, s } from 'velite'
import { rehypeComponent } from './src/lib/rehype-component'

function getTextContent(node: any): string {
  if (node.type === 'text') return node.value || ''
  if (node.children) return node.children.map(getTextContent).join('')
  return ''
}

const collapsedCodeBlocks = new Set<string>()

const computedFields = <T extends { slug: string }>(data: T) => ({
  ...data,
  slugAsParams: data.slug.split('/').slice(1).join('/')
})

const docs = defineCollection({
  name: 'Docs',
  pattern: 'docs/**/*.mdx',
  schema: s
    .object({
      slug: s.path(),
      title: s.string().max(99),
      excerpt: s.string().max(999),
      date: s.isodate().optional(),
      published: s.boolean().default(true),
      body: s.mdx(),
      toc: s.toc(),
      showToc: s.boolean().default(true),
      tocMarkerVariant: s.enum(['auto', 'number', 'dot', 'none']).default('auto'),
      rank: s.number().default(0)
    })
    .transform(computedFields)
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true
  },
  collections: { docs },
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      rehypeComponent,
      [
        rehypePrettyCode,
        {
          theme: { dark: 'houston', light: 'github-light' },
          onVisitLine(node: LineElement) {
            if (node.children.length === 0) {
              node.children = [{ type: 'text', value: ' ' }]
            }
          },
          onVisitHighlightedLine(node: LineElement) {
            node.properties.className?.push('line--highlighted')
          },
          onVisitHighlightedWord(node: LineElement) {
            node.properties.className = ['word--highlighted']
          }
        }
      ],
      () => (tree) => {
        visit(tree, (node) => {
          if (node?.type !== 'element') return

          const isFigure =
            node.tagName === 'figure' && 'data-rehype-pretty-code-figure' in (node.properties || {})
          const isDiv =
            node.tagName === 'div' && 'data-rehype-pretty-code-fragment' in (node.properties || {})
          if (!isFigure && !isDiv) return

          const titleEls = node.children.filter(
            (child: any) =>
              child.type === 'element' &&
              'data-rehype-pretty-code-title' in (child.properties || {})
          )
          const preElements = node.children.filter(
            (child: any) => child.type === 'element' && child.tagName === 'pre'
          )

          const titleText = titleEls.length > 0 ? getTextContent(titleEls[0]) : undefined

          for (const preElement of preElements) {
            preElement.properties.__withMeta__ = titleEls.length > 0
            preElement.properties.__rawString__ = node.__rawString__
            if (titleText) preElement.properties.__title__ = titleText

            const codeEl = preElement.children?.find(
              (child: any) => child.type === 'element' && child.tagName === 'code'
            )
            if (codeEl) {
              const rawCode = getTextContent(codeEl).trim()
              if (collapsedCodeBlocks.has(rawCode)) {
                preElement.properties.__collapsed__ = 'true'
              }
            }

            if (node.__src__) preElement.properties.__src__ = node.__src__
            if (node.__event__) preElement.properties.__event__ = node.__event__
            if (node.__style__) preElement.properties.__style__ = node.__style__
          }
        })
      },
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ['subheading-anchor'],
            ariaLabel: 'Link to section'
          }
        }
      ]
    ],
    remarkPlugins: [
      remarkGfm,
      () => (tree: any) => {
        collapsedCodeBlocks.clear()
        visit(tree, 'code', (node: any) => {
          if (/\bcollapsed\b/.test(node.meta || '')) {
            collapsedCodeBlocks.add(node.value)
            node.meta = (node.meta || '').replace(/\bcollapsed(?:="[^"]*")?\s*/g, '').trim()
          }
        })
      }
    ]
  }
})
