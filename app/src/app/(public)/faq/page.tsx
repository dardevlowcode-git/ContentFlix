/* Commento didattico:
 * Scopo del file: pagina FAQ pubblica.
 * Moduli richiamati: `next-intl/server`
 * Flusso: rende sezioni FAQ con accordion semantico tramite elementi details/summary.
 */

import { getTranslations } from 'next-intl/server'

export default async function FaqPage() {
  const t = await getTranslations()
  const sections = [
    {
      title: t('marketing.pages.faq.sections.account'),
      items: [
        { q: t('marketing.landing.faq.q1'), a: t('marketing.landing.faq.a1') },
      ],
    },
    {
      title: t('marketing.pages.faq.sections.freeAndApi'),
      items: [
        { q: t('marketing.landing.faq.q2'), a: t('marketing.landing.faq.a2') },
      ],
    },
    {
      title: t('marketing.pages.faq.sections.privacy'),
      items: [
        { q: t('marketing.landing.faq.q3'), a: t('marketing.landing.faq.a3') },
      ],
    },
    {
      title: t('marketing.pages.faq.sections.content'),
      items: [
        { q: t('marketing.landing.faq.q4'), a: t('marketing.landing.faq.a4') },
      ],
    },
    {
      title: t('marketing.pages.faq.sections.languages'),
      items: [
        { q: t('marketing.landing.faq.q5'), a: t('marketing.landing.faq.a5') },
      ],
    },
    {
      title: t('marketing.pages.faq.sections.fairUse'),
      items: [
        { q: t('marketing.landing.faq.q6'), a: t('marketing.landing.faq.a6') },
      ],
    },
  ]

  return (
    <div className="bg-surface px-6 pb-20 pt-14">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-5xl font-extrabold tracking-tight text-on-surface md:text-6xl">
          {t('marketing.nav.faq')}
        </h1>
        <p className="mt-5 max-w-3xl text-on-surface-variant">{t('marketing.pages.faq.subtitle')}</p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-bold text-on-surface">{section.title}</h2>
              <div className="mt-4 space-y-4">
                {section.items.map((item) => (
                  <details key={item.q} className="rounded-3xl bg-surface-container-low p-6">
                    <summary className="cursor-pointer list-none text-lg font-semibold text-on-surface">
                      {item.q}
                    </summary>
                    <p className="mt-3 text-sm text-on-surface-variant">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
