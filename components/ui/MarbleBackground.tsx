'use client'

export function MarbleBackground() {
  return (
    <div
      className="fixed inset-0 w-full h-full"
      style={{
        zIndex: 0,
        pointerEvents: 'none'
      }}
    >
      {/* Black base layer */}
      <div className="absolute inset-0 bg-black" />

      {/* SVG Marble overlay */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: 0.15,
          mixBlendMode: 'screen'
        }}
      >
        <defs>
          <filter id="marble-filter" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008"
              numOctaves="4"
              seed="2"
            />
            <feColorMatrix
              type="matrix"
              values="1 1 1 0 0
                      1 1 1 0 0
                      1 1 1 0 0
                      0 0.5 0 1 0"
            />
          </filter>
        </defs>
        <rect
          width="100%"
          height="100%"
          filter="url(#marble-filter)"
          fill="white"
        />
      </svg>

      {/* Subtle gradient overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)',
          opacity: 0.5
        }}
      />
    </div>
  )
}
