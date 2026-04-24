/* Commento didattico:
 * Scopo del file: gestisce una API route: riceve richieste HTTP, valida i dati e restituisce una risposta al frontend.
 * Moduli richiamati: `next/server`, `@/lib/supabase/admin`, `@/lib/auth/admin`
 * Flusso: La route viene richiamata dal client (o da altre parti server), usa servizi/utilita` in `src/lib` e poi ritorna JSON/HTTP status.
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminSession } from '@/lib/auth/admin'

interface AllowlistBody {
  email?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Normalizza email per confronto/chiave univoca lato database.
 */
function normalizeEmail(value: string): string {
  // Normalizzazione unica per evitare duplicati (maiuscole/spazi) in DB.
  return value.trim().toLowerCase()
}

/**
 * Valida il formato base email lato API.
 */
function isValidEmail(value: string): boolean {
  return emailPattern.test(value)
}

/**
 * Mappa errori tecnici Supabase in messaggi piu` chiari per l'admin.
 */
function mapSupabaseError(errorMessage: string): string {
  // Traduce errori tecnici ricorrenti in messaggi comprensibili lato UI admin.
  const lower = errorMessage.toLowerCase()
  if (lower.includes('schema cache')) {
    return 'Schema database non inizializzato: applicare migrazioni Supabase prima di usare la gestione utenti.'
  }
  return errorMessage
}

/**
 * Aggiunge o riattiva una email in allowlist.
 */
export async function POST(request: Request) {
  // Protezione endpoint: solo super-admin con cookie valido puo autorizzare email.
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
  // Upsert su email: stessa API copre sia "nuova autorizzazione" sia "riattivazione".
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

/**
 * Revoca una email dall'allowlist (soft revoke con `is_active=false`).
 */
export async function DELETE(request: Request) {
  // Revoca soft: non cancelliamo il record, impostiamo `is_active = false`.
  // In questo modo rimane lo storico e si puo riattivare in seguito.
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
