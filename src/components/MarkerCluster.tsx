import 'leaflet.markercluster'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'
import type { ReactNode } from 'react'
import L from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'

type Props = {
  clustered?: boolean
  children: ReactNode
}

function formatCount(count: number): string {
  if (count < 1000) return String(count)
  const k = count / 1000
  return `${k < 10 ? +k.toFixed(1) : Math.round(k)}k`
}

function createClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount()
  const size = count < 10 ? 28 : count < 100 ? 32 : count < 1000 ? 36 : 40
  return L.divIcon({
    html: `<div style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:9999px;background:#39BBDE;color:#fff;border:2px solid #fff;font-weight:600;font-size:12px;box-shadow:0 1px 4px rgba(15,23,42,0.35)">${formatCount(count)}</div>`,
    className: 'travel-cluster',
    iconSize: L.point(size, size, true),
  })
}

function MarkerCluster({ clustered = true, children }: Props) {
  if (!clustered) return <>{children}</>
  return (
    <MarkerClusterGroup
      iconCreateFunction={createClusterIcon}
      chunkedLoading
      showCoverageOnHover={false}
      maxClusterRadius={10}
    >
      {children}
    </MarkerClusterGroup>
  )
}

export default MarkerCluster
