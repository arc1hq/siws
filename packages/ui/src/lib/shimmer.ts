import * as stylex from "@stylexjs/stylex"

const sweep = stylex.keyframes({
  from: { backgroundPosition: "100% 0" },
  to: { backgroundPosition: "0 0" },
})

const spread = "var(--carbon-shimmer-spread, calc(3ch + 40px))"
const highlight =
  "var(--carbon-shimmer-color, light-dark(color-mix(in oklab, currentColor 20%, transparent), color-mix(in oklab, currentColor 40%, white)))"
const blend = `color-mix(in oklab, ${highlight}, currentColor 50%)`

const band = [
  `currentColor calc(50% - ${spread})`,
  `${blend} calc(50% - ${spread} * 0.5)`,
  `${highlight} 50%`,
  `${blend} calc(50% + ${spread} * 0.5)`,
  `currentColor calc(50% + ${spread})`,
].join(", ")

export const shimmerStyles = stylex.create({
  base: {
    backgroundImage: {
      default: `linear-gradient(calc(90deg + var(--carbon-shimmer-angle, 20deg)), ${band})`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    backgroundRepeat: "no-repeat",
    backgroundSize: `calc(200% + ${spread} * 2) 100%`,
    backgroundPosition: "0 0",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: {
      default: "transparent",
      "@media (prefers-reduced-motion: reduce)": "currentColor",
    },
    animationName: { default: sweep, "@media (prefers-reduced-motion: reduce)": "none" },
    animationDuration: "var(--carbon-shimmer-duration, 2s)",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  once: { animationIterationCount: 1 },
  reverse: { animationDirection: "reverse" },
  none: {
    backgroundImage: "none",
    WebkitTextFillColor: "currentColor",
    animationName: "none",
  },
})
