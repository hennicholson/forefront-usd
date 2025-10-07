import { ModuleCard } from './ModuleCard'
import type { Module } from '@/lib/data/modules'

interface ModuleGridProps {
  modules: Module[]
}

export function ModuleGrid({ modules }: ModuleGridProps) {
  return (
    <section id="modules" className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-white mb-8">Explore Modules</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map(module => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>
    </section>
  )
}
