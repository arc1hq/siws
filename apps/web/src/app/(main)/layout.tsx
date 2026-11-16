import * as stylex from "@stylexjs/stylex"
import { withClass } from "@/lib/with-class"
import { breakpoints } from "@ui/theme/breakpoints.stylex"
import { space } from "@ui/theme/tokens.stylex"
import { SidebarNav } from "@/components/docs/sidebar-nav"
import { SiteHeader } from "@/components/site-header"
import { getSearchPages } from "@/lib/search"
import { shell, shellLayer } from "@/styles/shell.stylex"

const styles = stylex.create({
  rail: {
    display: { default: "none", [breakpoints.md]: "block" },
    position: "fixed",
    top: shell.headerHeight,
    bottom: 0,
    insetInlineStart: 0,
    zIndex: shellLayer.rail,
    width: shell.sidebarWidth,
    overflowY: "auto",
    paddingBlock: space.s6,
    paddingInline: space.s3,
    borderInlineEndWidth: 1,
    borderInlineEndStyle: "solid",
  },
  main: {
    minWidth: 0,
    paddingTop: shell.headerHeight,
    paddingInlineStart: { default: 0, [breakpoints.md]: shell.sidebarWidth },
  },
})

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader pages={getSearchPages()} />
      <aside {...withClass("no-scrollbar", styles.rail)}>
        <SidebarNav />
      </aside>
      <main {...stylex.props(styles.main)}>{children}</main>
    </>
  )
}
