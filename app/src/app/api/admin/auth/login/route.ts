/* Commento didattico:
 * Scopo del file: gestisce una API route: riceve richieste HTTP, valida i dati e restituisce una risposta al frontend.
 * Moduli richiamati: `next/server`
 * Flusso: La route viene richiamata dal client (o da altre parti server), usa servizi/utilita` in `src/lib` e poi ritorna JSON/HTTP status.
 */

import { NextResponse } from 'next/server'
import {
  adminSessionCookieName,
  buildAdminSessionCookieValue,
  getAdminSessionMaxAge,
  verifySuperAdminCredentials,
} from '@/lib/auth/admin'

interface LoginBody {
  username?: string
  password?: string
}

/**
 * Esegue login super-admin e imposta cookie sessione HttpOnly firmato.
 */
export async function POST(request: Request) {
  // Parsing difensivo: evita eccezioni runtime se il client invia JSON non valido.
  let body: LoginBody
  try {
    body = (await request.json()) as LoginBody
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const username = body.username?.trim() ?? ''
  const password = body.password ?? ''

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
  }

  // Verifica credenziali tramite modulo centralizzato (`lib/auth/admin.ts`).
  const isValid = verifySuperAdminCredentials(username, password)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Se valido, emette cookie HttpOnly firmato usato poi dal middleware su `/admin/*`.
  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: adminSessionCookieName,
    value: buildAdminSessionCookieValue(username),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: getAdminSessionMaxAge(),
  })

  return response
}
