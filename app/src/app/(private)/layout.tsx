/* Commento didattico:
 * Scopo del file: definisce una pagina o layout protetto: viene usato dopo l'autenticazione dell'utente.
 * Moduli richiamati: `@/components/layout/TopNav`, `@/components/layout/SideNav`, `@/components/layout/Footer`, `@/lib/auth/provider`, `next/navigation`
 * Flusso: Questa pagina/layout richiama componenti e servizi: i dati arrivano da API o funzioni server, poi vengono passati alla UI per il rendering.
 */

import TopNav from '@/components/layout/TopNav'
import SideNav from '@/components/layout/SideNav'
import Footer from '@/components/layout/Footer'
import { getCurrentSession } from '@/lib/auth/provider'
import { redirect } from 'next/navigation'

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getCurrentSession()

  // Middleware handles this, but double-check for safety
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <TopNav variant="private" session={session} />
      <div className="flex flex-1 pt-16">
        {/* Fixed sidebar */}
        <SideNav session={session} />
        {/* Main content — offset for sidebar */}
        <main className="flex-1 ml-64 min-h-full">
          {children}
        </main>
      </div>
      <div className="ml-64">
        <Footer />
      </div>
    </div>
  )
}
