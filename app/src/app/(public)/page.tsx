/* Commento didattico:
 * Scopo del file: definisce una pagina o layout pubblico, visibile prima dell'accesso o senza permessi riservati.
 * Moduli richiamati: `next`, `next/link`, `next-intl/server`, `@/components/i18n/LanguageSwitcher`
 * Flusso: Questa pagina/layout richiama componenti e servizi: i dati arrivano da API o funzioni server, poi vengono passati alla UI per il rendering.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()

  return {
    title: `ContentFlix - ${t('app.tagline')}`,
    description: t('app.description'),
  }
}

export default async function LandingPage() {
  const t = await getTranslations()

  const steps = [
    {
      icon: '📺',
      bg: 'bg-primary-container',
      title: t('landing.howItWorks.step1Title'),
      description: t('landing.howItWorks.step1Description'),
    },
    {
      icon: '🧠',
      bg: 'bg-tertiary-container',
      title: t('landing.howItWorks.step2Title'),
      description: t('landing.howItWorks.step2Description'),
    },
    {
      icon: '⚡',
      bg: 'bg-secondary-container',
      title: t('landing.howItWorks.step3Title'),
      description: t('landing.howItWorks.step3Description'),
    },
  ]

  const faqItems = [
    { q: t('landing.faq.q1'), a: t('landing.faq.a1') },
    { q: t('landing.faq.q2'), a: t('landing.faq.a2') },
    { q: t('landing.faq.q3'), a: t('landing.faq.a3') },
    { q: t('landing.faq.q4'), a: t('landing.faq.a4') },
  ]

  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none">
          <div className="absolute top-1/4 right-[-10%] w-[600px] h-[600px] bg-tertiary opacity-[0.07] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-[20%] w-[400px] h-[400px] bg-primary opacity-[0.08] rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 animate-fade-in">
            <div className="mb-6">
              <LanguageSwitcher />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed rounded-full mb-8">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
              <span className="text-xs font-bold uppercase tracking-widest">{t('landing.hero.badge')}</span>
            </div>

            <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-on-surface leading-[1.05] mb-6 tracking-tighter">
              {t('landing.hero.title')}<br />
              <span className="text-gradient-ai">{t('landing.hero.titleHighlight')}</span>
            </h1>

            <p className="text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-3 gradient-primary text-on-primary
                           px-8 py-4 rounded-full font-bold text-lg hover:shadow-primary-glow
                           transition-all active:scale-95 shadow-ambient"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                {t('landing.hero.ctaLogin')}
              </Link>
              <button
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full
                           font-bold text-lg text-on-surface ghost-border hover:bg-surface-container-low
                           transition-all"
              >
                {t('landing.hero.ctaDemo')}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative hidden lg:block animate-slide-in">
            <div className="relative rounded-3xl overflow-hidden shadow-ambient bg-surface-container-lowest p-2">
              <div className="bg-surface-container-low rounded-2xl overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-label-caps text-tertiary mb-1">{t('video.bottomLine')}</div>
                      <div className="space-y-1.5">
                        <div className="h-2 bg-tertiary-fixed rounded-full w-full" />
                        <div className="h-2 bg-tertiary-fixed-dim rounded-full w-4/5" />
                        <div className="h-2 bg-tertiary-fixed-dim rounded-full w-3/5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-surface-container rounded-full text-xs text-on-surface-variant">{t('video.category')}</span>
                    <span className="px-3 py-1 bg-surface-container rounded-full text-xs text-on-surface-variant">AI</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 glass rounded-2xl px-4 py-3 shadow-ambient border border-white/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full status-active" />
                <span className="text-xs font-semibold text-on-surface">{t('dashboard.analysisComplete')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-headline text-4xl font-bold text-on-surface mb-4">{t('landing.howItWorks.title')}</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
              {t('landing.howItWorks.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                <div
                  className={`w-16 h-16 ${step.bg} text-on-primary rounded-full flex items-center justify-center mb-8 text-2xl`}
                >
                  {step.icon}
                </div>
                <h3 className="font-headline text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{step.description}</p>
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary-fixed-dim opacity-0 group-hover:opacity-20 rounded-full blur-2xl transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="font-headline text-4xl font-bold text-on-surface tracking-tight mb-2">
              {t('landing.faq.title')}
            </h2>
            <div className="w-20 h-1 bg-tertiary rounded-full" />
          </div>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="bg-surface-container-low rounded-2xl p-6 hover:bg-surface-container transition-all"
              >
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer list-none font-bold text-lg text-on-surface">
                    {item.q}
                    <svg
                      className="w-5 h-5 text-on-surface-variant group-open:rotate-180 transition-transform shrink-0 ml-4"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-4 text-on-surface-variant leading-relaxed">{item.a}</p>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto bg-primary rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-tertiary opacity-90" />
          <div className="relative z-10 px-12 py-20 text-center text-on-primary">
            <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6">
              {t('landing.cta.title')}
            </h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              {t('landing.cta.subtitle')}
            </p>
            <Link
              href="/login"
              className="inline-block bg-white text-primary px-10 py-5 rounded-full font-bold
                         text-xl hover:bg-surface-container-lowest transition-all shadow-xl active:scale-95"
            >
              {t('landing.cta.button')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
