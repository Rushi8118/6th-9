/**
 * Google Analytics 4 loader, consent-mode aware.
 *
 * No script is injected until a GA4 Measurement ID is supplied via
 * VITE_GA_MEASUREMENT_ID, and analytics_storage stays 'denied' until the
 * visitor accepts via the consent banner (see CookieConsent.tsx).
 */

const CONSENT_STORAGE_KEY = 'siddhivinayak_analytics_consent'

type ConsentState = 'granted' | 'denied'

function gtag(...args: unknown[]) {
  ;(window as any).dataLayer = (window as any).dataLayer || []
  ;(window as any).dataLayer.push(args)
}

export function getStoredConsent(): ConsentState | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null
  }
}

function setStoredConsent(state: ConsentState) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, state)
  } catch {
    // localStorage unavailable (private mode etc.) — consent just won't persist
  }
}

let initialized = false

/** Loads the GA4 script and sets default (denied) consent. Call once at app start. */
export function initAnalytics() {
  if (initialized) return
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined
  if (!measurementId) return
  initialized = true

  ;(window as any).dataLayer = (window as any).dataLayer || []
  ;(window as any).gtag = gtag

  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })

  const stored = getStoredConsent()
  if (stored === 'granted') {
    gtag('consent', 'update', { analytics_storage: 'granted' })
  }

  gtag('js', new Date())
  gtag('config', measurementId, { anonymize_ip: true, send_page_view: false })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)
}

/** Called when the visitor accepts analytics cookies in the consent banner. */
export function grantAnalyticsConsent() {
  setStoredConsent('granted')
  if (typeof (window as any).gtag === 'function') {
    gtag('consent', 'update', { analytics_storage: 'granted' })
  }
}

/** Called when the visitor declines analytics cookies. */
export function denyAnalyticsConsent() {
  setStoredConsent('denied')
  if (typeof (window as any).gtag === 'function') {
    gtag('consent', 'update', { analytics_storage: 'denied' })
  }
}

export function isAnalyticsConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GA_MEASUREMENT_ID)
}
