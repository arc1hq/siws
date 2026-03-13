import { docs } from "#site/content"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params
  const slugAsParams = slug.join("/")
  const doc = docs.find((d) => d.slugAsParams === slugAsParams)

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return new NextResponse(doc.raw, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  })
}
