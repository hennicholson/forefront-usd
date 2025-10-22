'use client'

import { useState, useEffect } from 'react'

interface DatabaseStats {
  totalUsers: number
  totalPosts: number
  totalMessages: number
  totalWorkflows: number
  totalComments: number
  totalReactions: number
  estimatedStorageMB: number
  estimatedStorageGB: number
  actualStorageMB?: number
  actualStorageGB?: number
  storageByTable: Record<string, number>
}

interface CostEstimate {
  storageCostPerMonth: number
  estimatedComputeCostPerMonth: {
    low: number
    medium: number
    high: number
  }
  totalEstimate: {
    low: number
    medium: number
    high: number
  }
}

interface ArchivableData {
  posts: number
  messages: number
  comments: number
  estimatedStorageSavingsMB: number
  cutoffDate: string
}

export default function DatabaseMonitoringPage() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [costs, setCosts] = useState<CostEstimate | null>(null)
  const [archivable, setArchivable] = useState<ArchivableData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/db-stats?includeArchivable=true')
      if (!response.ok) throw new Error('Failed to fetch database stats')
      const data = await response.json()
      setStats(data.stats)
      setCosts(data.costs)
      setArchivable(data.archivable)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 50%, rgba(88,101,242,0.15), transparent 50%), linear-gradient(180deg, #0a0a0f 0%, #050508 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', opacity: 0.7 }}>Loading database statistics...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 50%, rgba(88,101,242,0.15), transparent 50%), linear-gradient(180deg, #0a0a0f 0%, #050508 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#ef4444' }}>Error</div>
          <div style={{ opacity: 0.8 }}>{error}</div>
          <button
            onClick={fetchStats}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: 'rgba(88, 101, 242, 0.2)',
              border: '1px solid rgba(88, 101, 242, 0.4)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 50%, rgba(88,101,242,0.15), transparent 50%), linear-gradient(180deg, #0a0a0f 0%, #050508 100%)',
      padding: '40px 20px',
      color: 'white'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
              Database Monitoring
            </h1>
            <p style={{ opacity: 0.6, fontSize: '14px' }}>
              Real-time statistics and cost estimates for your Neon database
            </p>
          </div>
          <button
            onClick={fetchStats}
            style={{
              padding: '10px 20px',
              background: 'rgba(88, 101, 242, 0.2)',
              border: '1px solid rgba(88, 101, 242, 0.4)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(88, 101, 242, 0.3)'
              e.currentTarget.style.borderColor = 'rgba(88, 101, 242, 0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(88, 101, 242, 0.2)'
              e.currentTarget.style.borderColor = 'rgba(88, 101, 242, 0.4)'
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Usage Statistics */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>📊 Current Usage</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Users', value: stats?.totalUsers, color: '#5865F2' },
              { label: 'Posts', value: stats?.totalPosts, color: '#57F287' },
              { label: 'Messages', value: stats?.totalMessages, color: '#FEE75C' },
              { label: 'Workflows', value: stats?.totalWorkflows, color: '#EB459E' },
              { label: 'Comments', value: stats?.totalComments, color: '#ED4245' },
              { label: 'Reactions', value: stats?.totalReactions, color: '#F26522' }
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '8px' }}>{label}</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color }}>{value?.toLocaleString() || 0}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Cost Highlight */}
        {stats?.actualStorageMB && (
          <div style={{ marginBottom: '32px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.1), rgba(87, 242, 135, 0.1))',
                backdropFilter: 'blur(10px) saturate(180%)',
                border: '2px solid rgba(88, 101, 242, 0.4)',
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                💰 Current Storage Cost
              </div>
              <div style={{ fontSize: '56px', fontWeight: 900, color: '#57F287', marginBottom: '8px' }}>
                ${((stats.actualStorageGB || 0) * 0.35).toFixed(2)}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.6 }}>
                per month ({(stats.actualStorageMB || 0).toFixed(2)} MB / {(stats.actualStorageGB || 0).toFixed(4)} GB)
              </div>
            </div>
          </div>
        )}

        {/* Storage Usage */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>💾 Storage Usage</h2>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '24px'
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>
                {stats?.actualStorageMB ? 'Actual Storage (from database)' : 'Estimated Storage'}
              </div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#5865F2' }}>
                {(stats?.actualStorageMB || stats?.estimatedStorageMB)?.toFixed(2)} MB
                <span style={{ fontSize: '18px', opacity: 0.6, marginLeft: '8px' }}>
                  ({(stats?.actualStorageGB || stats?.estimatedStorageGB)?.toFixed(4)} GB)
                </span>
              </div>
            </div>

            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', opacity: 0.8 }}>
              Storage Breakdown by Table
            </div>
            {stats?.storageByTable && Object.entries(stats.storageByTable).map(([table, mb]) => {
              const percentage = (mb / (stats.estimatedStorageMB || 1)) * 100
              return (
                <div key={table} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                    <span style={{ opacity: 0.7 }}>{table}</span>
                    <span style={{ fontWeight: 600 }}>{mb.toFixed(2)} MB ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div style={{
                    height: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #5865F2, #57F287)',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cost Estimates */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>💰 Monthly Cost Estimates</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {/* Storage Cost */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '20px'
              }}
            >
              <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>Storage Cost</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#57F287' }}>
                ${costs?.storageCostPerMonth.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '4px' }}>
                @ $0.35/GB
              </div>
            </div>

            {/* Low Usage */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '20px'
              }}
            >
              <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>Total (Low Usage)</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#FEE75C' }}>
                ${costs?.totalEstimate.low.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '4px' }}>
                Compute: ${costs?.estimatedComputeCostPerMonth.low.toFixed(2)} (4 hrs/day)
              </div>
            </div>

            {/* Medium Usage */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '20px'
              }}
            >
              <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>Total (Medium Usage)</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#EB459E' }}>
                ${costs?.totalEstimate.medium.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '4px' }}>
                Compute: ${costs?.estimatedComputeCostPerMonth.medium.toFixed(2)} (12 hrs/day)
              </div>
            </div>

            {/* High Usage */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '20px'
              }}
            >
              <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>Total (High Usage)</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#ED4245' }}>
                ${costs?.totalEstimate.high.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '4px' }}>
                Compute: ${costs?.estimatedComputeCostPerMonth.high.toFixed(2)} (20 hrs/day)
              </div>
            </div>
          </div>
        </div>

        {/* Archivable Data */}
        {archivable && (archivable.posts > 0 || archivable.messages > 0 || archivable.comments > 0) && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>🗑️ Archivable Data (Older than 1 year)</h2>
            <div
              style={{
                background: 'rgba(255, 165, 0, 0.05)',
                backdropFilter: 'blur(10px) saturate(180%)',
                border: '1px solid rgba(255, 165, 0, 0.3)',
                borderRadius: '12px',
                padding: '24px'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px' }}>Old Posts</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFA500' }}>{archivable.posts.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px' }}>Old Messages</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFA500' }}>{archivable.messages.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px' }}>Old Comments</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFA500' }}>{archivable.comments.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px' }}>Potential Savings</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#57F287' }}>
                    {archivable.estimatedStorageSavingsMB.toFixed(2)} MB
                  </div>
                </div>
              </div>
              <div style={{
                padding: '12px 16px',
                background: 'rgba(255, 165, 0, 0.1)',
                borderRadius: '8px',
                fontSize: '13px',
                opacity: 0.8
              }}>
                💡 Run <code style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '2px 6px', borderRadius: '4px' }}>npm run db:archive-preview</code> to see detailed archiving plan
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
