import type { ReactNode } from 'react'

export const STAMP_ICONS: Record<string, ReactNode> = {
  pin: (
    <>
      <path d="M100 72 C86 72 76 82 76 96 C76 112 100 132 100 132 C100 132 124 112 124 96 C124 82 114 72 100 72 Z" />
      <circle cx="100" cy="95" r="9" />
    </>
  ),
  map: (
    <>
      <path d="M76 84 L100 78 L124 84 L124 122 L100 128 L76 122 Z" />
      <path d="M92 80 L92 126 M108 80 L108 126" />
    </>
  ),
  globe: (
    <>
      <circle cx="100" cy="100" r="27" />
      <path d="M100 73 L100 127 M73 100 L127 100" />
      <path d="M80 84 C90 92 110 92 120 84 M80 116 C90 108 110 108 120 116" />
      <ellipse cx="100" cy="100" rx="12" ry="27" />
    </>
  ),
  trophy: (
    <>
      <path d="M79 74 L121 74 L114 99 Q100 115 86 99 Z" />
      <path d="M79 79 C62 79 62 101 83 100" />
      <path d="M121 79 C138 79 138 101 117 100" />
      <path d="M92 108 L108 108" />
      <path d="M97 108 L97 121 M103 108 L103 121" />
      <path d="M88 121 L112 121 L108 131 L92 131 Z" />
      <path
        fill="currentColor"
        stroke="none"
        d="M100 82 l2.7 5.5 6 0.9 -4.4 4.3 1.1 6 -5.4 -2.8 -5.4 2.8 1.1 -6 -4.4 -4.3 6 -0.9 Z"
      />
    </>
  ),
  medal: (
    <>
      <path d="M88 75 L98 96 M112 75 L102 96" />
      <circle cx="100" cy="112" r="16" />
      <path
        fill="currentColor"
        stroke="none"
        d="M100 104.5 L101.76 109.57 L107.13 109.68 L102.85 112.93 L104.41 118.07 L100 115 L95.59 118.07 L97.15 112.93 L92.87 109.68 L98.24 109.57 Z"
      />
    </>
  ),
  flag: (
    <>
      <path d="M82 74 L82 130" />
      <path d="M82 78 L118 78 C112 86 124 90 118 98 L82 98 Z" />
    </>
  ),
  compass: (
    <>
      <circle cx="100" cy="100" r="27" />
      <path d="M112 88 L104 104 L88 112 L96 96 Z" />
      <circle cx="100" cy="100" r="2.6" fill="currentColor" stroke="none" />
    </>
  ),
  mountain: (
    <>
      <path d="M72 124 L94 82 L110 108 L120 92 L130 124 Z" />
    </>
  ),
  plate: (
    <>
      <path d="M85 74 L85 90 M91 74 L91 90 M97 74 L97 90 M91 90 L91 128" />
      <path d="M112 74 C121 80 121 98 112 102 L112 128" />
    </>
  ),
  glass: (
    <>
      <path d="M78 82 L122 82 L100 108 Z" />
      <path d="M100 108 L100 126 M88 126 L112 126" />
      <circle cx="109" cy="90" r="3" fill="currentColor" stroke="none" />
    </>
  ),
  tree: (
    <>
      <path d="M100 74 L84 98 L94 98 L80 118 L120 118 L106 98 L116 98 Z" />
      <path d="M100 118 L100 130 M92 130 L108 130" />
    </>
  ),
  building: (
    <>
      <path d="M76 92 L100 76 L124 92 Z" />
      <path d="M82 96 L82 120 M92 96 L92 120 M108 96 L108 120 M118 96 L118 120" />
      <path d="M77 96 L123 96 M74 124 L126 124" />
    </>
  ),
  camera: (
    <>
      <path d="M74 90 L86 90 L92 82 L108 82 L114 90 L126 90 L126 124 L74 124 Z" />
      <circle cx="100" cy="106" r="13" />
      <circle cx="100" cy="106" r="6" />
    </>
  ),
  suitcase: (
    <>
      <path d="M78 92 L122 92 L122 126 L78 126 Z" />
      <path d="M90 92 L90 84 L110 84 L110 92" />
      <path d="M78 104 L122 104" />
    </>
  ),
  book: (
    <>
      <path d="M100 84 C92 78 82 78 74 82 L74 122 C82 118 92 118 100 124 C108 118 118 118 126 122 L126 82 C118 78 108 78 100 84 Z" />
      <path d="M100 84 L100 124" />
    </>
  ),
  megaphone: (
    <>
      <path d="M80 94 L104 84 L104 116 L80 106 Z" />
      <path d="M112 90 C118 96 118 104 112 110" />
      <path d="M119 86 C127 95 127 105 119 114" />{' '}
    </>
  ),
}
