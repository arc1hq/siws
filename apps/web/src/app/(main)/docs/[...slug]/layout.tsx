export default function SlugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full max-w-6xl mx-auto scroll-mt-24 items-stretch pb-8">
      {children}
    </div>
  )
}
