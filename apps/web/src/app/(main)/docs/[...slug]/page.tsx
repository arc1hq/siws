import { notFound } from "next/navigation"
import * as stylex from "@stylexjs/stylex"
import { withClass } from "@/lib/with-class"
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple"
import { breakpoints } from "@ui/theme/breakpoints.stylex"
import { color, font, leading, space, text, tracking } from "@ui/theme/tokens.stylex"
import { docs } from "#site/content"
import { DocsPager } from "@/components/docs/pager"
import { InstallCard } from "@/components/docs/install-card"
import { PageActions } from "@/components/docs/page-actions"
import { DocsToc } from "@/components/docs/toc"
import { MDXContentRenderer } from "@/components/mdx/renderer"
import { getAdjacentPages } from "@/lib/get-adjacent-pages"
import { siteConfig } from "@/lib/site"
import { shell } from "@/styles/shell.stylex"

const styles = stylex.create({
  frame: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr)", [breakpoints.xl]: "minmax(0, 1fr) 15rem" },
    columnGap: space.s12,
    maxWidth: "70rem",
    marginInline: "auto",
    paddingInline: { default: space.s5, [breakpoints.md]: space.s10 },
    paddingBlockStart: { default: space.s8, [breakpoints.md]: space.s12 },
    paddingBlockEnd: space.s16,
  },
  article: { minWidth: 0, maxWidth: "46rem", width: "100%", marginInline: "auto" },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: space.s3,
    paddingBlockEnd: space.s8,
    marginBlockEnd: space.s8,
    borderBlockEndWidth: 1,
    borderBlockEndStyle: "solid",
  },
  titleRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.s4,
    flexWrap: { default: "wrap-reverse", [breakpoints.md]: "nowrap" },
  },
  actions: {
    flexShrink: 0,
    marginBlockStart: { default: 0, [breakpoints.md]: space.s1 },
    marginInlineStart: "auto",
  },
  title: {
    minWidth: 0,
    fontSize: { default: text.xl3, [breakpoints.md]: text.xl4 },
    lineHeight: { default: leading.xl3, [breakpoints.md]: leading.xl4 },
    fontWeight: 600,
    letterSpacing: tracking.tight,
    textWrap: "balance",
  },
  titleMono: { fontFamily: font.mono, letterSpacing: "-0.04em" },
  excerpt: {
    maxWidth: "40rem",
    fontSize: text.base,
    lineHeight: leading.base,
    color: color.mutedForeground,
    textWrap: "pretty",
  },
  aside: { display: { default: "none", [breakpoints.xl]: "block" } },
  sticky: {
    position: "sticky",
    top: `calc(${shell.headerHeight} + ${space.s12})`,
    display: "flex",
    flexDirection: "column",
    gap: space.s8,
    maxHeight: `calc(100svh - ${shell.headerHeight} - ${space.s16})`,
    overflowY: "auto",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.s4,
    flexWrap: "wrap",
    marginBlockStart: space.s10,
    paddingBlockStart: space.s5,
    borderBlockStartWidth: 1,
    borderBlockStartStyle: "solid",
    fontSize: text.xs,
    lineHeight: leading.xs,
    color: color.mutedForeground,
  },
  edit: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.s1_5,
    color: { default: color.mutedForeground, ":hover": color.foreground },
  },
  editIcon: { width: space.s3_5, height: space.s3_5 },
  footLink: {
    color: { default: color.mutedForeground, ":hover": color.foreground },
    textDecorationLine: { default: "none", ":hover": "underline" },
    textUnderlineOffset: "3px",
  },
})

function getDoc(slugParts: string[]) {
  const slug = slugParts.join("/")
  return docs.find((doc) => doc.slugAsParams === slug)
}

export async function generateStaticParams() {
  return docs.map((doc) => ({ slug: doc.slugAsParams.split("/") }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const doc = getDoc(slug)
  if (!doc) return {}
  return { title: doc.title, description: doc.excerpt }
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const doc = getDoc(slug)
  if (!doc || !doc.published) notFound()

  const href = `/docs/${doc.slugAsParams}`
  const { prev, next } = getAdjacentPages(href)
  const editPath = `apps/web/content/docs/${doc.slugAsParams}.mdx`

  return (
    <div {...stylex.props(styles.frame)}>
      <article {...stylex.props(styles.article)}>
        <header {...stylex.props(styles.header)}>
          <div {...stylex.props(styles.titleRow)}>
            <h1 {...stylex.props(styles.title, doc.title.startsWith("@") && styles.titleMono)}>{doc.title}</h1>
            <div {...stylex.props(styles.actions)}>
              <PageActions markdownHref={`${href}.md`} prev={prev} next={next} />
            </div>
          </div>
          {doc.excerpt && <p {...stylex.props(styles.excerpt)}>{doc.excerpt}</p>}
        </header>

        <div className="typeset typeset-docs">
          <MDXContentRenderer code={doc.body} />
        </div>

        <DocsPager prev={prev} next={next} />

        <footer {...stylex.props(styles.footer)}>
          <a
            href={`${siteConfig.links.github}/edit/main/${editPath}`}
            target="_blank"
            rel="noopener noreferrer"
            {...stylex.props(styles.edit)}
          >
            <PencilSimpleIcon aria-hidden {...stylex.props(styles.editIcon)} />
            Edit this page on GitHub
          </a>
          <span>
            <a href={siteConfig.links.license} target="_blank" rel="noopener noreferrer" {...stylex.props(styles.footLink)}>
              MIT
            </a>
            {" · "}
            <a href={siteConfig.links.release} target="_blank" rel="noopener noreferrer" {...stylex.props(styles.footLink)}>
              v{siteConfig.version}
            </a>
          </span>
        </footer>
      </article>

      <aside {...stylex.props(styles.aside)}>
        <div {...withClass("no-scrollbar", styles.sticky)}>
          {doc.showToc && doc.toc.length > 0 && <DocsToc toc={doc.toc} />}
          <InstallCard />
        </div>
      </aside>
    </div>
  )
}
