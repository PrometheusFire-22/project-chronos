import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.INGESTION_WORKER_URL || 'http://localhost:8000'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json(
      { error: 'Only PDF files are supported' },
      { status: 415 }
    )
  }

  // TODO: Check auth session + usage limits (CHRONOS-544)

  // Proxy to Python backend
  const backendForm = new FormData()
  backendForm.append('file', file)

  try {
    const response = await fetch(`${BACKEND_URL}/api/extract-contacts`, {
      method: 'POST',
      body: backendForm,
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: 'Processing failed', details: error },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Backend unavailable. Please try again.' },
      { status: 504 }
    )
  }
}
