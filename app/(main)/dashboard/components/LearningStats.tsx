'use client'
import { useEffect, useState } from 'react'
import { Brain, Sparkles, Target, TrendingUp } from 'lucide-react'

interface DashboardStats {
  modules: {
    total: number
    completed: number
    inProgress: number
    notStarted: number
    completionRate: number
  }
  generations: {
    total: number
    saved: number
    byType: {
      text: number
      image: number
      video: number
    }
    byModel: { [key: string]: number }
    averageRating: number
    totalRated: number
  }
  quizzes: {
    totalAttempts: number
    correctAnswers: number
    accuracy: number
    averageTimeSeconds: number
  }
  activity: {
    last7Days: {
      generations: number
      quizzes: number
    }
    lastActivityDate: string | null
  }
}

export function LearningStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [userId])

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/dashboard/stats?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        loading statistics...
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div style={{ display: 'grid', gap: '32px' }}>
      {/* Header */}
      <div className="section-label" style={{ color: '#000' }}>detailed learning analytics</div>

      {/* AI Generations */}
      {stats.generations.total > 0 && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <Sparkles size={20} style={{ color: '#000' }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#000'
            }}>
              ai generations
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            {/* Total Generations */}
            <div className="card-dark" style={{
              padding: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                fontSize: '42px',
                fontWeight: 900,
                color: '#fff',
                marginBottom: '8px'
              }}>
                {stats.generations.total}
              </div>
              <div style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#999',
                fontWeight: 700
              }}>
                total generations
              </div>
            </div>

            {/* Saved to Portfolio */}
            <div className="card-dark" style={{
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
              border: stats.generations.saved > 0 ? '2px solid #00ff00' : '2px solid #333'
            }}>
              <div style={{
                fontSize: '42px',
                fontWeight: 900,
                color: '#00ff00',
                marginBottom: '8px'
              }}>
                {stats.generations.saved}
              </div>
              <div style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#999',
                fontWeight: 700
              }}>
                saved to portfolio
              </div>
            </div>

            {/* Average Rating */}
            {stats.generations.totalRated > 0 && (
              <div className="card-dark" style={{
                padding: '24px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  fontSize: '42px',
                  fontWeight: 900,
                  color: '#fff',
                  marginBottom: '8px'
                }}>
                  {stats.generations.averageRating}<span style={{ fontSize: '24px', color: '#666' }}>/5</span>
                </div>
                <div style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  color: '#999',
                  fontWeight: 700
                }}>
                  avg rating ({stats.generations.totalRated} rated)
                </div>
              </div>
            )}
          </div>

          {/* By Type */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginTop: '16px'
          }}>
            <div style={{
              padding: '16px',
              background: '#000',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>
                {stats.generations.byType.text}
              </div>
              <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
                text
              </div>
            </div>
            <div style={{
              padding: '16px',
              background: '#000',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>
                {stats.generations.byType.image}
              </div>
              <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
                images
              </div>
            </div>
            <div style={{
              padding: '16px',
              background: '#000',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>
                {stats.generations.byType.video}
              </div>
              <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
                videos
              </div>
            </div>
          </div>

          {/* By Model */}
          {Object.keys(stats.generations.byModel).length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#666',
                marginBottom: '12px'
              }}>
                generations by model
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {Object.entries(stats.generations.byModel)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([model, count]) => (
                    <div
                      key={model}
                      style={{
                        padding: '12px 16px',
                        background: '#000',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid #333'
                      }}
                    >
                      <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>
                        {model}
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quiz Performance */}
      {stats.quizzes.totalAttempts > 0 && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <Target size={20} style={{ color: '#000' }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#000'
            }}>
              knowledge checks
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {/* Total Attempts */}
            <div className="card-dark" style={{ padding: '24px' }}>
              <div style={{
                fontSize: '42px',
                fontWeight: 900,
                color: '#fff',
                marginBottom: '8px'
              }}>
                {stats.quizzes.totalAttempts}
              </div>
              <div style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#999',
                fontWeight: 700
              }}>
                total attempts
              </div>
            </div>

            {/* Accuracy */}
            <div className="card-dark" style={{
              padding: '24px',
              border: stats.quizzes.accuracy >= 80 ? '2px solid #00ff00' : '2px solid #333'
            }}>
              <div style={{
                fontSize: '42px',
                fontWeight: 900,
                color: stats.quizzes.accuracy >= 80 ? '#00ff00' : '#fff',
                marginBottom: '8px'
              }}>
                {stats.quizzes.accuracy}%
              </div>
              <div style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#999',
                fontWeight: 700
              }}>
                accuracy
              </div>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: '#333'
              }}>
                <div style={{
                  height: '100%',
                  width: `${stats.quizzes.accuracy}%`,
                  background: stats.quizzes.accuracy >= 80 ? '#00ff00' : '#fff',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>

            {/* Average Time */}
            {stats.quizzes.averageTimeSeconds > 0 && (
              <div className="card-dark" style={{ padding: '24px' }}>
                <div style={{
                  fontSize: '42px',
                  fontWeight: 900,
                  color: '#fff',
                  marginBottom: '8px'
                }}>
                  {stats.quizzes.averageTimeSeconds}s
                </div>
                <div style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  color: '#999',
                  fontWeight: 700
                }}>
                  avg response time
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <TrendingUp size={20} style={{ color: '#000' }} />
          <h3 style={{
            fontSize: '18px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#000'
          }}>
            last 7 days
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div className="card-dark" style={{ padding: '24px' }}>
            <div style={{
              fontSize: '42px',
              fontWeight: 900,
              color: '#fff',
              marginBottom: '8px'
            }}>
              {stats.activity.last7Days.generations}
            </div>
            <div style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: '#999',
              fontWeight: 700
            }}>
              ai generations
            </div>
          </div>

          <div className="card-dark" style={{ padding: '24px' }}>
            <div style={{
              fontSize: '42px',
              fontWeight: 900,
              color: '#fff',
              marginBottom: '8px'
            }}>
              {stats.activity.last7Days.quizzes}
            </div>
            <div style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: '#999',
              fontWeight: 700
            }}>
              knowledge checks
            </div>
          </div>
        </div>

        {stats.activity.lastActivityDate && (
          <div style={{
            marginTop: '16px',
            padding: '16px',
            background: '#000',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            border: '1px solid #333'
          }}>
            last activity: {new Date(stats.activity.lastActivityDate).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  )
}
