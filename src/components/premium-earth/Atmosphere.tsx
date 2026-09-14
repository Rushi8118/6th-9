import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * A soft cyan/blue glow shell behind the Earth's silhouette (BackSide +
 * additive blending), with a slow opacity pulse to keep it feeling alive
 * without becoming a distracting halo.
 */
export function Atmosphere() {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    if (!materialRef.current) return
    const pulse = 0.22 + Math.sin(clock.elapsedTime * 0.6) * 0.05
    materialRef.current.opacity = pulse
  })

  return (
    <mesh scale={1.09}>
      <sphereGeometry args={[2.05, 64, 64]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#3fd0ff"
        transparent
        opacity={0.22}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}
