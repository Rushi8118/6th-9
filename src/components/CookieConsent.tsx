import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  denyAnalyticsConsent,
  getStoredConsent,
  grantAnalyticsConsent,
  isAnalyticsConfigured,
} from '@/lib/ga'

/** Minimal consent banner — only shown when GA4 is actually configured. */
export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isAnalyticsConfigured()) return
    if (getStoredConsent() === null) setVisible(true)
  }, [])

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/98 px-4 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use analytics cookies to understand how visitors use this site and improve our
          guidance. No data is collected until you accept. See our{' '}
          <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </a>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              denyAnalyticsConsent()
              setVisible(false)
            }}
          >
            Decline
          </Button>
          <Button
            size="sm"
            onClick={() => {
              grantAnalyticsConsent()
              setVisible(false)
            }}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
