import { modules } from '@/lib/data/modules'
import { notFound } from 'next/navigation'
import { ModuleViewer } from '@/components/module/ModuleViewer'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ModulePage({ params }: PageProps) {
  const { slug } = await params
  const currentModule = modules.find(m => m.slug === slug)

  if (!currentModule) notFound()

  const moduleIndex = modules.findIndex(m => m.id === currentModule.id)

  return (
    <main className="bg-black text-white">
      <ModuleViewer
        module={currentModule}
        moduleIndex={moduleIndex}
        totalModules={modules.length}
      />
    </main>
  )
}
