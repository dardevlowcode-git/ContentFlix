/* Commento didattico:
 * Scopo del file: pagina pubblica prezzi per il marketing site.
 * Moduli richiamati: `next-intl/server`
 * Flusso: legge testi localizzati e mostra modello gratuito + uso API personali.
 */

import { getTranslations } from 'next-intl/server'

export default async function PricingPage() {
  const t = await getTranslations()
  const faq = [
    { q: t('marketing.pages.pricing.faq.q1'), a: t('marketing.pages.pricing.faq.a1') },
    { q: t('marketing.pages.pricing.faq.q2'), a: t('marketing.pages.pricing.faq.a2') },
    { q: t('marketing.pages.pricing.faq.q3'), a: t('marketing.pages.pricing.faq.a3') },
    { q: t('marketing.pages.pricing.faq.q4'), a: t('marketing.pages.pricing.faq.a4') },
    { q: t('marketing.pages.pricing.faq.q5'), a: t('marketing.pages.pricing.faq.a5') },
  ]

  return (
    <div className="bg-surface px-6 pb-20 pt-14">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-5xl font-extrabold tracking-tight text-on-surface md:text-6xl">
          {t('marketing.pages.pricing.title')}
        </h1>

        <section className="mt-10 rounded-[40px] bg-surface-container-low p-8">
          <h2 className="text-2xl font-bold text-on-surface">{t('marketing.pages.pricing.freePlanTitle')}</h2>
          <p className="mt-2 text-xl font-semibold text-on-surface">{t('marketing.pages.pricing.freePlanPrice')}</p>
          <p className="mt-3 text-on-surface-variant">{t('marketing.pages.pricing.freePlanDescription')}</p>
        </section>

        <section className="mt-8 rounded-[40px] bg-surface-container-low p-8">
          <h2 className="text-2xl font-bold text-on-surface">{t('marketing.pages.pricing.apiBlockTitle')}</h2>
          <p className="mt-3 text-on-surface-variant">{t('marketing.pages.pricing.apiBlockDescription')}</p>
        </section>

        <section className="mt-8 rounded-[40px] bg-primary px-8 py-10 text-on-primary">
          <h2 className="text-2xl font-bold">{t('marketing.pages.pricing.keyMessageTitle')}</h2>
          <p className="mt-3 text-on-primary">{t('marketing.pages.pricing.keyMessageDescription')}</p>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-bold text-on-surface">{t('marketing.pages.pricing.faq.title')}</h2>
          <div className="mt-6 space-y-4">
            {faq.map((item) => (
              <details key={item.q} className="rounded-3xl bg-surface-container-low p-6">
                <summary className="cursor-pointer list-none text-lg font-semibold text-on-surface">{item.q}</summary>
                <p className="mt-3 text-sm text-on-surface-variant">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
