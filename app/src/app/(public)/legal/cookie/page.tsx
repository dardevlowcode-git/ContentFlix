/* Commento didattico:
 * Scopo del file: placeholder Cookie Policy in attesa testo legale finale.
 * Moduli richiamati: `next-intl/server`
 * Flusso: presenta sezioni minime della policy cookie richieste dalla spec.
 */

import { getTranslations } from 'next-intl/server'

export default async function CookiePolicyPage() {
  const t = await getTranslations()
  const sections = [
    t('marketing.pages.legal.cookie.section1'),
    t('marketing.pages.legal.cookie.section2'),
    t('marketing.pages.legal.cookie.section3'),
    t('marketing.pages.legal.cookie.section4'),
    t('marketing.pages.legal.cookie.section5'),
    t('marketing.pages.legal.cookie.section6'),
    t('marketing.pages.legal.cookie.section7'),
  ]

  return (
    <div className="bg-surface px-6 pb-20 pt-14">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-5xl font-extrabold tracking-tight text-on-surface md:text-6xl">{t('marketing.nav.cookies')}</h1>
        <p className="mt-5 text-on-surface-variant">{t('marketing.pages.legal.warning')}</p>

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
