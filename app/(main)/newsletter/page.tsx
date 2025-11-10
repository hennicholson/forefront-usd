'use client'
import { useEffect, useState } from 'react'
import { NewsletterShowcase } from '@/components/ui/newsletter-showcase'

interface Newsletter {
  id: number
  week: number
  date: string
  title: string
  content: {
    intro: string
    excerpt?: string
    image?: string
    contributors?: string[]
    sections: {
      title: string
      items: string[]
    }[]
    closing: string
  }
}

export default function NewsletterPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNewsletters()
  }, [])

  const fetchNewsletters = async () => {
    try {
      const res = await fetch('/api/newsletters')
      if (res.ok) {
        const data = await res.json()
        setNewsletters(data)
      }
    } catch (err) {
      console.error('Error loading newsletters:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500">Loading newsletters...</p>
        </div>
      </main>
    )
  }

  if (newsletters.length === 0) {
    return (
      <main className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">No Newsletters Yet</h1>
          <p className="text-zinc-500">
            Check back soon for weekly AI insights and student discoveries!
          </p>
        </div>
      </main>
    )
  }

  // Transform newsletters to match the component's expected format
  const transformedNewsletters = newsletters.map(nl => ({
    id: nl.id,
    week: nl.week,
    date: nl.date,
    title: nl.title,
    excerpt: nl.content.excerpt || nl.content.intro.substring(0, 150) + '...',
    image: nl.content.image,
    contributors: nl.content.contributors,
    content: {
      intro: nl.content.intro,
      sections: nl.content.sections,
      closing: nl.content.closing
    }
  }))

  return (
    <main className="bg-black text-white min-h-screen">
      <NewsletterShowcase newsletters={transformedNewsletters} />
    </main>
  )
}
