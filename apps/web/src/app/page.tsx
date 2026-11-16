import * as stylex from "@stylexjs/stylex"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { HomeShell, PackageLink, homeStyles as s } from "@/components/home/home-page"
import { MessageSpecimen } from "@/components/home/message-specimen"
import { InstallCommand } from "@/components/install-command"
import { LinkButton } from "@/components/link-button"
import { siteConfig } from "@/lib/site"

export default function Home() {
  return (
    <HomeShell>
      <section {...stylex.props(s.intro)}>
        <h1 {...stylex.props(s.title)}>Sign in with Solana</h1>
        <p {...stylex.props(s.lede)}>
          A standard for authenticating users with Solana wallets. One signature over a message people can
          read, no transaction.
        </p>
        <div {...stylex.props(s.actions)}>
          <LinkButton href="/docs/what-is-siws" size="sm" iconPosition="end">
            Get started
            <ArrowRightIcon aria-hidden />
          </LinkButton>
          <LinkButton href="/docs/specification" size="sm" variant="ghost">
            Specification
          </LinkButton>
        </div>
      </section>

      <MessageSpecimen />

      <InstallCommand />

      <nav aria-label="Packages" {...stylex.props(s.packages)}>
        <PackageLink href="/docs/packages/core" name="@siws/core">
          Message building, parsing and verification.
        </PackageLink>
        <PackageLink href="/docs/packages/better-auth" name="@siws/better-auth">
          Drop-in better-auth plugin.
        </PackageLink>
      </nav>

      <footer {...stylex.props(s.foot)}>
        <span>MIT</span>
        <span>v{siteConfig.version}</span>
      </footer>
    </HomeShell>
  )
}
