import type { Node } from "unist"

/**
 * No-op rehype component plugin.
 * The SIWS docs site does not use component previews.
 */
export function rehypeComponent() {
  return (_tree: Node) => {}
}
