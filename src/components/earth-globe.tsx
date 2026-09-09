import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useMemo, useRef, useState } from "react"
import { FlagIcon } from '@/components/flag-icon'

interface EarthGlobeProps {
  size?: number
  className?: string
}

/**
 * Premium wireframe Earth globe with mathematically accurate country pins.
 *
 * IMPORTANT — Why a wireframe (no continent texture):
 *   A textured globe only "looks correct" if its texture is a true equirectangular
 *   map of Earth. Decorative textures inevitably misalign continents with pins.
 *   By rendering an abstract wireframe (lat rings + lng meridians), there are no
 *   continents to misalign with — pins ARE the geographic markers, and they sit
 *   exactly at their real (lat, lng) coordinates.
 *
 * - A single rAF loop drives the globe rotation in degrees.
 * - Longitude meridians rotate with the globe; latitude rings stay still.
 * - Each pin: (lat, lng + rotation) → unit-sphere (x,y,z) → 2D screen coord.
 *   Pins fade out as they rotate to the back side (z < 0).
 * - Animated arcs are drawn between pin pairs and fade with their endpoints.
 */

type Country = {
  name: string
  short?: string
  lat: number
  lng: number
}

// Real geographic centroids (degrees)
const COUNTRIES: Country[] = [
  { name: "Japan", lat: 36.2, lng: 138.2 },
  { name: "Australia", lat: -25.3, lng: 133.8 },
  { name: "Canada", lat: 56.1, lng: -106.3 },
  { name: "United Kingdom", short: "UK", lat: 55.4, lng: -3.4 },
  { name: "Germany", lat: 51.2, lng: 10.5 },
  { name: "New Zealand", short: "NZ", lat: -40.9, lng: 174.9 },
  { name: "Russia", lat: 61.5, lng: 105.3 },
  { name: "United States", short: "USA", lat: 37.1, lng: -95.7 },
  { name: "India", lat: 22.0, lng: 78.0 },
]

const ARC_PAIRS: Array<[string, string]> = [
  ["India", "Japan"],
  ["India", "United Kingdom"],
  ["India", "Canada"],
  ["India", "Australia"],
  ["United States", "United Kingdom"],
  ["Russia", "Germany"],
]

function project(lat: number, lng: number, rot: number) {
  const latRad = (lat * Math.PI) / 180

  // 🔥 THIS IS THE REAL FIX
  const TEXTURE_OFFSET = -100

  const lonRad = ((lng + rot + TEXTURE_OFFSET) * Math.PI) / 180

  const x = Math.cos(latRad) * Math.sin(lonRad)
  const y = Math.sin(latRad)
  const z = Math.cos(latRad) * Math.cos(lonRad)

  return { x, y, z }
}

function normalize(v: { x: number; y: number; z: number }) {
  const len = Math.hypot(v.x, v.y, v.z)
  return len === 0 ? { x: 0, y: 0, z: 0 } : { x: v.x / len, y: v.y / len, z: v.z / len }
}

function geodesicPoints(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
  steps = 24,
) {
  const dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z))
  const omega = Math.acos(dot)
  if (omega < 0.001) return [a, b]

  const sinOmega = Math.sin(omega)
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps
    const kA = Math.sin((1 - t) * omega) / sinOmega
    const kB = Math.sin(t * omega) / sinOmega
    return normalize({
      x: kA * a.x + kB * b.x,
      y: kA * a.y + kB * b.y,
      z: kA * a.z + kB * b.z,
    })
  })
}

const LAT_LINES = [-60, -30, 0, 30, 60]
const LNG_LINES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

