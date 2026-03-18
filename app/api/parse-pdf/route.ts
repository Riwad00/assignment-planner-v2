// app/api/parse-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDocumentProxy, extractText } from 'unpdf'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const pdf = await getDocumentProxy(buffer)
    const { totalPages, text } = await extractText(pdf, { mergePages: true })
    pdf.destroy()

    return NextResponse.json({
      text: (text as string).slice(0, 25000),
      pages: totalPages,
    })
  } catch (err) {
    console.error('[parse-pdf]', err)
    return NextResponse.json(
      { error: 'Failed to parse PDF' },
      { status: 500 }
    )
  }
}
