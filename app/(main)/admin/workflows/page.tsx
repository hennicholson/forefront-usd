'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function AdminWorkflowsPage() {
  const { user } = useAuth()
  const [workflows, setWorkflows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkflows()
  }, [])

  const loadWorkflows = async () => {
    try {
      const res = await fetch('/api/workflows')
      if (res.ok) {
        const data = await res.json()
        setWorkflows(data)
      }
    } catch (error) {
      console.error('Error loading workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return

    try {
      const res = await fetch(`/api/workflows?id=${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        await loadWorkflows()
      }
    } catch (error) {
      console.error('Error deleting workflow:', error)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      padding: '80px 40px 40px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <div>
            <h1 style={{
              fontSize: '48px',
              fontWeight: 700,
              marginBottom: '8px',
              letterSpacing: '-2px'
            }}>
              Manage Workflows
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#666'
            }}>
              Create and manage workflow templates
            </p>
          </div>
          <Link href="/admin/workflows/new/edit" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 28px',
            background: '#fff',
            color: '#000',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '15px',
            transition: 'transform 0.2s'
          }}>
            ✨ Create New Workflow
          </Link>
        </div>

        {/* Workflows Table */}
        <div style={{
          background: '#0a0a0a',
          border: '1px solid #1a1a1a',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                background: '#0a0a0a',
                borderBottom: '1px solid #1a1a1a'
              }}>
                <th style={{
                  textAlign: 'left',
                  padding: '16px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#666'
                }}>
                  Title
                </th>
                <th style={{
                  textAlign: 'left',
                  padding: '16px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#666'
                }}>
                  Category
                </th>
                <th style={{
                  textAlign: 'center',
                  padding: '16px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#666'
                }}>
                  Status
                </th>
                <th style={{
                  textAlign: 'center',
                  padding: '16px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#666'
                }}>
                  Stats
                </th>
                <th style={{
                  textAlign: 'right',
                  padding: '16px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#666'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((workflow, index) => (
                <motion.tr
                  key={workflow.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    borderBottom: '1px solid #1a1a1a',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#0f0f0f'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '20px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600 }}>
                      {workflow.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      Created {new Date(workflow.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {workflow.category}
                    </span>
                  </td>
                  <td style={{ padding: '20px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: workflow.isPublic ? '#1a4d1a' : '#4d1a1a',
                      border: `1px solid ${workflow.isPublic ? '#2d7d2d' : '#7d2d2d'}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: workflow.isPublic ? '#4ade80' : '#f87171'
                    }}>
                      {workflow.isPublic ? 'Public' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      ❤️ {workflow.likesCount || 0} · 👁️ {workflow.viewsCount || 0}
                    </div>
                  </td>
                  <td style={{ padding: '20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Link href={`/admin/workflows/${workflow.id}/edit`} style={{
                        padding: '6px 12px',
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '12px',
                        textDecoration: 'none',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fff'
                        e.currentTarget.style.color = '#000'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#1a1a1a'
                        e.currentTarget.style.color = '#fff'
                      }}>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(workflow.id)}
                        style={{
                          padding: '6px 12px',
                          background: '#1a1a1a',
                          border: '1px solid #333',
                          borderRadius: '6px',
                          color: '#f87171',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#7d2d2d'
                          e.currentTarget.style.borderColor = '#f87171'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#1a1a1a'
                          e.currentTarget.style.borderColor = '#333'
                        }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
