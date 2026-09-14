import { Component, Suspense, useMemo, useRef, useState, type ElementRef, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { EarthSphere, EARTH_TEXTURES } from './EarthSphere'
import { Atmosphere } from './Atmosphere'
import { StarField } from './StarField'
import { RouteNetwork } from './RouteNetwork'
import { DESTINATIONS } from '@/data/destinations'

/** Earth's real axial tilt. */
const AXIAL_TILT = 23.4 * (Math.PI / 180)
/** Starting spin, chosen to present India/Asia/Europe — Surat is the origin. */
const INITIAL_SPIN = -1.35

type EarthSceneProps = {
  selectedId: string | null
  hoveredId: string | null
  onSelect: (id: string) => void
  onHoverChange: (id: string | null) => void
  paused: boolean
  dark?: boolean
  className?: string
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

function EarthFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#0b1530] to-[#070d1c] text-center">
      <span className="text-4xl" role="img" aria-label="Globe">🌍</span>
      <p className="max-w-[220px] text-sm text-white/60">
        3D preview isn&apos;t available on this device — the route network still works via the destination list below.
      </p>
    </div>
  )
}

class EarthErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) return <EarthFallback />
    return this.props.children
  }
}

/** Three thin orbital rings — gold, cyan, violet — each drifting at its own rate. */
function OrbitalRings() {
  const goldRef = useRef<THREE.Mesh>(null)
  const cyanRef = useRef<THREE.Mesh>(null)
  const violetRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (goldRef.current) goldRef.current.rotation.z += delta * 0.05
    if (cyanRef.current) cyanRef.current.rotation.z -= delta * 0.035
    if (violetRef.current) violetRef.current.rotation.z += delta * 0.02
  })

  return (
    <group>
      <mesh ref={goldRef} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.65, 0.006, 8, 128]} />
        <meshBasicMaterial color="#e8b84b" transparent opacity={0.35} />
      </mesh>
      <mesh ref={cyanRef} rotation={[Math.PI / 2, Math.PI / 6, 0]}>
        <torusGeometry args={[2.85, 0.005, 8, 128]} />
        <meshBasicMaterial color="#5fd8ff" transparent opacity={0.25} />
      </mesh>
      <mesh ref={violetRef} rotation={[Math.PI / 2.2, -Math.PI / 5, 0]}>
        <torusGeometry args={[3.05, 0.004, 8, 128]} />
        <meshBasicMaterial color="#b58bff" transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

type RotatingEarthProps = Omit<EarthSceneProps, 'dark' | 'className'> & { reducedMotion: boolean }

/**
 * The planet as a single rigid body: surface, clouds, atmosphere and the
 * whole route network share one spin, so every city marker stays pinned to
 * its real coordinates as the Earth turns.
 */
function RotatingEarth({
  selectedId,
  hoveredId,
  onSelect,
  onHoverChange,
  paused,
  reducedMotion,
}: RotatingEarthProps) {
  const spinRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (paused || reducedMotion || !spinRef.current) return
    spinRef.current.rotation.y += delta * 0.045
  })

  return (
    <group rotation={[0, 0, AXIAL_TILT]}>
      <group ref={spinRef} rotation={[0, INITIAL_SPIN, 0]}>
        <EarthSphere paused={paused || reducedMotion} />
        <Atmosphere />
        <RouteNetwork
          destinations={DESTINATIONS}
          selectedId={selectedId}
          hoveredId={hoveredId}
          onSelect={onSelect}
          onHoverChange={onHoverChange}
          paused={paused}
          reducedMotion={reducedMotion}
        />
      </group>
    </group>
  )
}

/**
 * The full Three.js Earth experience: photoreal globe, cloud shell,
 * atmosphere, orbital rings, starfield and the animated route network —
 * in an OrbitControls-driven Canvas with drag-to-rotate, no zoom/pan.
 */
export function EarthScene({ selectedId, hoveredId, onSelect, onHoverChange, paused, dark, className }: EarthSceneProps) {
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null)
  const [webglOk] = useState(() => hasWebGL())
  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  if (!webglOk) {
    return (
      <div className={className}>
        <EarthFallback />
      </div>
    )
  }

  return (
    <div className={className}>
      <EarthErrorBoundary>
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0.4, 8.6], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={[dark ? '#05070f' : '#070d1c']} />

          {/* Sun: one strong warm key light so the terminator reads as a real day/night line. */}
          <directionalLight position={[5, 1.5, 3]} intensity={dark ? 2 : 2.6} color="#fff6e6" />
          {/* Just enough fill to keep the night side legible rather than pure black. */}
          <ambientLight intensity={dark ? 0.1 : 0.16} />
          <hemisphereLight args={['#9fd8ff', '#0b1530', dark ? 0.12 : 0.2]} />

          <StarField reducedMotion={reducedMotion} />
          <OrbitalRings />

          <Suspense fallback={null}>
            <RotatingEarth
              selectedId={selectedId}
              hoveredId={hoveredId}
              onSelect={onSelect}
              onHoverChange={onHoverChange}
              paused={paused}
              reducedMotion={reducedMotion}
            />
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            enableZoom={false}
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI - Math.PI / 3}
          />
        </Canvas>
      </EarthErrorBoundary>
    </div>
  )
}

useTexture.preload(EARTH_TEXTURES)
