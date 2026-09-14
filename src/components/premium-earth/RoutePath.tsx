import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { RouteParticle } from './RouteParticle'

type RoutePathProps = {
  curve: THREE.CatmullRomCurve3
  color: string
  speed: number
  delay: number
  paused: boolean
  active: boolean
  reducedMotion: boolean
}

/** A single curved route: the line itself plus its travelling particle. */
export function RoutePath({ curve, color, speed, delay, paused, active, reducedMotion }: RoutePathProps) {
  const points = curve.getPoints(100)

  return (
    <group>
      <Line
        points={points}
        color={color}
        transparent
        opacity={active ? 0.85 : 0.4}
        lineWidth={active ? 2 : 1}
      />
      {!reducedMotion && (
        <RouteParticle curve={curve} color={color} speed={speed} delay={delay} paused={paused} active={active} />
      )}
    </group>
  )
}
