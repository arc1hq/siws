import { SidebarContent } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh overflow-hidden p-(--gutter) box-border bg-doc-background dark:bg-background">
      <div className="h-full min-w-0 overflow-hidden lg:rounded-xl border bg-background dark:bg-doc-background flex flex-col">
        <header className="shrink-0 w-full bg-background dark:bg-doc-background z-50 flex items-center">
          <Navbar />
        </header>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside className="relative z-30 hidden h-full w-(--sidebar-width) shrink-0 overflow-y-auto md:block border-r border-grid no-scrollbar">
            <SidebarContent />
          </aside>
          <main className="h-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
