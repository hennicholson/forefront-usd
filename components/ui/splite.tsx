'use client'

import { Suspense, lazy, useRef, useEffect, useState } from 'react'
import type { Application } from '@splinetool/runtime'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
  onLoad?: (spline: Application) => void
}

export function SplineScene({ scene, className, onLoad }: SplineSceneProps) {
  const [splineApp, setSplineApp] = useState<Application | null>(null)

  const handleLoad = (spline: Application) => {
    setSplineApp(spline)
    if (onLoad) {
      onLoad(spline)
    }
  }

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="loader"></span>
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
        onLoad={handleLoad}
      />
    </Suspense>
  )
}
