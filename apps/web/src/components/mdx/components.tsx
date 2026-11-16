import { Children, isValidElement, type ComponentProps, type ReactNode } from "react"
import Link from "next/link"
import { CodeBlock, Pre } from "@ui/base/code-block"
import { InstallCommand } from "@/components/install-command"

type PreProps = ComponentProps<"pre"> & {
  __title__?: string
  __rawString__?: string
  __withMeta__?: boolean
  __collapsed__?: string
  __src__?: string
  __event__?: string
  __style__?: string
  "data-theme"?: string
  "data-language"?: string
}

const plain = new Set(["txt", "text", "plaintext", "bash", "sh", "shell", "zsh"])

function Figure({ children, ...props }: ComponentProps<"figure">) {
  if (!("data-rehype-pretty-code-figure" in props)) return <figure {...props}>{children}</figure>
  return (
    <>
      {Children.toArray(children).filter(
        (child) =>
          !(isValidElement<Record<string, unknown>>(child) && "data-rehype-pretty-code-title" in child.props),
      )}
    </>
  )
}

function MDXPre({
  ref: _ref,
  tabIndex: _tabIndex,
  __title__: title,
  __rawString__: _raw,
  __withMeta__: _withMeta,
  __collapsed__: _collapsed,
  __src__: _src,
  __event__: _event,
  __style__: _style,
  "data-theme": _theme,
  "data-language": language,
  className: _className,
  style: _inlineStyle,
  children,
  ...props
}: PreProps) {
  return (
    <CodeBlock
      title={title}
      className="highlights"
      data-language={language}
      data-line-numbers={!plain.has(language ?? "")}
    >
      <Pre {...props}>{children}</Pre>
    </CodeBlock>
  )
}

function Anchor({ href = "", children, ...props }: ComponentProps<"a">) {
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  )
}

function Steps({ children }: { children?: ReactNode }) {
  return <div className="mdx-steps">{children}</div>
}

function Installation({ package: pkg }: { package?: string; className?: string }) {
  return <InstallCommand package={pkg} />
}

export const mdxComponents = {
  a: Anchor,
  pre: MDXPre,
  figure: Figure,
  Steps,
  Installation,
}
