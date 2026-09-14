import { useMemo } from 'react'
import * as THREE from 'three'
import { latLonToVector3 } from '@/lib/coordinates'
import { ORIGIN, type Destination } from '@/data/destinations'
import { RoutePath } from './RoutePath'
import { LocationMarker } from './LocationMarker'

const EARTH_RADIUS = 2.05

type RouteNetworkProps = {
  destinations: Destination[]
  selectedId: string | null
  hoveredId: string | null
  onSelect: (id: string) => void
  onHoverChange: (id: string | null) => void
  paused: boolean
  reducedMotion: boolean
}

/**
 * Lifts a great-circle path off the surface — just enough to read as a flight
 * arc without ballooning away from the planet. Longer hops rise a little
 * higher, the way real long-haul routes do.
 */
function buildRouteCurve(origin: THREE.Vector3, destination: THREE.Vector3) {
  const midpoint = origin.clone().add(destination).multiplyScalar(0.5)
  const arcHeight = EARTH_RADIUS * (1.08 + origin.distanceTo(destination) * 0.035)
  midpoint.normalize().multiplyScalar(arcHeight)
  return new THREE.CatmullRomCurve3([origin, midpoint, destination])
}

/** Builds and renders every Surat → destination curve, plus all markers. */
export function RouteNetwork({
  destinations,
  selectedId,
  hoveredId,
  onSelect,
  onHoverChange,
  paused,
  reducedMotion,
}: RouteNetworkProps) {
  const originPosition = useMemo(
    () => latLonToVector3(ORIGIN.latitude, ORIGIN.longitude, EARTH_RADIUS + 0.01),
    [],
  )

  const routes = useMemo(
    () =>
      destinations.map((destination, index) => {
        const destinationPosition = latLonToVector3(destination.latitude, destination.longitude, EARTH_RADIUS + 0.01)
        return {
          destination,
          position: destinationPosition,
          curve: buildRouteCurve(originPosition, destinationPosition),
          speed: 0.12 + (index % 3) * 0.04,
          delay: index / destinations.length,
        }
      }),
    [destinations, originPosition],
  )

  return (
    <group>
      {routes.map((route) => {
        const isActive = selectedId === route.destination.id || hoveredId === route.destination.id
        return (
          <RoutePath
            key={route.destination.id}
            curve={route.curve}
            color={route.destination.color}
            speed={route.speed}
            delay={route.delay}
            paused={paused}
            active={isActive}
            reducedMotion={reducedMotion}
          />
        )
      })}

      <LocationMarker
        position={originPosition}
        color={ORIGIN.color}
        label="Surat — Origin"
        isOrigin
        isActive={false}
        onHoverChange={() => {}}
        onSelect={() => {}}
      />

      {routes.map((route) => (
        <LocationMarker
          key={route.destination.id}
          position={route.position}
          color={route.destination.color}
          label={route.destination.city}
          sublabel={route.destination.country}
          isActive={selectedId === route.destination.id}
          onHoverChange={(hovered) => onHoverChange(hovered ? route.destination.id : null)}
          onSelect={() => onSelect(route.destination.id)}
        />
      ))}
    </group>
  )
}
