import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminSession } from '@/lib/auth/admin'

interface AllowlistBody {
  email?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

function isValidEmail(value: string): boolean {
  return emailPattern.test(value)
}

function mapSupabaseError(errorMessage: string): string {
  const lower = errorMessage.toLowerCase()
  if (lower.includes('schema cache')) {
    return 'Schema database non inizializzato: applicare migrazioni Supabase prima di usare la gestione utenti.'
  }
  return errorMessage
}

export async function POST(request: Request) {
  const adminSession = await getAdminSession()
  if (!adminSession) {
    return NextResponse.json({ data: null, error: 'Unauthorized', errorType: 'unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as AllowlistBody | null
  const email = normalizeEmail(body?.email ?? '')

  if (!email) {
    return NextResponse.json({ data: null, error: 'Email richiesta', errorType: 'validation' }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ data: null, error: 'Email non valida', errorType: 'validation' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('allowlist_entries')
    .upsert({ email, is_active: true }, { onConflict: 'email' })

  if (error) {
    return NextResponse.json(
      { data: null, error: mapSupabaseError(error.message), errorType: 'unknown' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    data: { message: 'Accesso autorizzato', email },
    error: null,
    errorType: null,
  })
}

export async function DELETE(request: Request) {
  const adminSession = await getAdminSession()
  if (!adminSession) {
    return NextResponse.json({ data: null, error: 'Unauthorized', errorType: 'unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as AllowlistBody | null
  const email = normalizeEmail(body?.email ?? '')

  if (!email) {
    return NextResponse.json({ data: null, error: 'Email richiesta', errorType: 'validation' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('allowlist_entries')
    .update({ is_active: false })
    .eq('email', email)

  if (error) {
    return NextResponse.json(
      { data: null, error: mapSupabaseError(error.message), errorType: 'unknown' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    data: { message: 'Accesso revocato', email },
    error: null,
    errorType: null,
  })
}
