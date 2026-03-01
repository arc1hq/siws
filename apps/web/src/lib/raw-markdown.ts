import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export async function readRawMdx(slugAsParams: string): Promise<string> {
  const filePath = join(process.cwd(), 'content', 'docs', `${slugAsParams}.mdx`)
  try {
    const content = await readFile(filePath, 'utf-8')
    // Strip frontmatter
    const match = content.match(/^---[\s\S]*?---\n(.*)$/s)
    return match?.[1]?.trim() ?? content.trim()
  } catch {
    return ''
  }
}
