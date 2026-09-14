import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

type EarthSphereProps = {
  rotationSpeed: number
  paused: boolean
}

/**
 * Procedural Earth — no external texture. Depth reads from lighting alone:
 * a cool navy base plus a warm rim light standing in for a "sunrise" side.
 */
export function EarthSphere({ rotationSpeed, paused }: EarthSphereProps) {
  const meshRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (paused || !meshRef.current) return
    meshRef.current.rotation.y += delta * rotationSpeed
  })

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <sphereGeometry args={[2.05, 96, 96]} />
      <meshStandardMaterial
        color="#0d2a4d"
        roughness={0.7}
        metalness={0.15}
        emissive="#081a33"
        emissiveIntensity={0.35}
      />
    </mesh>
  )
}
