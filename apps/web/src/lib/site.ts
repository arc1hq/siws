export const siteConfig = {
  name: "SIWS",
  title: "SIWS - Sign In With Solana",
  description:
    "A standard for authenticating users with Solana wallets. Simple, secure, and open-source.",
  url: "https://osiws.com",
  ogImage: "https://osiws.com/og.png",
  version: "0.2.0",
  keywords: [
    "solana",
    "authentication",
    "sign-in",
    "siws",
    "wallet",
    "web3",
    "ed25519",
    "signature",
    "blockchain",
  ] as string[],
  links: {
    github: "https://github.com/arc1hq/siws",
    x: "https://x.com/rds_agi",
    npm: "https://www.npmjs.com/org/siws",
    license: "https://github.com/arc1hq/siws/blob/main/LICENSE",
    release: "https://www.npmjs.com/package/@siws/core/v/0.2.0",
  },
} as const

export const primaryNav = [
  { label: "Docs", href: "/docs/what-is-siws", match: (p: string) => p.startsWith("/docs") && !p.startsWith("/docs/specification") && !p.startsWith("/docs/packages") },
  { label: "Specification", href: "/docs/specification", match: (p: string) => p.startsWith("/docs/specification") },
  { label: "Packages", href: "/docs/packages/core", match: (p: string) => p.startsWith("/docs/packages") },
] as const