export function EarthGlobe({ size = 380, className = "" }: EarthGlobeProps) {
  const [rotation, setRotation] = useState(0)
  const reduce = useReducedMotion()
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number>(0)

  useEffect(() => {
    if (reduce) return
    const SPEED_DEG_PER_SEC = 8
    const tick = (now: number) => {
      if (lastRef.current === 0) lastRef.current = now
      const dt = (now - lastRef.current) / 1000
      lastRef.current = now
      setRotation((r) => (r + dt * SPEED_DEG_PER_SEC) % 360)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      lastRef.current = 0
    }
  }, [reduce])

  // Sphere radius in unit fraction of `size` (0.46 → sphere diameter = 92% of size)
  const R_FRAC = 0.46

  const pins = useMemo(
    () =>
      COUNTRIES.map((c) => {
        const p = project(c.lat, c.lng, rotation)
        const visible = p.z > -0.05
        const opacity = visible ? Math.max(0.3, Math.min(1, p.z + 0.55)) : 0
        return { ...c, ...p, visible, opacity }
      }),
    [rotation],
  )
  const pinByName = useMemo(
    () => Object.fromEntries(pins.map((p) => [p.name, p])),
    [pins],
  )

  const stageSize = size * 1.45
  const toStageX = (x: number) => stageSize / 2 + x * size * R_FRAC
  const toStageY = (y: number) => stageSize / 2 - y * size * R_FRAC

  // SVG wireframe constants — viewBox 0..200, sphere center (100,100), radius 92.
  // 92/100 = 0.92 of half-width = 0.46 of full size → matches R_FRAC perfectly.
  const SVG_R = 92
  const SVG_CX = 100
  const SVG_CY = 100

  return (
    <div
      className={`relative ${className}`}
      style={{ width: stageSize, height: stageSize }}
      aria-label="Animated globe showing Siddhivinayak Overseas destination countries"
      role="img"
    >
      {/* Centered sphere stage */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: size, height: size }}
      >
        {/* Soft outer color halo */}
        <div
          aria-hidden="true"
          className="absolute rounded-full blur-3xl"
          style={{
            inset: `${-size * 0.18}px`,
            background:
              "radial-gradient(circle, oklch(0.78 0.17 55 / 0.32) 0%, oklch(0.55 0.12 145 / 0.12) 45%, transparent 75%)",
          }}
        />

        {/* Atmosphere ring */}
        <div
          aria-hidden="true"
          className="earth-atmosphere absolute rounded-full"
          style={{ inset: `${-size * 0.1}px` }}
        />

        {/* Counter-rotating decorative orbital rings */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ transform: "rotateX(72deg)" }}
        >
          <div className="earth-ring outer" />
          <div className="earth-ring" />
          <div className="earth-ring inner" />
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="relative h-full w-full"
          style={{ animation: "float-soft 6s ease-in-out infinite" }}
        >
          <div
            className="earth-sphere absolute inset-0 rounded-full overflow-hidden"
            style={{
              animation: "none",
              backgroundPosition: `center center, ${(-rotation / 360) * 100}% center`,
            }}
          />

          <svg
            aria-hidden="true"
            viewBox="0 0 200 200"
            width={size}
            height={size}
            className="pointer-events-none absolute inset-0"
          >
            <defs>
              <radialGradient id="specGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.32)" />
                <stop offset="60%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>

            {/* Latitude rings (horizontal chords — stay still) */}
            {LAT_LINES.map((phi) => {
              const y = SVG_CY - SVG_R * Math.sin((phi * Math.PI) / 180)
              const half = SVG_R * Math.cos((phi * Math.PI) / 180)
              return (
                <line
                  key={`lat-${phi}`}
                  x1={SVG_CX - half}
                  x2={SVG_CX + half}
                  y1={y}
                  y2={y}
                  stroke="rgba(255, 210, 135, 0.58)"
                  strokeOpacity={phi === 0 ? 0.65 : 0.32}
                  strokeWidth={phi === 0 ? 0.75 : 0.45}
                />
              )
            })}

            {/* Longitude meridians (ellipses — rotate with the globe) */}
            {LNG_LINES.map((lambda) => {
              const angle = ((lambda + rotation) * Math.PI) / 180
              const rx = SVG_R * Math.abs(Math.sin(angle))
              const front = Math.cos(angle) > 0
              return (
                <ellipse
                  key={`lng-${lambda}`}
                  cx={SVG_CX}
                  cy={SVG_CY}
                  rx={rx}
                  ry={SVG_R}
                  fill="none"
                  stroke="rgba(255, 210, 135, 0.72)"
                  strokeOpacity={front ? 0.45 : 0.2}
                  strokeWidth={front ? 0.6 : 0.4}
                />
              )
            })}

            {/* Specular highlight (top-left) */}
            <ellipse
              cx={SVG_CX - 28}
              cy={SVG_CY - 32}
              rx={42}
              ry={28}
              fill="url(#specGrad)"
            />

            {/* Sphere edge / horizon */}
            <circle
              cx={SVG_CX}
              cy={SVG_CY}
              r={SVG_R}
              fill="none"
              stroke="rgba(255, 200, 140, 0.9)"
              strokeOpacity={0.55}
              strokeWidth={0.9}
            />
          </svg>
        </motion.div>
      </div>

      {/* Animated flight-path arcs between accurate pin positions */}
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${stageSize} ${stageSize}`}
        className="absolute inset-0 h-full w-full pointer-events-none"
      >
        <defs>
          <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.78 0.17 55)" stopOpacity="0" />
            <stop offset="50%" stopColor="oklch(0.78 0.17 55)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="oklch(0.78 0.17 55)" stopOpacity="0" />
          </linearGradient>
          <marker
            id="arcArrow"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerUnits="strokeWidth"
            markerWidth="8"
            markerHeight="8"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255, 210, 135, 0.95)" />
          </marker>
        </defs>
        {ARC_PAIRS.map(([a, b], i) => {
          const A = pinByName[a]
          const B = pinByName[b]
          if (!A || !B) return null
          if (!A.visible && !B.visible) return null

          const arcPoints = geodesicPoints(A, B, 22)
            .map((point) => `${toStageX(point.x)} ${toStageY(point.y)}`)
            .join(" L ")
          const arcOpacity = Math.min(A.opacity, B.opacity)

          return (
            <path
              key={`${a}-${b}`}
              d={`M ${arcPoints}`}
              fill="none"
              stroke="url(#arcGrad)"
              markerEnd="url(#arcArrow)"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="3 6"
              style={{
                opacity: arcOpacity,
                animation: `arc-trail ${5 + i * 0.9}s ease-in-out infinite`,
                animationDelay: `${i * 0.55}s`,
                transition: "opacity 0.4s ease",
              }}
            />
          )
        })}
      </svg>

      {/* Country pins at exact lat/lng */}
      <div className="absolute inset-0 pointer-events-none">
        {pins.map((p, i) => {
          if (!p.visible) return null
          const left = toStageX(p.x)
          const top = toStageY(p.y)
          const labelSide = p.x >= 0 ? "right" : "left"

          return (
            <div
              key={p.name}
              className="absolute"
              style={{
                left,
                top,
                transform: "translate(-50%, -50%)",
                opacity: p.opacity,
                transition: "opacity 0.25s ease",
                zIndex: Math.round((p.z + 1) * 100),
              }}
            >
              <div className="relative flex items-center">
                {labelSide === "left" && (
                  <span
                    className="mr-2 whitespace-nowrap rounded-full border border-primary/40 bg-card/90 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-foreground shadow-sm backdrop-blur-sm"
                    style={{ animation: "label-bob 3s ease-in-out infinite" }}
                  >
                    <FlagIcon country={p.name} className="text-sm" />
                  </span>
                )}
                <span
                  className="pin-marker"
                  style={{ animationDelay: `${(i % 4) * 0.4}s` }}
                />
                {labelSide === "right" && (
                  <span
                    className="ml-2 whitespace-nowrap rounded-full border border-primary/40 bg-card/90 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-foreground shadow-sm backdrop-blur-sm"
                    style={{ animation: "label-bob 3s ease-in-out infinite" }}
                  >
                    <FlagIcon country={p.name} className="text-sm" />
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
