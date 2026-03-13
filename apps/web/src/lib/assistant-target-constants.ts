export const TOC_PROMO_STORAGE_KEY = 'siws.toc-promo-target'

export const ASSISTANT_TARGET_IDS = ['markdown', 'chatgpt', 'v0', 'claude', 'cursor'] as const

export type AssistantTargetId = (typeof ASSISTANT_TARGET_IDS)[number]
