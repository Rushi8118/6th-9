import * as THREE from 'three'

/**
 * Converts a latitude/longitude pair into a point on a sphere of the given
 * radius, using the same axis convention as the Earth mesh (Y-up, prime
 * meridian facing +Z) so markers/routes line up with the rendered globe.
 */
export function latLonToVector3(latitude: number, longitude: number, radius: number): THREE.Vector3 {
  const phi = (90 - latitude) * (Math.PI / 180)
  const theta = (longitude + 180) * (Math.PI / 180)

  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)

  return new THREE.Vector3(x, y, z)
}
