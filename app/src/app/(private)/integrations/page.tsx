import type { Metadata } from 'next'
import { getCurrentSession } from '@/lib/auth/provider'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Integrazioni',
  description: 'Configura le tue chiavi API YouTube e Gemini.',
}

export default async function IntegrationsPage() {
  const session = await getCurrentSession()
  const supabase = await createClient()

  const { data: credentials } = await supabase
    .from('user_provider_credentials')
    .select('*')
    .eq('user_id', session!.userId)

  const youtubeCredential = credentials?.find((c) => c.provider === 'youtube')
  const geminiCredential = credentials?.find((c) => c.provider === 'gemini')

  const connectors = [
    {
      id: 'youtube',
      title: 'YouTube Data API v3',
      description: 'Sincronizzazione metadati canali e video',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      iconBg: 'bg-red-500',
      credential: youtubeCredential,
    },
    {
      id: 'gemini',
      title: 'Gemini API',
      description: 'Analisi AI e generazione riepiloghi',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      ),
      iconBg: 'gradient-ai',
      credential: geminiCredential,
    },
  ]

  const configuredCount = credentials?.filter((c) => c.is_configured).length ?? 0

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <header className="mb-10">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          Integrazioni
        </h1>
        <p className="text-on-surface-variant">
          Configura le tue chiavi API per abilitare la sincronizzazione e l&apos;analisi AI.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 text-sm">
          <span className={`w-2 h-2 rounded-full ${configuredCount === 2 ? 'status-active' : 'status-pending status-warning'}`} />
          <span className="text-on-surface-variant font-medium">
            {configuredCount} connettori attivi
          </span>
        </div>
      </header>

      {/* Info box */}
      <div className="bg-primary-fixed/40 rounded-2xl p-5 mb-8 flex gap-4">
        <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Le tue chiavi API sono cifrate lato server e non vengono mai esposte al browser.
          ContentFlix le usa esclusivamente per sincronizzare i canali e generare i riepiloghi AI.
        </p>
      </div>

      {/* API Key cards */}
      <div className="space-y-4">
        {connectors.map((connector) => {
          const cred = connector.credential
          const isConfigured = cred?.is_configured ?? false
          const isValid = cred?.is_valid

          return (
            <div
              key={connector.id}
              className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient"
            >
              <div className="flex items-start justify-between gap-6">
                {/* Left: icon + info */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${connector.iconBg} rounded-xl flex items-center justify-center text-white shrink-0`}>
                    {connector.icon}
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-on-surface">{connector.title}</h3>
                    <p className="text-sm text-on-surface-variant mb-3">{connector.description}</p>

                    {/* Status row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className={`flex items-center gap-1.5 font-semibold px-3 py-1 rounded-full
                                        ${isConfigured
                                          ? isValid === false
                                            ? 'bg-error-container text-error'
                                            : 'bg-green-100 text-green-700'
                                          : 'bg-surface-container text-on-surface-variant'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full
                                          ${isConfigured
                                            ? isValid === false ? 'bg-error' : 'bg-green-500'
                                            : 'bg-outline'}`} />
                        {isConfigured
                          ? isValid === false ? 'Non valida' : 'Configurata'
                          : 'Non configurata'}
                      </span>

                      {cred?.last_validated_at && (
                        <span className="text-on-surface-variant">
                          Verificata {new Date(cred.last_validated_at).toLocaleDateString('it-IT')}
                        </span>
                      )}
                      {cred?.last_used_at && (
                        <span className="text-on-surface-variant">
                          Usata {new Date(cred.last_used_at).toLocaleDateString('it-IT')}
                        </span>
                      )}
                    </div>

                    {/* Error message */}
                    {cred?.last_error && (
                      <p className="mt-2 text-xs text-error">{cred.last_error}</p>
                    )}
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isConfigured ? (
                    <>
                      <button
                        className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant
                                   hover:text-on-surface px-4 py-2 rounded-xl ghost-border transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        Ruota chiave
                      </button>
                      <button
                        className="flex items-center gap-1.5 text-sm font-semibold text-error
                                   hover:bg-error-container/30 px-4 py-2 rounded-xl transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        Rimuovi
                      </button>
                    </>
                  ) : (
                    <button
                      className="gradient-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm
                                 hover:shadow-primary-glow transition-all active:scale-95"
                    >
                      Aggiungi chiave
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
