type Props = {
  label: string
}

function ReviewStamp({ label }: Props) {
  return (
    <svg viewBox="0 0 100 100" className="h-20 w-20 shrink-0 -rotate-[11deg]" aria-hidden="true">
      <defs>
        <path id="review-stamp-ring" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
      </defs>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#F4C15A" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#F4C15A" strokeWidth="1.5" opacity="0.8" />
      <text fontFamily="ui-monospace, monospace" fontSize="8.4" letterSpacing="2" fill="#F4C15A">
        <textPath href="#review-stamp-ring" startOffset="2%">
          {label}
        </textPath>
      </text>
      <g
        stroke="#F4C15A"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        transform="translate(50 50)"
      >
        <circle cx="0" cy="0" r="13" />
        <ellipse cx="0" cy="0" rx="13" ry="5" />
        <ellipse cx="0" cy="0" rx="5" ry="13" />
        <line x1="-13" y1="0" x2="13" y2="0" />
      </g>
    </svg>
  )
}

export default ReviewStamp
