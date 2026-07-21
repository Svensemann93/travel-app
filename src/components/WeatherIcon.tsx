import type { WeatherKind } from '../lib/weather'

type Props = {
  kind: WeatherKind
  className?: string
}

function WeatherIcon({ kind, className = '' }: Props) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      {kind === 'clear' && (
        <g>
          <circle cx="16" cy="16" r="6.5" fill="#FBBF24" />
          <g stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round">
            <path d="M16 3v3.5M16 25.5V29M3 16h3.5M25.5 16H29M6.5 6.5l2.5 2.5M23 23l2.5 2.5M6.5 25.5 9 23M23 9l2.5-2.5" />
          </g>
        </g>
      )}

      {kind === 'cloudy' && (
        <g>
          <circle cx="12" cy="12" r="5.5" fill="#FBBF24" />
          <g stroke="#FBBF24" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2.5v2.5M2.5 12H5M4.8 4.8l1.8 1.8M19.2 4.8l-1.8 1.8" />
          </g>
          <path
            d="M23 26H10.5a5 5 0 0 1-.5-9.97A6.5 6.5 0 0 1 22.6 17.2 4.4 4.4 0 0 1 23 26Z"
            fill="#E2E8F0"
            stroke="#CBD5E1"
            strokeWidth="1"
          />
        </g>
      )}

      {kind === 'fog' && (
        <g>
          <path
            d="M23 20H10.5a5 5 0 0 1-.5-9.97A6.5 6.5 0 0 1 22.6 11.2 4.4 4.4 0 0 1 23 20Z"
            fill="#E2E8F0"
          />
          <g stroke="#CBD5E1" strokeWidth="2.2" strokeLinecap="round">
            <path d="M7 24h18M9 28h14" />
          </g>
        </g>
      )}

      {kind === 'rain' && (
        <g>
          <path
            d="M23 20H10.5a5 5 0 0 1-.5-9.97A6.5 6.5 0 0 1 22.6 11.2 4.4 4.4 0 0 1 23 20Z"
            fill="#CBD5E1"
          />
          <g stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round">
            <path d="M11 23l-1.5 4M17 23l-1.5 4M23 23l-1.5 4" />
          </g>
        </g>
      )}

      {kind === 'snow' && (
        <g>
          <path
            d="M23 20H10.5a5 5 0 0 1-.5-9.97A6.5 6.5 0 0 1 22.6 11.2 4.4 4.4 0 0 1 23 20Z"
            fill="#E2E8F0"
          />
          <g fill="#93C5FD">
            <circle cx="11" cy="25" r="1.4" />
            <circle cx="16" cy="27" r="1.4" />
            <circle cx="21" cy="25" r="1.4" />
          </g>
        </g>
      )}

      {kind === 'storm' && (
        <g>
          <path
            d="M23 19H10.5a5 5 0 0 1-.5-9.97A6.5 6.5 0 0 1 22.6 10.2 4.4 4.4 0 0 1 23 19Z"
            fill="#94A3B8"
          />
          <path d="M16 19l-3 6h3l-2 5 6-8h-3.5l2-3Z" fill="#FBBF24" />
        </g>
      )}
    </svg>
  )
}

export default WeatherIcon
