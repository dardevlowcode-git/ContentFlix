/* Commento didattico:
 * Scopo del file: placeholder Termini di servizio in attesa validazione legale.
 * Moduli richiamati: `next-intl/server`
 * Flusso: mostra campi placeholder obbligatori e sezioni richieste dalla spec.
 */

import { getTranslations } from 'next-intl/server'

export default async function TermsPage() {
  const t = await getTranslations()
  const placeholders = [
    t('marketing.pages.legal.terms.placeholder1'),
    t('marketing.pages.legal.terms.placeholder2'),
    t('marketing.pages.legal.terms.placeholder3'),
    t('marketing.pages.legal.terms.placeholder4'),
    t('marketing.pages.legal.terms.placeholder5'),
    t('marketing.pages.legal.terms.placeholder6'),
    t('marketing.pages.legal.terms.placeholder7'),
    t('marketing.pages.legal.terms.placeholder8'),
  ]
  const sections = [
    t('marketing.pages.legal.terms.section1'),
    t('marketing.pages.legal.terms.section2'),
    t('marketing.pages.legal.terms.section3'),
    t('marketing.pages.legal.terms.section4'),
    t('marketing.pages.legal.terms.section5'),
    t('marketing.pages.legal.terms.section6'),
    t('marketing.pages.legal.terms.section7'),
    t('marketing.pages.legal.terms.section8'),
    t('marketing.pages.legal.terms.section9'),
    t('marketing.pages.legal.terms.section10'),
    t('marketing.pages.legal.terms.section11'),
    t('marketing.pages.legal.terms.section12'),
  ]

  return (
    <div className="bg-surface px-6 pb-20 pt-14">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-5xl font-extrabold tracking-tight text-on-surface md:text-6xl">{t('marketing.nav.terms')}</h1>
        <p className="mt-5 text-on-surface-variant">{t('marketing.pages.legal.warning')}</p>

        <section className="mt-8 rounded-3xl bg-surface-container-low p-6">
          <h2 className="text-2xl font-bold text-on-surface">{t('marketing.pages.legal.placeholdersTitle')}</h2>
          <ul className="mt-4 space-y-2">
            {placeholders.map((item) => (
              <li key={item} className="text-sm text-on-surface-variant">{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-3xl bg-surface-container-low p-6">
          <h2 className="text-2xl font-bold text-on-surface">{t('marketing.pages.legal.sectionsTitle')}</h2>
          <ul className="mt-4 space-y-2">
            {sections.map((item) => (
              <li key={item} className="text-sm text-on-surface-variant">{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
