/* Commento didattico:
 * Scopo del file: pagina pubblica "Funzionalità" del marketing site.
 * Moduli richiamati: `next/link`, `next-intl/server`
 * Flusso: legge i copy da next-intl e rende una pagina statica strutturata per sezioni.
 */

import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function FeaturesPage() {
  const t = await getTranslations()

  const steps = [
    {
      title: t('marketing.landing.howItWorks.step1.title'),
      description: t('marketing.landing.howItWorks.step1.description'),
    },
    {
      title: t('marketing.landing.howItWorks.step2.title'),
      description: t('marketing.landing.howItWorks.step2.description'),
    },
    {
      title: t('marketing.landing.howItWorks.step3.title'),
      description: t('marketing.landing.howItWorks.step3.description'),
    },
    {
      title: t('marketing.landing.howItWorks.step4.title'),
      description: t('marketing.landing.howItWorks.step4.description'),
    },
  ]

  const features = [
    { title: t('marketing.landing.features.items.youtube.title'), incoming: false },
    { title: t('marketing.landing.features.items.podcast.title'), incoming: true },
    { title: t('marketing.landing.features.items.text.title'), incoming: false },
    { title: t('marketing.landing.features.items.audio.title'), incoming: true },
    { title: t('marketing.landing.features.items.tts.title'), incoming: true },
    { title: t('marketing.landing.features.items.playlists.title'), incoming: true },
  ]

  const supportBlocks = [
    {
      title: t('marketing.pages.features.support.languageTitle'),
      description: t('marketing.pages.features.support.languageDescription'),
    },
    {
      title: t('marketing.pages.features.support.apiTitle'),
      description: t('marketing.pages.features.support.apiDescription'),
    },
    {
      title: t('marketing.pages.features.support.reuseTitle'),
      description: t('marketing.pages.features.support.reuseDescription'),
    },
  ]

  return (
    <div className="bg-surface px-6 pb-20 pt-14">
      <div className="mx-auto max-w-7xl">
        <section>
          <h1 className="text-5xl font-extrabold tracking-tight text-on-surface md:text-6xl">
            {t('marketing.pages.features.title')}
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-on-surface-variant">
            {t('marketing.pages.features.subtitle')}
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-bold text-on-surface">{t('marketing.landing.howItWorks.title')}</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {steps.map((step) => (
              <article key={step.title} className="rounded-3xl bg-surface-container-low p-6">
                <h3 className="text-lg font-semibold text-on-surface">{step.title}</h3>
                <p className="mt-2 text-sm text-on-surface-variant">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-bold text-on-surface">{t('marketing.landing.features.title')}</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-3xl bg-surface-container-low p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-on-surface">{feature.title}</h3>
                  {feature.incoming && (
                    <span className="rounded-full bg-secondary-fixed px-3 py-1 text-xs font-semibold uppercase tracking-wide text-on-secondary-fixed">
                      {t('marketing.badgeComingSoon')}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-5 md:grid-cols-3">
          {supportBlocks.map((block) => (
            <article key={block.title} className="rounded-3xl bg-surface-container-low p-6">
              <h3 className="text-lg font-semibold text-on-surface">{block.title}</h3>
              <p className="mt-3 text-sm text-on-surface-variant">{block.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-14 rounded-[40px] bg-primary px-8 py-12 text-center text-on-primary">
          <h2 className="text-3xl font-bold">{t('marketing.pages.features.finalCtaTitle')}</h2>
          <Link
            href="/login"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-lifted-cream px-8 py-4 text-base font-semibold text-ink-black transition-colors hover:bg-white"
          >
            {t('marketing.cta.createWatchlist')}
          </Link>
        </section>
      </div>
    </div>
  )
}
