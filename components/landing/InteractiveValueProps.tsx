'use client'
import { FeatureSteps } from '@/components/ui/feature-section'

const features = [
  {
    step: 'Step 1',
    title: 'Learn From Peers',
    content: 'Your instructors? Students who just learned this last month. They remember exactly where you\'re stuck because they were just there. No corporate jargon, just real talk.',
    image: '/forefront1.jpg'
  },
  {
    step: 'Step 2',
    title: 'Move Fast',
    content: 'AI waits for no one. Our modules are bite-sized (10-30 min) so you can learn during lunch, between classes, or on your commute. Stack skills, not excuses.',
    image: '/forefront2.jpg'
  },
  {
    step: 'Step 3',
    title: 'Join The Movement',
    content: 'Over 1,250 students worldwide are racing ahead. Connect, collaborate, and learn together. This isn\'t just a course platform—it\'s a community preparing for the AI era.',
    image: '/forefront3.jpg'
  },
]

export function InteractiveValueProps() {
  return (
    <FeatureSteps
      features={features}
      title="Why Forefront?"
      scrollBased={true}
    />
  )
}