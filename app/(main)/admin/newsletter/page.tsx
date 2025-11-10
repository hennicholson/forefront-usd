'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Save, Trash2, Eye, Check } from 'lucide-react'

interface Newsletter {
  id?: number
  week: number
  date: string
  title: string
  content: {
    intro: string
    excerpt: string
    image?: string
    contributors?: string[]
    sections: {
      title: string
      items: string[]
    }[]
    closing: string
  }
  isCurrent: boolean
}

export default function AdminNewsletterPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/')
      return
    }
    fetchNewsletters()
  }, [isAuthenticated, user, router])

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

  const createNewNewsletter = () => {
    const newWeek = newsletters.length > 0 ? Math.max(...newsletters.map(n => n.week)) + 1 : 1
    setSelectedNewsletter({
      week: newWeek,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      title: 'Weekly AI Update',
      content: {
        intro: 'Welcome to this week\'s AI insights and student discoveries.',
        excerpt: 'The latest AI breakthroughs and student achievements.',
        image: 'https://placehold.co/1200x700/0a0a0a/ffffff/png?text=Newsletter+Header',
        contributors: [],
        sections: [
          {
            title: 'This Week in AI',
            items: ['Update 1', 'Update 2']
          }
        ],
        closing: 'Stay curious. Keep building. Spread the sauce.'
      },
      isCurrent: newsletters.length === 0
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!selectedNewsletter) return

    try {
      const method = selectedNewsletter.id ? 'PUT' : 'POST'
      const res = await fetch('/api/newsletters', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedNewsletter)
      })

      if (res.ok) {
        setSuccess('Newsletter saved successfully!')
        setTimeout(() => setSuccess(''), 2000)
        await fetchNewsletters()
        setIsEditing(false)
        setSelectedNewsletter(null)
      }
    } catch (err) {
      console.error('Error saving newsletter:', err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this newsletter?')) return

    try {
      const res = await fetch(`/api/newsletters?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setSuccess('Newsletter deleted successfully!')
        setTimeout(() => setSuccess(''), 2000)
        await fetchNewsletters()
        if (selectedNewsletter?.id === id) {
          setSelectedNewsletter(null)
          setIsEditing(false)
        }
      }
    } catch (err) {
      console.error('Error deleting newsletter:', err)
    }
  }

  const addSection = () => {
    if (!selectedNewsletter) return
    setSelectedNewsletter({
      ...selectedNewsletter,
      content: {
        ...selectedNewsletter.content,
        sections: [
          ...selectedNewsletter.content.sections,
          { title: 'New Section', items: ['Item 1'] }
        ]
      }
    })
  }

  const updateSection = (index: number, field: 'title' | 'items', value: string | string[]) => {
    if (!selectedNewsletter) return
    const newSections = [...selectedNewsletter.content.sections]
    newSections[index] = { ...newSections[index], [field]: value }
    setSelectedNewsletter({
      ...selectedNewsletter,
      content: { ...selectedNewsletter.content, sections: newSections }
    })
  }

  const deleteSection = (index: number) => {
    if (!selectedNewsletter) return
    const newSections = selectedNewsletter.content.sections.filter((_, i) => i !== index)
    setSelectedNewsletter({
      ...selectedNewsletter,
      content: { ...selectedNewsletter.content, sections: newSections }
    })
  }

  const addItemToSection = (sectionIndex: number) => {
    if (!selectedNewsletter) return
    const newSections = [...selectedNewsletter.content.sections]
    newSections[sectionIndex].items.push('New item')
    setSelectedNewsletter({
      ...selectedNewsletter,
      content: { ...selectedNewsletter.content, sections: newSections }
    })
  }

  const updateSectionItem = (sectionIndex: number, itemIndex: number, value: string) => {
    if (!selectedNewsletter) return
    const newSections = [...selectedNewsletter.content.sections]
    newSections[sectionIndex].items[itemIndex] = value
    setSelectedNewsletter({
      ...selectedNewsletter,
      content: { ...selectedNewsletter.content, sections: newSections }
    })
  }

  const deleteItem = (sectionIndex: number, itemIndex: number) => {
    if (!selectedNewsletter) return
    const newSections = [...selectedNewsletter.content.sections]
    newSections[sectionIndex].items = newSections[sectionIndex].items.filter((_, i) => i !== itemIndex)
    setSelectedNewsletter({
      ...selectedNewsletter,
      content: { ...selectedNewsletter.content, sections: newSections }
    })
  }

  const addContributor = () => {
    if (!selectedNewsletter) return
    const contributors = selectedNewsletter.content.contributors || []
    setSelectedNewsletter({
      ...selectedNewsletter,
      content: {
        ...selectedNewsletter.content,
        contributors: [...contributors, 'https://placehold.co/96x96/999/fff?text=U']
      }
    })
  }

  const updateContributor = (index: number, value: string) => {
    if (!selectedNewsletter) return
    const contributors = [...(selectedNewsletter.content.contributors || [])]
    contributors[index] = value
    setSelectedNewsletter({
      ...selectedNewsletter,
      content: { ...selectedNewsletter.content, contributors }
    })
  }

  const deleteContributor = (index: number) => {
    if (!selectedNewsletter) return
    const contributors = (selectedNewsletter.content.contributors || []).filter((_, i) => i !== index)
    setSelectedNewsletter({
      ...selectedNewsletter,
      content: { ...selectedNewsletter.content, contributors }
    })
  }

  if (!isAuthenticated || !user?.isAdmin || loading) {
    return null
  }

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/admin"
            className="text-xs uppercase tracking-wider text-zinc-500 hover:text-white transition-colors mb-4 inline-block font-bold"
          >
            ← Back to Admin
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Newsletter Management</h1>
              <p className="text-zinc-500">Create and manage weekly newsletters</p>
            </div>
            <button
              onClick={createNewNewsletter}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-zinc-200 transition-colors"
            >
              <Plus size={20} />
              New Newsletter
            </button>
          </div>
          {success && (
            <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
              <Check size={16} />
              {success}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Newsletter List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-4">All Newsletters</h2>
            <div className="space-y-2">
              {newsletters.map((newsletter) => (
                <div
                  key={newsletter.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedNewsletter?.id === newsletter.id
                      ? 'bg-zinc-900 border-white'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'
                  }`}
                  onClick={() => {
                    setSelectedNewsletter(newsletter)
                    setIsEditing(true)
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-xs text-zinc-500 mb-1">Week {newsletter.week}</div>
                      <div className="font-semibold">{newsletter.title}</div>
                      <div className="text-xs text-zinc-500 mt-1">{newsletter.date}</div>
                    </div>
                    {newsletter.isCurrent && (
                      <div className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-400">
                        Current
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {newsletters.length === 0 && (
                <div className="text-center py-8 text-zinc-500">
                  No newsletters yet. Create one to get started!
                </div>
              )}
            </div>
          </div>

          {/* Editor */}
          {isEditing && selectedNewsletter && (
            <div className="lg:col-span-2">
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {selectedNewsletter.id ? 'Edit Newsletter' : 'New Newsletter'}
                  </h2>
                  <div className="flex gap-2">
                    <Link
                      href="/newsletter"
                      target="_blank"
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors"
                    >
                      <Eye size={16} />
                      Preview
                    </Link>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-zinc-200 transition-colors"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    {selectedNewsletter.id && (
                      <button
                        onClick={() => handleDelete(selectedNewsletter.id!)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Week & Current */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-bold">
                        Week Number
                      </label>
                      <input
                        type="number"
                        value={selectedNewsletter.week}
                        onChange={(e) => setSelectedNewsletter({ ...selectedNewsletter, week: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-black border border-zinc-800 rounded-lg focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-bold">
                        Set as Current
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedNewsletter.isCurrent}
                          onChange={(e) => setSelectedNewsletter({ ...selectedNewsletter, isCurrent: e.target.checked })}
                          className="w-5 h-5"
                        />
                        <span className="text-sm">Display as current newsletter</span>
                      </label>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-bold">
                      Date
                    </label>
                    <input
                      type="text"
                      value={selectedNewsletter.date}
                      onChange={(e) => setSelectedNewsletter({ ...selectedNewsletter, date: e.target.value })}
                      placeholder="January 2025"
                      className="w-full px-4 py-2 bg-black border border-zinc-800 rounded-lg focus:outline-none focus:border-white transition-colors"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-bold">
                      Title
                    </label>
                    <input
                      type="text"
                      value={selectedNewsletter.title}
                      onChange={(e) => setSelectedNewsletter({ ...selectedNewsletter, title: e.target.value })}
                      className="w-full px-4 py-2 bg-black border border-zinc-800 rounded-lg focus:outline-none focus:border-white transition-colors text-lg font-semibold"
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-bold">
                      Excerpt
                    </label>
                    <textarea
                      value={selectedNewsletter.content.excerpt}
                      onChange={(e) => setSelectedNewsletter({
                        ...selectedNewsletter,
                        content: { ...selectedNewsletter.content, excerpt: e.target.value }
                      })}
                      rows={2}
                      className="w-full px-4 py-2 bg-black border border-zinc-800 rounded-lg focus:outline-none focus:border-white transition-colors resize-none"
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-bold">
                      Header Image URL
                    </label>
                    <input
                      type="text"
                      value={selectedNewsletter.content.image || ''}
                      onChange={(e) => setSelectedNewsletter({
                        ...selectedNewsletter,
                        content: { ...selectedNewsletter.content, image: e.target.value }
                      })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 bg-black border border-zinc-800 rounded-lg focus:outline-none focus:border-white transition-colors"
                    />
                    {selectedNewsletter.content.image && (
                      <img
                        src={selectedNewsletter.content.image}
                        alt="Preview"
                        className="mt-2 w-full h-48 object-cover rounded-lg border border-zinc-800"
                      />
                    )}
                  </div>

                  {/* Contributors */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-bold">
                      Contributors (Avatar URLs)
                    </label>
                    <div className="space-y-2">
                      {(selectedNewsletter.content.contributors || []).map((url, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={url}
                            onChange={(e) => updateContributor(idx, e.target.value)}
                            placeholder="https://example.com/avatar.jpg"
                            className="flex-1 px-4 py-2 bg-black border border-zinc-800 rounded-lg focus:outline-none focus:border-white transition-colors"
                          />
                          <button
                            onClick={() => deleteContributor(idx)}
                            className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addContributor}
                        className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors text-sm"
                      >
                        + Add Contributor
                      </button>
                    </div>
                  </div>

                  {/* Intro */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-bold">
                      Introduction
                    </label>
                    <textarea
                      value={selectedNewsletter.content.intro}
                      onChange={(e) => setSelectedNewsletter({
                        ...selectedNewsletter,
                        content: { ...selectedNewsletter.content, intro: e.target.value }
                      })}
                      rows={4}
                      className="w-full px-4 py-2 bg-black border border-zinc-800 rounded-lg focus:outline-none focus:border-white transition-colors resize-none"
                    />
                  </div>

                  {/* Sections */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-bold">
                      Sections
                    </label>
                    {selectedNewsletter.content.sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="mb-4 p-4 bg-black border border-zinc-800 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                            className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-white transition-colors font-semibold"
                          />
                          <button
                            onClick={() => deleteSection(sectionIndex)}
                            className="ml-3 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-xs"
                          >
                            Delete Section
                          </button>
                        </div>

                        {section.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => updateSectionItem(sectionIndex, itemIndex, e.target.value)}
                              className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-white transition-colors text-sm"
                            />
                            <button
                              onClick={() => deleteItem(sectionIndex, itemIndex)}
                              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-red-500/20 hover:text-red-400 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={() => addItemToSection(sectionIndex)}
                          className="mt-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors text-xs"
                        >
                          + Add Item
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={addSection}
                      className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors"
                    >
                      + Add Section
                    </button>
                  </div>

                  {/* Closing */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-bold">
                      Closing
                    </label>
                    <input
                      type="text"
                      value={selectedNewsletter.content.closing}
                      onChange={(e) => setSelectedNewsletter({
                        ...selectedNewsletter,
                        content: { ...selectedNewsletter.content, closing: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-black border border-zinc-800 rounded-lg focus:outline-none focus:border-white transition-colors italic"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isEditing && (
            <div className="lg:col-span-2 flex items-center justify-center text-zinc-500">
              <div className="text-center">
                <p className="mb-4">Select a newsletter to edit or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
