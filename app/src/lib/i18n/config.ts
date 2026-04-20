// Supported locales (V1: Italian only. Add more in future versions.)
export const locales = ['it'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'it'

export const localeNames: Record<Locale, string> = {
  it: 'Italiano',
}
