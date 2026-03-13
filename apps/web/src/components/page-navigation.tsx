"use client"

import { Button } from "@siws/ui/shadcn/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { AdjacentPage } from "@/lib/get-adjacent-pages"

interface PageNavigationProps {
  prev: AdjacentPage
  next: AdjacentPage
}

export function PageNavigation({ prev, next }: PageNavigationProps) {
  return (
    <nav className="flex justify-between pt-6 mt-12">
      {prev ? (
        <Button
          variant="secondary"
          size="sm"
          className="border-0 gap-2"
          nativeButton={false}
          render={<Link href={prev.href} />}
        >
          <ArrowLeft className="size-3.5" />
          <span className="max-w-[200px] truncate">{prev.title}</span>
        </Button>
      ) : (
        <div />
      )}
      {next ? (
        <Button
          variant="secondary"
          size="sm"
          className="border-0 gap-2"
          nativeButton={false}
          render={<Link href={next.href} />}
        >
          <span className="max-w-[200px] truncate">{next.title}</span>
          <ArrowRight className="size-3.5" />
        </Button>
      ) : (
        <div />
      )}
    </nav>
  )
}
