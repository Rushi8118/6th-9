import { Component, Suspense, useMemo, useRef, useState, type ElementRef, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { EarthSphere } from './EarthSphere'
import { Atmosphere } from './Atmosphere'
import { StarField } from './StarField'
import { RouteNetwork } from './RouteNetwork'
import { DESTINATIONS } from '@/data/destinations'

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

/** Three small orbital rings around the Earth — gold, cyan, violet. */
function OrbitalRings() {
  const goldRef = useRef<THREE.Mesh>(null)
  const cyanRef = useRef<THREE.Mesh>(null)
  const violetRef = useRef<THREE.Mesh>(null)

  useMemo(() => {
    // no-op memo kept for parity with other components' pattern; rotation below.
  }, [])

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

/** Very thin latitude/longitude grid, integrated as a near-transparent wireframe shell. */
function EarthGrid() {
  return (
    <mesh scale={1.002}>
      <sphereGeometry args={[2.05, 24, 16]} />
      <meshBasicMaterial color="#9fd8ff" wireframe transparent opacity={0.06} />
    </mesh>
  )
}

/**
 * The full Three.js Earth experience: sphere, atmosphere, grid, orbital
 * rings, starfield and the animated route network — wrapped in an
 * OrbitControls-driven Canvas with drag-to-rotate and damping, no zoom/pan.
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
        <Suspense fallback={<EarthFallback />}>
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0.4, 6], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
          >
            <color attach="background" args={[dark ? '#05070f' : '#0b1530']} />
            <ambientLight intensity={dark ? 0.25 : 0.4} />
            <directionalLight position={[4, 2, 3]} intensity={dark ? 0.6 : 1} color="#f5d78e" />
            <pointLight position={[-4, -2, -3]} intensity={0.4} color="#3fd0ff" />

            <StarField reducedMotion={reducedMotion} />
            <EarthSphere rotationSpeed={reducedMotion ? 0 : 0.045} paused={paused || reducedMotion} />
            <EarthGrid />
            <Atmosphere />
            <OrbitalRings />
            <RouteNetwork
              destinations={DESTINATIONS}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onSelect={onSelect}
              onHoverChange={onHoverChange}
              paused={paused}
              reducedMotion={reducedMotion}
            />

            <OrbitControls
              ref={controlsRef}
              enableZoom={false}
              enablePan={false}
              enableDamping
              dampingFactor={0.08}
              autoRotate={!paused && !reducedMotion}
              autoRotateSpeed={0.4}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI - Math.PI / 3}
            />
          </Canvas>
        </Suspense>
      </EarthErrorBoundary>
    </div>
  )
}
