/* Commento didattico:
 * Scopo del file: placeholder Privacy Policy in attesa validazione legale.
 * Moduli richiamati: `next-intl/server`
 * Flusso: espone elenco sezioni obbligatorie da completare legalmente.
 */

import { getTranslations } from 'next-intl/server'

export default async function PrivacyPage() {
  const t = await getTranslations()
  const sections = [
    t('marketing.pages.legal.privacy.section1'),
    t('marketing.pages.legal.privacy.section2'),
    t('marketing.pages.legal.privacy.section3'),
    t('marketing.pages.legal.privacy.section4'),
    t('marketing.pages.legal.privacy.section5'),
    t('marketing.pages.legal.privacy.section6'),
    t('marketing.pages.legal.privacy.section7'),
    t('marketing.pages.legal.privacy.section8'),
    t('marketing.pages.legal.privacy.section9'),
    t('marketing.pages.legal.privacy.section10'),
    t('marketing.pages.legal.privacy.section11'),
    t('marketing.pages.legal.privacy.section12'),
  ]

  return (
    <div className="bg-surface px-6 pb-20 pt-14">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-5xl font-extrabold tracking-tight text-on-surface md:text-6xl">{t('marketing.nav.privacy')}</h1>
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
