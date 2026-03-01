'use client'

import { cn } from '@ui/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/shadcn/tooltip'
import { Check, Copy } from 'lucide-react'
import React, { useState } from 'react'

export const CopyButton = ({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) => {
  const [isCopied, setIsCopied] = useState(false)

  const copy = async () => {
    const sourceCode = extractSourceCode(children)
    await navigator.clipboard.writeText(sourceCode)
    setIsCopied(true)

    setTimeout(() => {
      setIsCopied(false)
    }, 3000)
  }

  const extractSourceCode = (node: React.ReactNode): string => {
    if (typeof node === 'string') {
      return node
    }
    if (Array.isArray(node)) {
      return node.map(extractSourceCode).join('')
    }
    if (React.isValidElement(node)) {
      const { props } = node
      // @ts-expect-error
      const children = React.Children.map(props.children, extractSourceCode)?.join('')
      return `${children}`
    }
    return ''
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            disabled={isCopied}
            onClick={copy}
            className={cn('text-muted-foreground cursor-pointer [&_svg]:size-4', className)}
            type="button"
          />
        }
      >
        {isCopied ? <Check strokeWidth={1.5} /> : <Copy strokeWidth={1.5} />}
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>
        {isCopied ? 'Copied' : 'Copy'}
      </TooltipContent>
    </Tooltip>
  )
}
