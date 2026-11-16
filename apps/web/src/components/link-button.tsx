"use client"

import type { ComponentProps } from "react"
import Link from "next/link"
import { Button } from "@ui/base/button"

type LinkButtonProps = Omit<ComponentProps<typeof Button>, "render" | "nativeButton"> & {
  href: string
  external?: boolean
}

export function LinkButton({ href, external, ...props }: LinkButtonProps) {
  return (
    <Button
      nativeButton={false}
      render={
        external ? <a href={href} target="_blank" rel="noopener noreferrer" /> : <Link href={href} />
      }
      {...props}
    />
  )
}
