import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

type EarthSphereProps = {
  paused: boolean
}

export const EARTH_TEXTURES = [
  '/earth-blue-marble.jpg',
  '/earth-normal.jpg',
  '/earth-specular.jpg',
  '/earth-clouds.png',
]

/**
 * Photoreal Earth built on the NASA Blue Marble set already shipped in
 * /public: colour map for the surface, normal map for terrain relief, and a
 * specular map so only the oceans catch the sun. The cloud shell drifts a
 * little faster than the surface, the way real weather does.
 *
 * Rotation of the planet itself is owned by the parent group so the city
 * markers stay locked to their real coordinates — see EarthScene.
 */
export function EarthSphere({ paused }: EarthSphereProps) {
  const cloudsRef = useRef<THREE.Mesh>(null)
  const { gl } = useThree()

  const [colorMap, normalMap, specularMap, cloudMap] = useTexture(EARTH_TEXTURES, (loaded) => {
    const textures = Array.isArray(loaded) ? loaded : [loaded]
    const maxAnisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 4)
    const [color, , , clouds] = textures
    color.colorSpace = THREE.SRGBColorSpace
    clouds.colorSpace = THREE.SRGBColorSpace
    textures.forEach((texture) => {
      texture.anisotropy = maxAnisotropy
    })
  })

  useFrame((_, delta) => {
    // Clouds drift slightly ahead of the surface rotation.
    if (paused || !cloudsRef.current) return
    cloudsRef.current.rotation.y += delta * 0.012
  })

  return (
    <group>
      <mesh>
        <sphereGeometry args={[2.05, 96, 96]} />
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.85, 0.85)}
          specularMap={specularMap}
          specular={new THREE.Color(0x446688)}
          shininess={32}
        />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.078, 64, 64]} />
        <meshPhongMaterial
          map={cloudMap}
          transparent
          opacity={0.38}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
