"use client"

import * as stylex from "@stylexjs/stylex"
import { MonitorIcon } from "@phosphor-icons/react/dist/csr/Monitor"
import { MoonIcon } from "@phosphor-icons/react/dist/csr/Moon"
import { SunIcon } from "@phosphor-icons/react/dist/csr/Sun"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@ui/base/button"
import { duration, ease, space } from "@ui/theme/tokens.stylex"

const styles = stylex.create({
  trigger: { position: "relative" },
  glyph: {
    width: space.s4,
    height: space.s4,
    transitionProperty: "transform",
    transitionDuration: { default: duration.color, "@media (prefers-reduced-motion: reduce)": "0s" },
    transitionTimingFunction: ease.standard,
  },
  stacked: { position: "absolute" },
  shown: { transform: "scale(1) rotate(0deg)" },
  hidden: { transform: "scale(0) rotate(90deg)" },
})

type Mode = "light" | "dark" | "system"

const nextMode: Record<Mode, Mode> = { light: "dark", dark: "system", system: "light" }
const labels: Record<Mode, string> = { light: "Light", dark: "Dark", system: "System" }

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const current: Mode = mounted && (theme === "light" || theme === "dark") ? theme : "system"
  const glyph = (mode: Mode, stacked: boolean) =>
    stylex.props(styles.glyph, stacked && styles.stacked, current === mode ? styles.shown : styles.hidden)
  const next = nextMode[current]

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`Theme: ${labels[current]}. Switch to ${labels[next]}`}
      title={`Theme: ${labels[current]}`}
      onClick={() => setTheme(next)}
      xstyle={styles.trigger}
    >
      <SunIcon aria-hidden {...glyph("light", false)} />
      <MoonIcon aria-hidden {...glyph("dark", true)} />
      <MonitorIcon aria-hidden {...glyph("system", true)} />
    </Button>
  )
}
