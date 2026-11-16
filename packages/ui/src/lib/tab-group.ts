"use client"

import { useCallback, useEffect, useState } from "react"

const groups = new Map<string, Set<(value: string) => void>>()

const storageKey = (groupId: string) => `carbon-tabs:${groupId}`

export function useTabGroup(defaultValue: string, groupId?: string, persist = false) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    if (!groupId) return

    if (persist) {
      try {
        const stored = localStorage.getItem(storageKey(groupId))
        if (stored) setValue(stored)
      } catch {}
    }

    let listeners = groups.get(groupId)
    if (!listeners) groups.set(groupId, (listeners = new Set()))
    listeners.add(setValue)

    return () => {
      listeners.delete(setValue)
      if (listeners.size === 0) groups.delete(groupId)
    }
  }, [groupId, persist])

  const onValueChange = useCallback(
    (next: string) => {
      setValue(next)
      if (!groupId) return

      if (persist) {
        try {
          localStorage.setItem(storageKey(groupId), next)
        } catch {}
      }

      for (const listener of groups.get(groupId) ?? []) {
        if (listener !== setValue) listener(next)
      }
    },
    [groupId, persist],
  )

  return [value, onValueChange] as const
}
