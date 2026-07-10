import type { ReactNode } from 'react'

type Props = {
  id: string
  icon: ReactNode
  title: string
  ink: string
  earned: boolean
  progressText: string
  caption: string
}

function PassportStamp({ id, icon, title, ink, earned, progressText, caption }: Props) {
  const color = earned ? ink : '#94a3b8'
  const topId = `stamp-top-${id}`
  const botId = `stamp-bot-${id}`
  const titleSize = title.length > 11 ? 14 : title.length > 8 ? 16.5 : 20

  return (
    <svg
      viewBox="0 0 200 200"
      className="h-full w-full"
      role="img"
      aria-label={title}
      style={{ color }}
    >
      <defs>
        <path id={topId} d="M 38 100 A 62 62 0 0 1 162 100" />
        <path id={botId} d="M 164 100 A 60 60 0 0 1 36 100" />
      </defs>
      <g fill="none" stroke="currentColor" opacity={earned ? 1 : 0.55}>
        <circle
          cx="100"
          cy="100"
          r="92"
          strokeWidth="4"
          strokeDasharray={earned ? undefined : '7 6'}
        />
        <circle cx="100" cy="100" r="82" strokeWidth="1.6" />
        <circle
          cx="100"
          cy="100"
          r="55"
          strokeWidth="2.4"
          strokeDasharray="0.1 6"
          strokeLinecap="round"
        />
      </g>
      <g fill="currentColor" opacity={earned ? 1 : 0.55}>
        <text
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize={titleSize}
          fontWeight="700"
          letterSpacing="3"
          textAnchor="middle"
        >
          <textPath href={`#${topId}`} startOffset="50%">
            {title.toUpperCase()}
          </textPath>
        </text>
        {earned ? (
          <text
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="13"
            fontWeight="700"
            letterSpacing="4"
            textAnchor="middle"
          >
            <textPath href={`#${botId}`} startOffset="50%">
              {caption.toUpperCase()}
            </textPath>
          </text>
        ) : null}
        <path d="M25 100 L30 98 L32 93 L34 98 L39 100 L34 102 L32 107 L30 102 Z" />
        <path d="M161 100 L166 98 L168 93 L170 98 L175 100 L170 102 L168 107 L166 102 Z" />
      </g>
      {earned ? (
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="3.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          {icon}
        </g>
      ) : (
        <text
          x="100"
          y="100"
          fill="currentColor"
          fontSize="30"
          fontWeight="800"
          textAnchor="middle"
          dominantBaseline="central"
          opacity="0.55"
        >
          {progressText}
        </text>
      )}
    </svg>
  )
}

export default PassportStamp
