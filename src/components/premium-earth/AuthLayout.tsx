import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { EarthScene } from './EarthScene'
import { DESTINATIONS } from '@/data/destinations'

type AuthLayoutProps = {
  title: string
  description: string
  benefits: string[]
  children: ReactNode
}

/** Split-screen shell shared by the premium login and register pages. */
export function AuthLayout({ title, description, benefits, children }: AuthLayoutProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="flex min-h-screen bg-[#070d1c]">
      <div className="relative hidden w-1/2 shrink-0 overflow-hidden lg:flex xl:w-[56%]">
        <EarthScene
          className="absolute inset-0"
          selectedId={null}
          hoveredId={hoveredId}
          onSelect={() => {}}
          onHoverChange={setHoveredId}
          paused={false}
          dark
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05070f] via-[#05070f]/40 to-[#05070f]/70"
        />

        <div className="relative z-10 flex w-full flex-col justify-between p-10 text-white xl:p-14">
          <Link to="/" className="inline-flex w-fit items-center gap-2 text-lg font-serif font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8b84b]/20 text-[#e8b84b] ring-1 ring-[#e8b84b]/40">
              SO
            </span>
            Siddhivinayak Overseas
          </Link>

          <div className="max-w-md">
            <h2 className="font-serif text-3xl font-semibold leading-tight text-balance xl:text-4xl">{title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70">{description}</p>
            <ul className="mt-6 space-y-2.5">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2.5 text-sm text-white/80">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#5fd8ff]/15 text-[#5fd8ff]">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-white/10 pt-4 text-xs text-white/50">
            <p>Pragti IT Park, Surat</p>
            <p className="mt-0.5">Study • Work • Global careers</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center px-4 py-16 sm:px-8 lg:px-14">
        <div className="mx-auto w-full max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e8b84b]">
            {DESTINATIONS.length} destinations • Surat-based consultancy
          </p>
          {children}
        </div>
      </div>
    </div>
  )
}
