export const STAR_PATH =
  'M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z'

function StarShape({ fill }: { fill: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[1em]">
      <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full fill-slate-300">
        <path d={STAR_PATH} />
      </svg>
      {fill > 0 ? (
        <span
          className="absolute left-0 top-0 h-full overflow-hidden"
          style={{ width: `${fill * 100}%` }}
        >
          <svg
            viewBox="0 0 24 24"
            className="absolute left-0 top-0 h-[1em] w-[1em] fill-yellow-400"
          >
            <path d={STAR_PATH} />
          </svg>
        </span>
      ) : null}
    </span>
  )
}

type Props = {
  value: number
  className?: string
}

function StarDisplay({ value, className = '' }: Props) {
  return (
    <span className={`inline-flex gap-0.5 leading-none ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarShape key={star} fill={value >= star ? 1 : value >= star - 0.5 ? 0.5 : 0} />
      ))}
    </span>
  )
}

export default StarDisplay
