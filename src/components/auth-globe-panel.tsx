import { Suspense, lazy, Component, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import StarField from '@/components/StarField'
import { cn } from '@/lib/utils'

const InteractiveGlobe = lazy(() => import('@/components/interactive-globe'))

function GlobePoster() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-transparent">
      <div className="relative h-72 w-72 rounded-full overflow-hidden shadow-[0_0_80px_rgba(56,189,248,0.3)]">
        <img
          src="/earth-blue-marble.jpg"
          alt="3D Earth"
          width={640}
          height={640}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover scale-150"
        />
      </div>
    </div>
  )
}

function GlobeFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-transparent">
      <div className="text-center opacity-70">
        <span className="text-4xl" role="img" aria-label="Globe">🌍</span>
        <p className="mt-2 text-sm text-white/60">3D globe unavailable</p>
      </div>
    </div>
  )
}

class GlobeErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) return <GlobeFallback />
    return this.props.children
  }
}

type AuthGlobePanelProps = {
  eyebrow: string
  title: string
  description: string
  stats: { value: string; label: string }[]
}

/**
 * Full-height decorative side panel for the Login/Register pages: a dark,
 * starfield-backed 3D Earth with animated flight-route arcs (reusing the
 * homepage's InteractiveGlobe), plus brand copy and stat badges. Purely
 * decorative (aria-hidden on the 3D layer) and hidden below `lg` so the
 * auth form always has full width on mobile/tablet.
 */
export function AuthGlobePanel({ eyebrow, title, description, stats }: AuthGlobePanelProps) {
  const [inView, setInView] = useState(true)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '80px',
      threshold: 0.05,
    })
    io.observe(node)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={sectionRef}
      className="relative hidden w-1/2 shrink-0 overflow-hidden bg-[#05070f] lg:flex xl:w-[56%]"
    >
      <StarField className="opacity-70" />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 70% 30%, rgba(212,175,55,0.16), transparent 55%), radial-gradient(circle at 20% 80%, rgba(56,189,248,0.12), transparent 50%)',
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        {inView ? (
          <GlobeErrorBoundary>
            <Suspense fallback={<GlobePoster />}>
              <InteractiveGlobe className="h-[120%] w-[120%]" showMarkers autoRotateSpeed={0.0016} />
            </Suspense>
          </GlobeErrorBoundary>
        ) : (
          <GlobePoster />
        )}
      </div>

      {/* Readability scrim so overlaid text never fights the globe */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05070f] via-[#05070f]/40 to-[#05070f]/70"
      />

      <div className="relative z-10 flex w-full flex-col justify-between p-10 text-white xl:p-14">
        <Link to="/" className="inline-flex w-fit items-center gap-2 text-lg font-serif font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary ring-1 ring-primary/40">
            SO
          </span>
          Siddhivinayak Overseas
        </Link>

        <div className="max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-balance xl:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70">{description}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-serif text-2xl font-semibold text-white">{stat.value}</p>
              <p className="mt-0.5 text-xs text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AuthGlobeCardBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-white shadow-lg backdrop-blur-md',
        className,
      )}
      role="note"
    >
      <p className="text-[10px] uppercase font-bold tracking-wider text-primary">Live</p>
      <p className="text-sm font-semibold">Route tracking active</p>
    </div>
  )
}
