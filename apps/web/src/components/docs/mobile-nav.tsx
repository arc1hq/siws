"use client"

import { useState } from "react"
import Link from "next/link"
import * as stylex from "@stylexjs/stylex"
import { ListIcon } from "@phosphor-icons/react/dist/csr/List"
import { Button } from "@ui/base/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@ui/base/sheet"
import { color, leading, radius, space, text } from "@ui/theme/tokens.stylex"
import { visibility } from "@ui/theme/visibility"
import { BrandMark } from "@/components/brand"
import { SidebarNav } from "@/components/docs/sidebar-nav"
import { primaryNav } from "@/lib/site"

const styles = stylex.create({
  content: { width: "18rem", gap: 0 },
  header: {
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    gap: space.s2,
    paddingBlock: space.s4,
    paddingInline: space.s5,
    borderBlockEndWidth: 1,
    borderBlockEndStyle: "solid",
  },
  title: { fontSize: text.base, lineHeight: leading.base, fontWeight: 600 },
  body: { overflowY: "auto", paddingBlock: space.s4, paddingInline: space.s2 },
  primary: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: space.s1,
    marginBlockEnd: space.s5,
    paddingInline: space.s1,
  },
  chip: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: space.s8,
    borderRadius: radius.md,
    backgroundColor: color.muted,
    fontSize: text.xs,
    lineHeight: leading.xs,
    fontWeight: 500,
  },
})

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Open navigation"
            xstyle={visibility.inlineFlexBelowMd}
          />
        }
      >
        <ListIcon aria-hidden />
      </SheetTrigger>
      <SheetContent side="left" xstyle={styles.content}>
        <SheetHeader xstyle={styles.header}>
          <BrandMark />
          <SheetTitle xstyle={styles.title}>siws</SheetTitle>
        </SheetHeader>
        <div {...stylex.props(styles.body)}>
          <div {...stylex.props(styles.primary)}>
            {primaryNav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} {...stylex.props(styles.chip)}>
                {item.label}
              </Link>
            ))}
          </div>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
