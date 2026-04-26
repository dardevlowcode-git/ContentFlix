/* Commento didattico:
 * Scopo del file: mantiene compatibilita con la route "traker" reindirizzando alla pagina tracker.
 * Moduli richiamati: `next/navigation`
 * Flusso: qualsiasi accesso a /traker viene inoltrato a /tracker.
 */

import { redirect } from 'next/navigation'

export default function TrakerAliasPage() {
  redirect('/tracker')
}
