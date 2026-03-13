import { ASSISTANT_TARGET_IDS } from './assistant-target-constants'
import ChatGPTIcon from '@siws/icons/ChatGPTIcon';
import MarkdownIcon from '@siws/icons/MarkdownIcon';
import ClaudeIcon from '@siws/icons/ClaudeIcon';
import CursorIcon from '@siws/icons/CursorIcon';
import { LucideProps } from 'lucide-react';

type AssistantTargetDefinition = {
  id: string
  label: string
  Icon: React.ComponentType<LucideProps>
  external: boolean
  buildHref: (args: { encoded: string; markdownHref?: string }) => string | null
}

export type AssistantTargetOption = {
  id: string
  label: string
  Icon: React.ComponentType<LucideProps>
  external: boolean
  href: string
}

const TARGET_DEFINITIONS: AssistantTargetDefinition[] = [
  {
    id: 'markdown',
    label: 'View as Markdown',
    Icon: MarkdownIcon,
    external: true,
    buildHref: ({ markdownHref }) => markdownHref ?? null,
  },
  {
    id: 'chatgpt',
    label: 'Open with ChatGPT',
    Icon: ChatGPTIcon,
    external: true,
    buildHref: ({ encoded }) => `https://chat.openai.com/?q=${encoded}`,
  },
  {
    id: 'claude',
    label: 'Open with Claude',
    Icon: ClaudeIcon,
    external: true,
    buildHref: ({ encoded }) => `https://claude.ai/new?q=${encoded}`,
  },
  {
    id: 'cursor',
    label: 'Open with Cursor',
    Icon: CursorIcon,
    external: false,
    buildHref: ({ encoded }) => `cursor://anysphere.cursor-deeplink/prompt?text=${encoded}`,
  },
]

export function parseStoredAssistantTarget(value: string | null): string | null {
  if (!value) return null
  return (ASSISTANT_TARGET_IDS as readonly string[]).includes(value) ? value : null
}

export function getAssistantTargetLabelSuffix(label: string): string {
  const withIndex = label.lastIndexOf(' with ')
  if (withIndex !== -1) return label.slice(withIndex + 6)
  const asIndex = label.lastIndexOf(' as ')
  if (asIndex !== -1) return label.slice(asIndex + 4)
  return label
}

export function buildEncodedAssistantContext(rawContent?: string) {
  return encodeURIComponent(`${rawContent ?? ''}\n\n`)
}

export function getAssistantTargets({
  encoded,
  markdownHref,
  includeMarkdown,
}: {
  encoded: string
  markdownHref?: string
  includeMarkdown: boolean
}): AssistantTargetOption[] {
  return TARGET_DEFINITIONS.filter((item) => includeMarkdown || item.id !== 'markdown')
    .map((item) => {
      const href = item.buildHref({ encoded, markdownHref })
      if (!href && !(includeMarkdown && item.id === 'markdown')) return null
      return {
        id: item.id,
        label: item.label,
        Icon: item.Icon,
        external: item.external,
        href: href ?? '',
      }
    })
    .filter((item): item is AssistantTargetOption => Boolean(item))
}
