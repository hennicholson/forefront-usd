import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { modules } from '@/lib/data/modules'

interface CourseObjectivesProps {
  keyTakeaways: string[]
  relatedModules: string[]
}

export function CourseObjectives({ keyTakeaways, relatedModules }: CourseObjectivesProps) {
  const related = modules.filter(m => relatedModules.includes(String(m.id)))

  return (
    <section className="mt-16 space-y-8">
      {/* Completion message */}
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-forefront-green/20 rounded-full mb-6">
          <CheckCircle2 size={40} className="text-forefront-green" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Course Complete! 🎉</h2>
        <p className="text-xl text-gray-400">You&apos;ve mastered the fundamentals</p>
      </div>

      {/* Key takeaways */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
        <h3 className="text-2xl font-bold text-white mb-6">What You&apos;ve Learned</h3>
        <ul className="space-y-3">
          {keyTakeaways.map((takeaway, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-300">
              <CheckCircle2 size={20} className="text-forefront-green mt-1 flex-shrink-0" />
              <span className="text-lg">{takeaway}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Next steps */}
      <div className="bg-gradient-to-br from-forefront-blue/20 to-forefront-purple/20 rounded-2xl border border-forefront-blue/30 p-8">
        <h3 className="text-2xl font-bold text-white mb-4">Next Steps</h3>
        <ul className="space-y-2 mb-6">
          <li className="text-gray-300">→ Apply what you&apos;ve learned in a real project</li>
          <li className="text-gray-300">→ Share your work with the ForeFront USD community</li>
          <li className="text-gray-300">→ Explore related modules below</li>
        </ul>
        <Button>Join the Community</Button>
      </div>

      {/* Related modules */}
      {related.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-white mb-6">Continue Learning</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {related.map(module => (
              <Link key={module.id} href={`/modules/${module.slug}`}>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-forefront-blue/50 transition-all">
                  <div
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-3"
                    style={{ backgroundColor: module.categoryColor }}
                  >
                    {module.category.toUpperCase()}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{module.title}</h4>
                  <p className="text-sm text-gray-400">{module.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
