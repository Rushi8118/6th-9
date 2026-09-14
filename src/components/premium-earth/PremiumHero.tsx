import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Compass, Pause, Play, RotateCcw, Globe2 } from 'lucide-react'
import { CountUp } from '@/components/count-up'
import { EarthScene } from './EarthScene'
import { DestinationPanel } from './DestinationPanel'
import { DESTINATIONS } from '@/data/destinations'
import { cn } from '@/lib/utils'

const TRUST_POINTS = ['Profile-first guidance', 'Transparent documentation', 'Personal support']

const STATS = [
  { value: 2500, suffix: '+', label: 'Students guided' },
  { value: 12, suffix: '+', label: 'Global destinations' },
  { value: 98, suffix: '%', label: 'Client satisfaction' },
]

/** The premium two-column hero: editorial copy on the left, the interactive Earth on the right. */
export function PremiumHero() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [paused, setPaused] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  const selectedDestination = DESTINATIONS.find((d) => d.id === selectedId) ?? null

  return (
    <section className="relative overflow-hidden bg-[#070d1c] py-16 text-[#f4f1e8] sm:py-20 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 80% 20%, rgba(232,184,75,0.08), transparent 55%), radial-gradient(circle at 10% 80%, rgba(63,208,255,0.08), transparent 50%)',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 md:px-6 lg:grid-cols-12 lg:gap-8">
        <motion.div
          className="lg:col-span-6"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e8b84b]/30 bg-[#e8b84b]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#e8b84b]">
            <Compass className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
            Your global journey starts here
          </div>

          <h1 className="mt-6 font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Study, work and{' '}
            <span className="bg-gradient-to-r from-[#e8b84b] via-[#f5d78e] to-[#e8b84b] bg-clip-text text-transparent">
              live abroad
            </span>{' '}
            with confidence.
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-[#f4f1e8]/70 sm:text-lg">
            From your first profile assessment to your final visa decision, we help you choose the right
            destination, prepare a stronger application and move forward with clarity.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              to="/register"
              className="group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e8b84b] to-[#f5d78e] px-6 py-3 text-sm font-semibold text-[#0b1530] shadow-lg shadow-[#e8b84b]/20 transition hover:shadow-[#e8b84b]/40"
            >
              Start your global journey
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              to="/countries"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#5fd8ff]/60 hover:text-[#5fd8ff]"
            >
              Explore destinations
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:gap-x-8">
            {TRUST_POINTS.map((point) => (
              <div key={point} className="flex items-center gap-2 text-[#f4f1e8]/70">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5fd8ff]/15 text-[#5fd8ff] shadow-[0_0_10px_rgba(95,216,255,0.35)]">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
                {point}
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                  <CountUp value={stat.value} suffix={stat.suffix} duration={1.8} />
                </p>
                <p className="mt-0.5 text-xs text-[#f4f1e8]/55">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="lg:col-span-6"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Live global pathway map
              </div>
              <span className="text-xs font-semibold text-[#e8b84b]">{DESTINATIONS.length} active routes</span>
            </div>

            <div className="relative h-[360px] sm:h-[420px] lg:h-[460px]">
              <EarthScene
                key={resetKey}
                className="h-full w-full"
                selectedId={selectedId}
                hoveredId={hoveredId}
                onSelect={setSelectedId}
                onHoverChange={setHoveredId}
                paused={paused}
              />
              <DestinationPanel destination={selectedDestination} className="absolute bottom-4 left-4 right-4 sm:w-72" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-3">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Globe2 className="h-4 w-4 text-[#e8b84b]" aria-hidden="true" />
                Route active — Surat → global opportunities
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/20 px-3 text-xs font-semibold text-white transition hover:border-[#5fd8ff]/60"
                >
                  {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
                  {paused ? 'Resume rotation' : 'Pause rotation'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(null)
                    setResetKey((k) => k + 1)
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/20 px-3 text-xs font-semibold text-white transition hover:border-[#e8b84b]/60"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Reset view
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-white/10 px-5 py-3">
              {DESTINATIONS.map((destination) => (
                <button
                  key={destination.id}
                  type="button"
                  onClick={() => setSelectedId(destination.id)}
                  onMouseEnter={() => setHoveredId(destination.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={cn(
                    'min-h-[36px] rounded-full border px-3.5 py-1.5 text-xs font-semibold transition',
                    selectedId === destination.id
                      ? 'border-transparent bg-white/15 text-white'
                      : 'border-white/15 text-white/60 hover:border-white/30 hover:text-white',
                  )}
                  style={selectedId === destination.id ? { boxShadow: `0 0 0 1px ${destination.color}55, 0 0 16px ${destination.color}33` } : undefined}
                >
                  {destination.city}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
