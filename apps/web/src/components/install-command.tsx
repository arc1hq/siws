"use client"

import type { StyleXStyles } from "@stylexjs/stylex"
import { CodeBlock, CodeBlockTab, CodeBlockTabs, Pre } from "@ui/base/code-block"

const managers = [
  { value: "npm", rest: "install" },
  { value: "pnpm", rest: "add" },
  { value: "yarn", rest: "add" },
  { value: "bun", rest: "add" },
] as const

export function InstallCommand({
  package: pkg = "@siws/core",
  xstyle,
}: {
  package?: string
  xstyle?: StyleXStyles
}) {
  return (
    <CodeBlockTabs defaultValue="npm" groupId="package-manager" persist xstyle={xstyle}>
      {managers.map((manager) => (
        <CodeBlockTab key={manager.value} value={manager.value} prefix={manager.value}>
          <CodeBlock className="highlights" data-line-numbers={false}>
            <Pre>
              <code>
                <span className="line">
                  <span>{manager.value}</span>
                  <span>{` ${manager.rest} ${pkg}`}</span>
                </span>
              </code>
            </Pre>
          </CodeBlock>
        </CodeBlockTab>
      ))}
    </CodeBlockTabs>
  )
}
