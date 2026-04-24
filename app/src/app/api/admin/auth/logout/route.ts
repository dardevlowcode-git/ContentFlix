/* Commento didattico:
 * Scopo del file: gestisce una API route: riceve richieste HTTP, valida i dati e restituisce una risposta al frontend.
 * Moduli richiamati: `next/server`, `@/lib/auth/admin`
 * Flusso: La route viene richiamata dal client (o da altre parti server), usa servizi/utilita` in `src/lib` e poi ritorna JSON/HTTP status.
 */

import { NextResponse } from 'next/server'
import { adminSessionCookieName } from '@/lib/auth/admin'

/**
 * Invalida la sessione admin azzerando il cookie dedicato.
 */
export async function POST() {
  // Logout admin: si invalida il cookie impostando scadenza immediata (maxAge: 0).
  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: adminSessionCookieName,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}
