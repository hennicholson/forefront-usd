import { modules } from '@/lib/data/modules'
import { notFound } from 'next/navigation'
import { ModuleViewer } from '@/components/module/ModuleViewer'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ModulePage({ params }: PageProps) {
  const { slug } = await params
  const module = modules.find(m => m.slug === slug)

  if (!module) notFound()

  const moduleIndex = modules.findIndex(m => m.id === module.id)

  return (
    <main className="bg-black text-white">
      <ModuleViewer
        module={module}
        moduleIndex={moduleIndex}
        totalModules={modules.length}
      />
    </main>
  )
}
