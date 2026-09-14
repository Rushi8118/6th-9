import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

type LocationMarkerProps = {
  position: THREE.Vector3
  color: string
  label: string
  sublabel?: string
  isOrigin?: boolean
  isActive: boolean
  onHoverChange: (hovered: boolean) => void
  onSelect: () => void
}

/** A destination pin: glow sphere, pulsing halo, short stem, hover tooltip. */
export function LocationMarker({
  position,
  color,
  label,
  sublabel,
  isOrigin,
  isActive,
  onHoverChange,
  onSelect,
}: LocationMarkerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const baseScale = isOrigin ? 1.3 : 1
  const targetScale = (hovered || isActive) ? baseScale * 1.35 : baseScale

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15)
    }
    if (haloRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * (isOrigin ? 2.2 : 1.6)) * 0.25
      haloRef.current.scale.setScalar(pulse)
    }
  })

  const stemDirection = position.clone().normalize()
  const stemLength = 0.12
  const stemPosition = position.clone().addScaledVector(stemDirection, stemLength / 2)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), stemDirection)

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
        onHoverChange(true)
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        setHovered(false)
        onHoverChange(false)
      }}
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}
    >
      <mesh position={stemPosition} quaternion={quaternion}>
        <cylinderGeometry args={[0.006, 0.006, stemLength, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[isOrigin ? 0.11 : 0.08, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[isOrigin ? 0.055 : 0.04, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.1} roughness={0.3} metalness={isOrigin ? 0.6 : 0.2} />
      </mesh>
      {(hovered || isActive) && (
        <Html distanceFactor={8} position={[0, isOrigin ? 0.22 : 0.16, 0]} center occlude>
          <div className="pointer-events-none whitespace-nowrap rounded-lg border border-white/15 bg-[#0b1530]/90 px-2.5 py-1.5 text-xs text-white shadow-lg backdrop-blur-md">
            <p className="font-semibold" style={{ color }}>{label}</p>
            {sublabel && <p className="text-[10px] text-white/60">{sublabel}</p>}
          </div>
        </Html>
      )}
    </group>
  )
}
