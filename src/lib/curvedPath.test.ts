import { describe, expect, it } from 'vitest'
import { arcBetween, curvePath, type LatLng } from './curvedPath'

const a: LatLng = [0, 0]
const b: LatLng = [0, 10]

describe('arcBetween', () => {
  it('starts and ends at the given points', () => {
    const arc = arcBetween(a, b)
    expect(arc[0]).toEqual(a)
    expect(arc[arc.length - 1]).toEqual(b)
  })

  it('bows away from the straight line in the middle', () => {
    const arc = arcBetween(a, b)
    const middle = arc[Math.floor(arc.length / 2)]
    expect(Math.abs(middle[0])).toBeGreaterThan(0)
  })
})

describe('curvePath', () => {
  it('returns the input unchanged for fewer than two points', () => {
    expect(curvePath([a])).toEqual([a])
    expect(curvePath([])).toEqual([])
  })

  it('keeps the first and last stop of the path', () => {
    const path = curvePath([a, b, [10, 10]])
    expect(path[0]).toEqual(a)
    expect(path[path.length - 1]).toEqual([10, 10])
  })

  it('adds intermediate points for every segment', () => {
    expect(curvePath([a, b]).length).toBeGreaterThan(2)
    expect(curvePath([a, b, [10, 10]]).length).toBeGreaterThan(curvePath([a, b]).length)
  })
})
