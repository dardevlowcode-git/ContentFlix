/* Commento didattico:
 * Scopo del file: definisce una pagina o layout pubblico, visibile prima dell'accesso o senza permessi riservati.
 * Moduli richiamati: `next`, `next/link`, `next-intl/server`
 * Flusso: Questa pagina/layout richiama componenti e servizi: i dati arrivano da API o funzioni server, poi vengono passati alla UI per il rendering.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import HeroOrbital from '@/components/marketing/HeroOrbital'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()

  return {
    title: t('marketing.landing.metaTitle'),
    description: t('marketing.landing.metaDescription'),
  }
}

export default async function LandingPage() {
  const t = await getTranslations()

  const howItWorksSteps = [
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

  const problemTags = [
    t('marketing.landing.problem.tag1'),
    t('marketing.landing.problem.tag2'),
    t('marketing.landing.problem.tag3'),
    t('marketing.landing.problem.tag4'),
  ]

  const features = [
    { title: t('marketing.landing.features.items.youtube.title'), incoming: false },
    { title: t('marketing.landing.features.items.podcast.title'), incoming: true },
    { title: t('marketing.landing.features.items.text.title'), incoming: false },
    { title: t('marketing.landing.features.items.audio.title'), incoming: true },
    { title: t('marketing.landing.features.items.tts.title'), incoming: true },
    { title: t('marketing.landing.features.items.playlists.title'), incoming: true },
  ]

  const pricingBullets = [
    t('marketing.landing.pricing.bullet1'),
    t('marketing.landing.pricing.bullet2'),
    t('marketing.landing.pricing.bullet3'),
    t('marketing.landing.pricing.bullet4'),
  ]

  const useCases = [
    t('marketing.landing.useCases.item1'),
    t('marketing.landing.useCases.item2'),
    t('marketing.landing.useCases.item3'),
    t('marketing.landing.useCases.item4'),
    t('marketing.landing.useCases.item5'),
  ]

  const faqItems = [
    { q: t('marketing.landing.faq.q1'), a: t('marketing.landing.faq.a1') },
    { q: t('marketing.landing.faq.q2'), a: t('marketing.landing.faq.a2') },
    { q: t('marketing.landing.faq.q3'), a: t('marketing.landing.faq.a3') },
    { q: t('marketing.landing.faq.q4'), a: t('marketing.landing.faq.a4') },
    { q: t('marketing.landing.faq.q5'), a: t('marketing.landing.faq.a5') },
    { q: t('marketing.landing.faq.q6'), a: t('marketing.landing.faq.a6') },
  ]

  const orbitalNodes = [
    t('marketing.hero.nodes.video'),
    t('marketing.hero.nodes.podcast'),
    t('marketing.hero.nodes.audio'),
    t('marketing.hero.nodes.text'),
    t('marketing.hero.nodes.playlist'),
    t('marketing.hero.nodes.categories'),
    t('marketing.hero.nodes.language'),
    t('marketing.hero.nodes.apiAi'),
  ]

  return (
    <div className="overflow-hidden bg-surface">
      <section className="px-6 pb-24 pt-16">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h1 className="text-5xl font-extrabold leading-[1.02] tracking-tight text-on-surface md:text-7xl">
              {t('marketing.landing.hero.headline1')}
              <br />
              {t('marketing.landing.hero.headline2')}
              <br />
              <span className="text-gradient-ai">{t('marketing.landing.hero.headline3')}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
              {t('marketing.landing.hero.subtitle')}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-on-primary transition-colors hover:bg-primary-container"
              >
                {t('marketing.cta.createWatchlist')}
              </Link>
              <Link
                href="/funzionalita"
                className="inline-flex items-center justify-center rounded-full bg-surface-container-low px-8 py-4 text-base font-semibold text-on-surface transition-colors hover:bg-surface-container"
              >
                {t('marketing.cta.exploreFeatures')}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <HeroOrbital ariaLabel={t('marketing.hero.ariaLabel')} centerLabel={t('marketing.hero.center')} nodes={orbitalNodes} />
            <div className="mx-auto max-w-sm rounded-3xl bg-surface-container-low p-6 text-center lg:hidden">
              <p className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">{t('marketing.hero.mobileFallbackTitle')}</p>
              <p className="mt-3 text-sm text-on-surface-variant">{t('marketing.hero.mobileFallbackDescription')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-bold text-on-surface">{t('marketing.landing.howItWorks.title')}</h2>
          <p className="mt-3 max-w-3xl text-on-surface-variant">{t('marketing.landing.howItWorks.subtitle')}</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {howItWorksSteps.map((step) => (
              <article key={step.title} className="rounded-3xl bg-surface-container-lowest p-6">
                <h3 className="text-lg font-bold text-on-surface">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-bold text-on-surface">{t('marketing.landing.problem.title')}</h2>
          <p className="mt-4 max-w-3xl text-lg text-on-surface-variant">{t('marketing.landing.problem.description')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {problemTags.map((tag) => (
              <span key={tag} className="rounded-full bg-surface-container-low px-4 py-2 text-sm text-on-surface-variant">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-bold text-on-surface">{t('marketing.landing.features.title')}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-3xl bg-surface-container-lowest p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-on-surface">{feature.title}</h3>
                  {feature.incoming && (
                    <span className="rounded-full bg-secondary-fixed px-3 py-1 text-xs font-semibold uppercase tracking-wide text-on-secondary-fixed">
                      {t('marketing.badgeComingSoon')}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm text-on-surface-variant">{t('marketing.landing.features.note')}</p>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <article className="rounded-[40px] bg-surface-container-low p-8">
            <h2 className="text-3xl font-bold text-on-surface">{t('marketing.landing.reuse.title')}</h2>
            <p className="mt-4 text-on-surface-variant">{t('marketing.landing.reuse.description')}</p>
            <p className="mt-4 text-sm text-on-surface-variant">{t('marketing.landing.reuse.privacyNote')}</p>
          </article>
          <article className="rounded-[40px] bg-surface-container-low p-8">
            <h2 className="text-3xl font-bold text-on-surface">{t('marketing.landing.pricing.title')}</h2>
            <p className="mt-4 text-on-surface-variant">{t('marketing.landing.pricing.description')}</p>
            <ul className="mt-4 space-y-2">
              {pricingBullets.map((bullet) => (
                <li key={bullet} className="text-sm text-on-surface-variant">
                  • {bullet}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-bold text-on-surface">{t('marketing.landing.useCases.title')}</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {useCases.map((item) => (
              <li key={item} className="rounded-3xl bg-surface-container-lowest p-5 text-on-surface-variant">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-on-surface">{t('marketing.landing.faq.title')}</h2>
          <div className="mt-8 space-y-4">
            {faqItems.map((item) => (
              <details key={item.q} className="rounded-3xl bg-surface-container-low p-6">
                <summary className="cursor-pointer list-none text-lg font-semibold text-on-surface">{item.q}</summary>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl rounded-[40px] bg-primary px-8 py-14 text-center text-on-primary">
          <h2 className="text-4xl font-bold">{t('marketing.landing.finalCta.title')}</h2>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-lifted-cream px-8 py-4 text-base font-semibold text-ink-black transition-colors hover:bg-white"
          >
            {t('marketing.cta.createWatchlist')}
          </Link>
        </div>
      </section>
    </div>
  )
}
