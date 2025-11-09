import Link from 'next/link'
import { Button } from './Button'

export function Navigation() {
  return (
    <nav className="sticky top-0 z-50 bg-dark/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white">
          ForeFront <span className="text-forefront-cyan">USD</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/#modules" className="text-gray-300 hover:text-white transition-colors">
            Modules
          </Link>
          <Link href="/workflows" className="text-gray-300 hover:text-white transition-colors">
            Workflows
          </Link>
          <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
            About
          </Link>
          <Button size="sm">Join Club</Button>
        </div>
      </div>
    </nav>
  )
}
