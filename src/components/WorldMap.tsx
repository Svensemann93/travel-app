import { useMemo } from 'react'
import { geoEqualEarth, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import worldTopo from 'world-atlas/countries-110m.json'
import { COUNTRY_NUMERIC } from '../lib/countryNumeric'

type Props = {
  visitedCodes: string[]
}

const WIDTH = 800
const HEIGHT = 380

function WorldMap({ visitedCodes }: Props) {
  const shapes = useMemo(() => {
    const topo = worldTopo as unknown as Topology
    const collection = feature(topo, topo.objects.countries as GeometryCollection)
    const projection = geoEqualEarth().fitSize([WIDTH, HEIGHT], collection)
    const toPath = geoPath(projection)
    return collection.features.map((f) => ({ id: String(f.id), d: toPath(f) ?? '' }))
  }, [])

  const visitedNumeric = useMemo(
    () =>
      new Set(
        visitedCodes
          .map((c) => COUNTRY_NUMERIC[c])
          .filter((n): n is string => Boolean(n))
          .map((n) => parseInt(n, 10)),
      ),
    [visitedCodes],
  )

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label="Weltkarte der besuchten Länder"
    >
      {shapes.map((s) =>
        s.d ? (
          <path
            key={s.id}
            d={s.d}
            fill={visitedNumeric.has(parseInt(s.id, 10)) ? '#39BBDE' : '#e2e8f0'}
            stroke="#ffffff"
            strokeWidth="0.4"
          />
        ) : null,
      )}
    </svg>
  )
}

export default WorldMap
