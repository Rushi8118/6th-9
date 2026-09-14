import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

type StarFieldProps = {
  reducedMotion: boolean
}

const PARTICLE_COUNT = 220

function randomPointInShell(min: number, max: number) {
  const radius = min + Math.random() * (max - min)
  const theta = Math.random() * Math.PI * 2
  const phi = Math.acos(2 * Math.random() - 1)
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
  )
}

/**
 * Deep-space backdrop: drei's built-in star field for volume, plus a small
 * custom gold/cyan particle layer for brand color and gentle drift.
 */
export function StarField({ reducedMotion }: StarFieldProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)
    const gold = new THREE.Color('#e8b84b')
    const cyan = new THREE.Color('#5fd8ff')
    const white = new THREE.Color('#f4f1e8')

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const point = randomPointInShell(10, 40)
      positions.set([point.x, point.y, point.z], i * 3)

      const roll = Math.random()
      const color = roll < 0.35 ? gold : roll < 0.65 ? cyan : white
      colors.set([color.r, color.g, color.b], i * 3)

      sizes[i] = Math.random() * 0.6 + 0.2
    }

    return { positions, colors, sizes }
  }, [])

  useFrame((_, delta) => {
    if (reducedMotion || !pointsRef.current) return
    pointsRef.current.rotation.y += delta * 0.01
  })

  return (
    <group>
      <Stars radius={90} depth={45} count={1600} factor={2} fade speed={reducedMotion ? 0 : 0.25} />
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial size={0.12} vertexColors transparent opacity={0.85} sizeAttenuation depthWrite={false} />
      </points>
      {!reducedMotion && (
        <Sparkles count={40} scale={12} size={2.5} speed={0.3} color="#e8b84b" opacity={0.6} />
      )}
    </group>
  )
}
