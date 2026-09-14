import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Atmospheric scattering: a thin blue rim hugging the limb of the planet
 * (BackSide so only the edge catches light), plus a wider, fainter bloom.
 * Kept restrained — real atmosphere is a sliver, not a halo.
 */
export function Atmosphere() {
  const rimRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    if (!rimRef.current) return
    rimRef.current.opacity = 0.16 + Math.sin(clock.elapsedTime * 0.6) * 0.025
  })

  return (
    <group>
      <mesh scale={1.018}>
        <sphereGeometry args={[2.05, 64, 64]} />
        <meshBasicMaterial
          ref={rimRef}
          color="#7cc4ff"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={1.075}>
        <sphereGeometry args={[2.05, 48, 48]} />
        <meshBasicMaterial
          color="#3f8fd0"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
