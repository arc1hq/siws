import { readRawMdx } from '@/lib/raw-markdown'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params
  const slugAsParams = slug.join('/')
  const content = await readRawMdx(slugAsParams)

  if (!content) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  })
}
