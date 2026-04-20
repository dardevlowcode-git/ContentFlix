import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'ContentFlix',
    template: '%s | ContentFlix',
  },
  description:
    'ContentFlix analizza automaticamente i tuoi canali YouTube preferiti così rimani sempre informato in pochi minuti.',
  keywords: ['YouTube', 'AI', 'riepiloghi', 'canali', 'video', 'intelligenza artificiale'],
  authors: [{ name: 'ContentFlix' }],
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    title: 'ContentFlix — Consuma YouTube più velocemente con l\'AI',
    description:
      'Riepiloghi AI dei tuoi canali YouTube preferiti. Capisci video da 30 minuti in 60 secondi.',
    siteName: 'ContentFlix',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const messages = await getMessages()

  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface text-on-surface antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
