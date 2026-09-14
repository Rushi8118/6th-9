import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Compass } from 'lucide-react'
import type { Destination } from '@/data/destinations'
import { cn } from '@/lib/utils'

type DestinationPanelProps = {
  destination: Destination | null
  className?: string
}

/** Floating glass card that mirrors the currently selected route. */
export function DestinationPanel({ destination, className }: DestinationPanelProps) {
  return (
    <div
      className={cn(
        'pointer-events-auto rounded-2xl border border-white/15 bg-[#0b1530]/70 p-5 text-white shadow-2xl backdrop-blur-xl',
        className,
      )}
    >
      <AnimatePresence mode="wait">
        {destination ? (
          <motion.div
            key={destination.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <p className="font-serif text-2xl font-semibold" style={{ color: destination.color }}>
              {destination.city}
            </p>
            <p className="mt-0.5 text-sm text-white/70">{destination.country}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
              {destination.pathway}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{destination.blurb}</p>
            <Link
              to={destination.href}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Explore this destination
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-2 text-primary">
              <Compass className="h-4 w-4" aria-hidden="true" />
              <p className="font-serif text-lg font-semibold text-white">Explore your next destination</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Choose a route to discover global education and career opportunities.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
