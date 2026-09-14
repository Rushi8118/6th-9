import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type RouteParticleProps = {
  curve: THREE.CatmullRomCurve3
  color: string
  speed: number
  delay: number
  paused: boolean
  active: boolean
}

/**
 * A glowing traveller that loops along a route curve. Position is written
 * straight to the mesh refs inside useFrame — no React state involved — so
 * six of these animating at once stays cheap.
 */
export function RouteParticle({ curve, color, speed, delay, paused, active }: RouteParticleProps) {
  const coreRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const progressRef = useRef(delay)

  useFrame(({ clock }, delta) => {
    if (!coreRef.current || !glowRef.current) return
    if (!paused) {
      progressRef.current = (clock.elapsedTime * speed + delay) % 1
    }
    const point = curve.getPointAt(progressRef.current)
    coreRef.current.position.copy(point)
    glowRef.current.position.copy(point)

    const pulse = 0.85 + Math.sin(clock.elapsedTime * 4 + delay * 10) * 0.15
    const scale = active ? pulse * 1.4 : pulse
    glowRef.current.scale.setScalar(scale)
    void delta
  })

  return (
    <group>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.55 : 0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}
