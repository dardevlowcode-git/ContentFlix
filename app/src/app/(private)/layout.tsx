/* Commento didattico:
 * Scopo del file: layout autenticato principale con enforcement accettazione TOS prima dell'accesso alle pagine private.
 * Moduli richiamati: componenti layout, auth provider e service legal acceptance.
 * Flusso: verifica sessione utente, controlla accettazioni richieste e reindirizza su `/legal/accept` quando necessario.
 */

import TopNav from '@/components/layout/TopNav'
import SideNav from '@/components/layout/SideNav'
import Footer from '@/components/layout/Footer'
import { getCurrentSession } from '@/lib/auth/provider'
import { getLegalAcceptanceStatus } from '@/lib/services/legal-acceptance'
import { redirect } from 'next/navigation'

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getCurrentSession()

  if (!session) {
    redirect('/login')
  }

  const locale = session.preferredLanguage === 'en' ? 'en' : 'it'
  const acceptanceStatus = await getLegalAcceptanceStatus(session.userId, locale)
  if (acceptanceStatus.needsAcceptance) {
    redirect('/legal/accept')
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <TopNav variant="private" session={session} />
      <div className="flex flex-1 pt-16">
        <SideNav session={session} />
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