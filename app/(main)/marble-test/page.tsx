'use client'
import { MarbleBackground } from '@/components/ui/MarbleBackground'
import { useState } from 'react'

export default function MarbleTestPage() {
  const [veinCount, setVeinCount] = useState(12)
  const [veinOpacity, setVeinOpacity] = useState(0.3)
  const [veinWidth, setVeinWidth] = useState(50)
  const [noiseAmount, setNoiseAmount] = useState(10)

  return (
    <div className="min-h-screen bg-black relative">
      <MarbleBackground />

      {/* Control Panel */}
      <div className="relative z-10 p-8">
        <div className="max-w-2xl mx-auto bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Marble Background Test</h1>

          <div className="space-y-6">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Vein Count: {veinCount}
              </label>
              <input
                type="range"
                min="5"
                max="30"
                value={veinCount}
                onChange={(e) => setVeinCount(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Vein Opacity: {veinOpacity.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={veinOpacity}
                onChange={(e) => setVeinOpacity(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Vein Width: {veinWidth}
              </label>
              <input
                type="range"
                min="10"
                max="150"
                value={veinWidth}
                onChange={(e) => setVeinWidth(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Noise Amount: {noiseAmount}
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={noiseAmount}
                onChange={(e) => setNoiseAmount(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all"
            >
              Regenerate Pattern
            </button>
          </div>

          {/* Sample Content */}
          <div className="mt-12 space-y-4">
            <h2 className="text-2xl font-bold text-white">Sample Content</h2>
            <p className="text-gray-300 leading-relaxed">
              This is how text will look over the marble background. The background
              should be subtle enough to not interfere with readability while still
              providing a beautiful aesthetic.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                  <div className="w-12 h-12 bg-white/10 rounded-lg mb-3"></div>
                  <h3 className="text-white font-semibold mb-2">Card {i}</h3>
                  <p className="text-gray-400 text-sm">Sample card content</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="fixed bottom-4 right-4 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-lg px-4 py-2 text-xs text-gray-400">
        Navigate to: <code className="text-white">/marble-test</code>
      </div>
    </div>
  )
}
