/* Commento didattico:
 * Scopo del file: layout autenticato per la sola pagina `/legal/accept`, senza enforcement TOS per evitare loop.
 * Moduli richiamati: componenti layout e auth provider.
 * Flusso: richiede sessione utente e rende shell privata standard per la pagina di accettazione legale.
 */

import TopNav from '@/components/layout/TopNav'
import SideNav from '@/components/layout/SideNav'
import Footer from '@/components/layout/Footer'
import { getCurrentSession } from '@/lib/auth/provider'
import { redirect } from 'next/navigation'

export default async function PrivateLegalLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <TopNav variant="private" session={session} />
      <div className="flex flex-1 pt-16">
        <SideNav session={session} />
        <main className="flex-1 ml-64 min-h-full">{children}</main>
      </div>
      <div className="ml-64">
        <Footer />
      </div>
    </div>
  )
}