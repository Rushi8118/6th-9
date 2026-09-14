export type Destination = {
  id: string
  city: string
  country: string
  latitude: number
  longitude: number
  color: string
  pathway: string
  blurb: string
  /** Existing in-app route this destination links out to. */
  href: string
}

export const ORIGIN = {
  city: 'Surat',
  country: 'India',
  latitude: 21.1702,
  longitude: 72.8311,
  color: '#e8b84b',
} as const

export const DESTINATIONS: Destination[] = [
  {
    id: 'toronto',
    city: 'Toronto',
    country: 'Canada',
    latitude: 43.6532,
    longitude: -79.3832,
    color: '#62b5ff',
    pathway: 'Study visa • Work pathway',
    blurb: 'Explore courses, career options and application guidance.',
    href: '/countries/canada',
  },
  {
    id: 'london',
    city: 'London',
    country: 'United Kingdom',
    latitude: 51.5072,
    longitude: -0.1276,
    color: '#e8b84b',
    pathway: 'Study visa • Skilled Worker pathway',
    blurb: 'Explore courses, career options and application guidance.',
    href: '/countries/uk',
  },
  {
    id: 'sydney',
    city: 'Sydney',
    country: 'Australia',
    latitude: -33.8688,
    longitude: 151.2093,
    color: '#9dffce',
    pathway: 'Study visa • Work pathway',
    blurb: 'Explore courses, career options and application guidance.',
    href: '/countries/australia',
  },
  {
    id: 'tokyo',
    city: 'Tokyo',
    country: 'Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    color: '#d09cff',
    pathway: 'SSW • Engineer visa pathway',
    blurb: 'Explore courses, career options and application guidance.',
    href: '/countries/japan',
  },
  {
    id: 'berlin',
    city: 'Berlin',
    country: 'Germany',
    latitude: 52.52,
    longitude: 13.405,
    color: '#65d6ff',
    pathway: 'Study visa • EU Blue Card pathway',
    blurb: 'Explore courses, career options and application guidance.',
    href: '/countries/germany',
  },
  {
    id: 'new-york',
    city: 'New York',
    country: 'United States',
    latitude: 40.7128,
    longitude: -74.006,
    color: '#ff9b7a',
    pathway: 'Study visa • Work pathway',
    blurb: 'Explore courses, career options and application guidance.',
    href: '/countries/usa',
  },
]
