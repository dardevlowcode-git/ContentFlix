/* Commento didattico:
 * Scopo del file: pagina FAQ pubblica con ritmo editoriale e accordion accessibile.
 * Moduli richiamati: `next-intl/server`, template sezioni marketing.
 */

import { getTranslations } from 'next-intl/server'
import { SplitHeroSection } from '@/components/marketing/SectionTemplates'

export default async function FaqPage() {
  const t = await getTranslations()
  const sections = [
    {
      title: t('marketing.pages.faq.sections.account'),
      items: [{ q: t('marketing.landing.faq.q1'), a: t('marketing.landing.faq.a1') }],
    },
    {
      title: t('marketing.pages.faq.sections.freeAndApi'),
      items: [{ q: t('marketing.landing.faq.q2'), a: t('marketing.landing.faq.a2') }],
    },
    {
      title: t('marketing.pages.faq.sections.privacy'),
      items: [{ q: t('marketing.landing.faq.q3'), a: t('marketing.landing.faq.a3') }],
    },
    {
      title: t('marketing.pages.faq.sections.content'),
      items: [{ q: t('marketing.landing.faq.q4'), a: t('marketing.landing.faq.a4') }],
    },
    {
      title: t('marketing.pages.faq.sections.languages'),
      items: [{ q: t('marketing.landing.faq.q5'), a: t('marketing.landing.faq.a5') }],
    },
    {
      title: t('marketing.pages.faq.sections.fairUse'),
      items: [{ q: t('marketing.landing.faq.q6'), a: t('marketing.landing.faq.a6') }],
    },
  ]

  return (
    <div className="bg-surface-base">
      <SplitHeroSection title={t('marketing.nav.faq')} subtitle={<p>{t('marketing.pages.faq.subtitle')}</p>} tone="base" />

      <section className="bg-surface-elevated px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-card-title text-on-surface">{section.title}</h2>
              <div className="mt-4 space-y-4">
                {section.items.map((item) => (
                  <details key={item.q} className="rounded-3xl border border-stroke-subtle bg-surface-statement p-6 shadow-soft">
                    <summary className="cursor-pointer list-none text-lg font-semibold text-on-surface">{item.q}</summary>
                    <p className="mt-3 text-sm text-on-surface-variant">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  )
}
