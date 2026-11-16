import * as stylex from "@stylexjs/stylex"
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft"
import { HomeShell, homeStyles as s } from "@/components/home/home-page"
import { LinkButton } from "@/components/link-button"

export default function NotFound() {
  return (
    <HomeShell>
      <section {...stylex.props(s.intro)}>
        <h1 {...stylex.props(s.title)}>Page not found</h1>
        <p {...stylex.props(s.lede)}>The page you’re looking for doesn’t exist or has moved.</p>
        <div {...stylex.props(s.actions)}>
          <LinkButton href="/" size="sm" iconPosition="start">
            <ArrowLeftIcon aria-hidden />
            Home
          </LinkButton>
          <LinkButton href="/docs/what-is-siws" size="sm" variant="ghost">
            Documentation
          </LinkButton>
        </div>
      </section>
    </HomeShell>
  )
}
