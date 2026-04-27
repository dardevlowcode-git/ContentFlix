/* Commento didattico:
 * Scopo del file: configura il comportamento globale di Next.js (build, lint, immagini, plugin i18n).
 * Moduli richiamati: `next-intl/plugin`
 * Flusso: Next.js legge questa configurazione all'avvio/build per applicare plugin e opzioni runtime.
 */

import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts')

const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
