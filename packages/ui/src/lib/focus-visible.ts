"use client"

import { useState, type FocusEvent } from "react"

type FocusHandlers<Event> = {
  onFocus?: (event: Event) => void
  onBlur?: (event: Event) => void
}

export function useFocusVisible<Event extends FocusEvent<Element>>({
  onFocus,
  onBlur,
}: FocusHandlers<Event> = {}) {
  const [focusVisible, setFocusVisible] = useState(false)
  const focusProps = {
    onFocus: (event: Event) => {
      onFocus?.(event)
      setFocusVisible(event.target.matches(":focus-visible"))
    },
    onBlur: (event: Event) => {
      onBlur?.(event)
      setFocusVisible(false)
    },
  }
  return { focusVisible, setFocusVisible, focusProps }
}
