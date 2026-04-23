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

export async function POST(request: Request) {
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

  const isValid = verifySuperAdminCredentials(username, password)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

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
