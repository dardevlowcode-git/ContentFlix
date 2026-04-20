import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  // In V1, only Italian is supported.
  // Future: read locale from user preferences / URL segment.
  const locale = 'it'

  return {
    locale,
    messages: (await import(`../../../messages/${locale}.json`)).default,
  }
})
