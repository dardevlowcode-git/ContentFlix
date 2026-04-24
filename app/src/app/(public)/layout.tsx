/* Commento didattico:
 * Scopo del file: definisce una pagina o layout pubblico, visibile prima dell'accesso o senza permessi riservati.
 * Moduli richiamati: `@/components/layout/TopNav`, `@/components/layout/Footer`
 * Flusso: Questa pagina/layout richiama componenti e servizi: i dati arrivano da API o funzioni server, poi vengono passati alla UI per il rendering.
 */

import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav variant="public" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
