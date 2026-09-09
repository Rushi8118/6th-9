import { supabase } from '@/lib/supabase/client'

const SESSION_KEY = 'svo_visit_session_id'
const LAST_PATH_KEY = 'svo_last_tracked_path'
const THROTTLE_MS = 1500

let lastWriteAt = 0

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function getVisitSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const id = createId()
    localStorage.setItem(SESSION_KEY, id)
    return id
  } catch {
    return createId()
  }
}

function detectDeviceType(): string {
  const ua = navigator.userAgent
  if (/Mobi|Android/i.test(ua)) return 'mobile'
  if (/Tablet|iPad/i.test(ua)) return 'tablet'
  return 'desktop'
}

function detectBrowser(): string {
  const ua = navigator.userAgent
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('Chrome/')) return 'Chrome'
  if (ua.includes('Firefox/')) return 'Firefox'
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari'
  return 'Other'
}

/** Event types written by the tracker today (schema also allows password_change / application_status_change for later). */
export type TrackableEventType =
  | 'page_view'
  | 'login'
  | 'logout'
  | 'failed_login'
  | 'signup'
  | 'application_submitted'

export type TrackEventInput = {
  eventType: TrackableEventType
  path?: string
  title?: string
  userId?: string | null
  metadata?: Record<string, unknown>
}

export async function trackSiteEvent(input: TrackEventInput): Promise<void> {
  if (typeof window === 'undefined') return

  const now = Date.now()
  if (input.eventType === 'page_view' && now - lastWriteAt < THROTTLE_MS) return

  const path = input.path || `${window.location.pathname}${window.location.search}`
  if (input.eventType === 'page_view') {
    try {
      const lastPath = sessionStorage.getItem(LAST_PATH_KEY)
      if (lastPath === path && now - lastWriteAt < 8000) return
      sessionStorage.setItem(LAST_PATH_KEY, path)
    } catch {
      // ignore
    }
  }

  lastWriteAt = now

  try {
    const { error } = await supabase.from('interactions').insert({
      event_type: input.eventType,
      page_path: path.slice(0, 500),
      page_title: (input.title || document.title || '').slice(0, 200) || null,
      referrer: document.referrer ? document.referrer.slice(0, 500) : null,
      session_id: getVisitSessionId(),
      user_id: input.userId || null,
      device_type: detectDeviceType(),
      browser: detectBrowser(),
      metadata: {
        href: window.location.href,
        language: navigator.language,
        ...(input.metadata || {}),
      },
    })
    if (error) {
      // Common cause: CHECK constraint missing application_submitted / logout / failed_login
      console.warn('[site-visit-tracker] insert failed:', error.message)
    }
  } catch {
    // Never break the public site for analytics failures
  }
}

export async function markUserLogin(userId: string): Promise<void> {
  try {
    await Promise.all([
      supabase
        .from('user_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId),
      trackSiteEvent({
        eventType: 'login',
        path: window.location.pathname,
        title: 'User login',
        userId,
      }),
    ])
  } catch {
    // ignore
  }
}

/** Call BEFORE clearing auth storage so session_id / user_id are still available. */
export async function markUserLogout(userId: string): Promise<void> {
  try {
    await trackSiteEvent({
      eventType: 'logout',
      path: typeof window !== 'undefined' ? window.location.pathname : '/logout',
      title: 'User logout',
      userId,
    })
  } catch {
    // ignore
  }
}

export async function markFailedLogin(email?: string): Promise<void> {
  try {
    await trackSiteEvent({
      eventType: 'failed_login',
      path: typeof window !== 'undefined' ? window.location.pathname : '/login',
      title: 'Failed login',
      metadata: email ? { email: email.slice(0, 200) } : {},
    })
  } catch {
    // ignore
  }
}

export async function markApplicationSubmitted(
  userId: string | null,
  applicationId?: string,
  applicationType?: string,
): Promise<void> {
  try {
    await trackSiteEvent({
      eventType: 'application_submitted',
      path: typeof window !== 'undefined' ? window.location.pathname : '/apply',
      title: 'Application Submitted',
      userId,
      metadata: { application_id: applicationId, application_type: applicationType },
    })
  } catch {
    // ignore
  }
}
