"use client"

import { Check, Copy, Terminal } from "lucide-react"
import { Button } from "@siws/ui/shadcn/button"
import { useEffect, useState } from "react"
import { cn } from "@ui/lib/utils"
import {
  LOCAL_STORAGE_KEY,
  packageManagers,
  getInstallCommand,
} from "@/lib/package-manager"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@siws/ui/shadcn/tooltip"

const DEFAULT_PM = "pnpm"

export default function Installation({
  package: pkg = "@siws/core",
  className,
}: {
  package?: string
  className?: string
}) {
  const [packageManager, setPackageManager] = useState<string>(DEFAULT_PM)

  useEffect(() => {
    const pm = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (pm && (packageManagers as readonly string[]).includes(pm)) {
      setPackageManager(pm)
    }
  }, [])

  const [isCopied, setIsCopied] = useState<boolean>(false)

  const handleClick = (pm: string) => {
    setPackageManager(pm)
    localStorage.setItem(LOCAL_STORAGE_KEY, pm)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getInstallCommand(packageManager, pkg))
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  return (
    <div className={cn("rounded-md bg-muted", className)}>
      <div className="flex items-center justify-between border-b border-border/50 p-2.5">
        <div className="flex items-center gap-2">
          <div className="flex size-3.5 items-center justify-center bg-foreground/80">
            <Terminal className="size-2.5 text-muted" />
          </div>
          {packageManagers.map((pm) => (
            <Button
              key={pm}
              variant="ghost"
              size="sm"
              className={cn(
                "h-auto w-auto cursor-pointer rounded border border-transparent px-1 py-0.5 font-mono text-xs text-muted-foreground",
                packageManager === pm && "border-foreground/20 text-foreground",
              )}
              onClick={() => handleClick(pm)}
            >
              {pm}
            </Button>
          ))}
        </div>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="sm"
                variant="ghost"
                className="size-4 cursor-pointer p-0"
                onClick={handleCopy}
              />
            }
          >
            {isCopied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Copy</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="py-2.5 pl-3 text-left">
        <pre
          className="overflow-x-scroll font-mono text-sm"
          style={{ scrollbarWidth: "none" }}
        >
          <code>{getInstallCommand(packageManager, pkg)}</code>
        </pre>
      </div>
    </div>
  )
}
