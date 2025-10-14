'use client'

interface ContentBlock {
  id: string
  type: 'text' | 'code' | 'codePreview' | 'image' | 'video' | 'note' | 'chart' | 'quiz'
  data: any
}

interface ContentBlockViewerProps {
  blocks: ContentBlock[]
  theme?: 'light' | 'dark'
}

export function ContentBlockViewer({ blocks, theme = 'dark' }: ContentBlockViewerProps) {
  if (!blocks || blocks.length === 0) {
    return null
  }

  // Theme-aware color system - strict black and white only
  const colors = {
    light: {
      text: '#000',
      textSecondary: '#666',
      background: '#fff',
      blockBg: '#fafafa',
      blockBgAlt: '#f5f5f5',
      border: '#e5e7eb',
      borderStrong: '#ccc',
      codeBg: '#f9f9f9',
      codeText: '#000',
      accent: '#000',
      labelBg: '#000',
      labelText: '#fff'
    },
    dark: {
      text: '#fff',
      textSecondary: '#999',
      background: '#000',
      blockBg: '#0a0a0a',
      blockBgAlt: '#1a1a1a',
      border: '#1a1a1a',
      borderStrong: '#333',
      codeBg: '#0a0a0a',
      codeText: '#fff',
      accent: '#fff',
      labelBg: '#fff',
      labelText: '#000'
    }
  }

  const c = colors[theme]

  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <div
            className={`ProseMirror prose ${theme === 'dark' ? 'prose-invert' : ''} max-w-none`}
            style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              lineHeight: 1.8,
              color: c.text
            }}
            dangerouslySetInnerHTML={{ __html: block.data?.html || block.data?.text || '' }}
          />
        )

      case 'code':
        return (
          <div style={{
            background: c.blockBg,
            border: `1px solid ${c.border}`,
            borderRadius: '16px',
            padding: '0',
            overflow: 'hidden'
          }}>
            <div style={{
              background: c.labelBg,
              color: c.labelText,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              padding: '12px 20px',
              fontWeight: 700,
              borderBottom: `1px solid ${c.border}`
            }}>
              {block.data?.language || 'code'}
            </div>
            <pre style={{
              margin: 0,
              padding: '20px',
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: 1.8,
              color: c.codeText,
              overflowX: 'auto'
            }}>
              {block.data?.code}
            </pre>
          </div>
        )

      case 'codePreview':
        return (
          <div style={{
            background: 'transparent',
            border: 'none',
            borderRadius: '0',
            padding: '0',
            overflow: 'visible'
          }}>
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                    <meta charset="UTF-8">
                    <style>
                      * { margin: 0; padding: 0; box-sizing: border-box; }
                      html, body {
                        background: transparent;
                        overflow: hidden;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
                        color: ${c.text};
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                        width: 100%;
                      }
                      /* Theme-aware variables */
                      :root {
                        --text-color: ${c.text};
                        --text-secondary: ${c.textSecondary};
                        --border-color: ${c.border};
                        --bg-subtle: ${c.blockBg};
                        --bg-subtle-alt: ${c.blockBgAlt};
                      }
                      ${block.data?.css || ''}
                    </style>
                  </head>
                  <body>
                    ${block.data?.html || ''}
                    <script>
                      ${block.data?.js || ''}
                      // Auto-resize iframe to content height
                      function resizeIframe() {
                        const height = document.body.scrollHeight;
                        window.parent.postMessage({ type: 'resize', height: height }, '*');
                      }
                      window.addEventListener('load', resizeIframe);
                      window.addEventListener('resize', resizeIframe);
                      // Initial resize
                      setTimeout(resizeIframe, 100);
                      setTimeout(resizeIframe, 500);
                    </script>
                  </body>
                </html>
              `}
              style={{
                width: '100%',
                minHeight: '200px',
                border: 'none',
                borderRadius: '0',
                background: 'transparent',
                display: 'block'
              }}
              sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
              onLoad={(e) => {
                const iframe = e.target as HTMLIFrameElement;
                // Listen for resize messages from iframe
                const handleMessage = (event: MessageEvent) => {
                  if (event.data?.type === 'resize' && event.data?.height) {
                    iframe.style.height = `${event.data.height}px`;
                  }
                };
                window.addEventListener('message', handleMessage);
              }}
            />
          </div>
        )

      case 'image':
        return (
          <div style={{
            borderRadius: '16px',
            overflow: 'hidden',
            border: `1px solid ${c.border}`,
            background: c.blockBg
          }}>
            <img
              src={block.data?.src}
              alt="Content"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>
        )

      case 'video':
        return (
          <div style={{
            borderRadius: '16px',
            overflow: 'hidden',
            border: `1px solid ${c.border}`,
            background: '#000'
          }}>
            <div style={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0
            }}>
              <iframe
                src={block.data?.url?.includes('youtube')
                  ? block.data.url.replace('watch?v=', 'embed/')
                  : block.data?.url
                }
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allowFullScreen
              />
            </div>
          </div>
        )

      case 'note':
        return (
          <div style={{
            background: c.blockBg,
            border: `2px solid ${c.accent}`,
            borderRadius: '16px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative corner element */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '80px',
              height: '80px',
              background: c.accent,
              opacity: 0.05,
              borderRadius: '0 0 0 100%'
            }} />

            <div style={{
              background: c.labelBg,
              color: c.labelText,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: '16px',
              fontWeight: 700,
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'inline-block'
            }}>
              Note
            </div>
            <div
              style={{
                fontSize: 'clamp(15px, 2vw, 17px)',
                lineHeight: 1.7,
                color: c.text,
                fontWeight: 500,
                position: 'relative'
              }}
              dangerouslySetInnerHTML={{ __html: block.data?.text || '' }}
            />
          </div>
        )

      case 'chart':
        try {
          // Support both old and new chart formats
          let chartConfig
          if (block.data?.chartConfig) {
            chartConfig = block.data.chartConfig
          } else if (block.data?.chartData) {
            // Legacy format
            const legacy = JSON.parse(block.data.chartData)
            chartConfig = {
              type: 'bar',
              title: '',
              dataRows: legacy.labels?.map((label: string, i: number) => ({
                label,
                value: legacy.data[i]
              })) || [],
              color: c.accent,
              showValues: true
            }
          } else {
            throw new Error('No chart data')
          }

          const maxValue = Math.max(...chartConfig.dataRows.map((row: any) => parseFloat(row.value) || 0), 1)

          return (
            <div style={{
              background: c.blockBg,
              border: `1px solid ${c.border}`,
              borderRadius: '16px',
              padding: '0',
              overflow: 'hidden'
            }}>
              <div style={{
                background: c.labelBg,
                color: c.labelText,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                padding: '12px 20px',
                fontWeight: 700,
                borderBottom: `1px solid ${c.border}`
              }}>
                {chartConfig.title || 'Chart'}
              </div>
              <div style={{
                padding: '32px',
                color: c.text
              }}>
                {/* Bar Chart */}
                {chartConfig.type === 'bar' && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '250px', gap: '16px' }}>
                    {chartConfig.dataRows.map((row: any, i: number) => {
                      const height = ((parseFloat(row.value) || 0) / maxValue) * 100
                      return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                          {chartConfig.showValues && (
                            <div style={{ fontSize: '13px', fontWeight: 700, color: c.text, minHeight: '20px' }}>
                              {row.value}
                            </div>
                          )}
                          <div
                            style={{
                              width: '100%',
                              maxWidth: '100px',
                              height: `${height}%`,
                              background: chartConfig.color || c.accent,
                              borderRadius: '8px 8px 0 0',
                              transition: 'all 0.3s',
                              minHeight: '6px'
                            }}
                          />
                          <div style={{
                            fontSize: '13px',
                            color: c.textSecondary,
                            textAlign: 'center',
                            wordBreak: 'break-word',
                            maxWidth: '120px',
                            fontWeight: 500
                          }}>
                            {row.label}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Pie Chart */}
                {chartConfig.type === 'pie' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                    <div style={{
                      width: '240px',
                      height: '240px',
                      borderRadius: '50%',
                      background: `conic-gradient(${chartConfig.dataRows.map((row: any, i: number) => {
                        const total = chartConfig.dataRows.reduce((sum: number, r: any) => sum + (parseFloat(r.value) || 0), 0)
                        const colors = theme === 'dark'
                          ? ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                          : ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777']
                        return `${colors[i % colors.length]} ${i === 0 ? 0 : chartConfig.dataRows.slice(0, i).reduce((sum: number, r: any) => sum + ((parseFloat(r.value) || 0) / total) * 100, 0)}% ${chartConfig.dataRows.slice(0, i + 1).reduce((sum: number, r: any) => sum + ((parseFloat(r.value) || 0) / total) * 100, 0)}%`
                      }).join(', ')})`,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }} />
                    <div style={{ display: 'grid', gap: '10px', width: '100%', maxWidth: '300px' }}>
                      {chartConfig.dataRows.map((row: any, i: number) => {
                        const colors = theme === 'dark'
                          ? ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                          : ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777']
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: colors[i % colors.length] }} />
                            <span style={{ color: c.text, fontWeight: 500 }}>{row.label}:</span>
                            <span style={{ color: c.text, fontWeight: 700 }}>{row.value}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Line Chart */}
                {chartConfig.type === 'line' && (
                  <div style={{ padding: '20px 0', position: 'relative' }}>
                    <svg width="100%" height="220" viewBox="0 0 600 220" preserveAspectRatio="none">
                      <polyline
                        points={chartConfig.dataRows.map((row: any, i: number) => {
                          const x = (i / (chartConfig.dataRows.length - 1)) * 580 + 10
                          const y = 200 - ((parseFloat(row.value) || 0) / maxValue) * 180
                          return `${x},${y}`
                        }).join(' ')}
                        fill="none"
                        stroke={chartConfig.color || c.accent}
                        strokeWidth="4"
                      />
                      {chartConfig.dataRows.map((row: any, i: number) => {
                        const x = (i / (chartConfig.dataRows.length - 1)) * 580 + 10
                        const y = 200 - ((parseFloat(row.value) || 0) / maxValue) * 180
                        return (
                          <circle key={i} cx={x} cy={y} r="6" fill={chartConfig.color || c.accent} />
                        )
                      })}
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '12px' }}>
                      {chartConfig.dataRows.map((row: any, i: number) => (
                        <div key={i} style={{ fontSize: '13px', color: c.textSecondary, textAlign: 'center', fontWeight: 500 }}>
                          {row.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Area Chart */}
                {chartConfig.type === 'area' && (
                  <div style={{ padding: '20px 0', position: 'relative' }}>
                    <svg width="100%" height="220" viewBox="0 0 600 220" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id={`areaGradient-${block.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: chartConfig.color || c.accent, stopOpacity: 0.6 }} />
                          <stop offset="100%" style={{ stopColor: chartConfig.color || c.accent, stopOpacity: 0.1 }} />
                        </linearGradient>
                      </defs>
                      <polygon
                        points={`10,200 ${chartConfig.dataRows.map((row: any, i: number) => {
                          const x = (i / (chartConfig.dataRows.length - 1)) * 580 + 10
                          const y = 200 - ((parseFloat(row.value) || 0) / maxValue) * 180
                          return `${x},${y}`
                        }).join(' ')} 590,200`}
                        fill={`url(#areaGradient-${block.id})`}
                      />
                      <polyline
                        points={chartConfig.dataRows.map((row: any, i: number) => {
                          const x = (i / (chartConfig.dataRows.length - 1)) * 580 + 10
                          const y = 200 - ((parseFloat(row.value) || 0) / maxValue) * 180
                          return `${x},${y}`
                        }).join(' ')}
                        fill="none"
                        stroke={chartConfig.color || c.accent}
                        strokeWidth="4"
                      />
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '12px' }}>
                      {chartConfig.dataRows.map((row: any, i: number) => (
                        <div key={i} style={{ fontSize: '13px', color: c.textSecondary, textAlign: 'center', fontWeight: 500 }}>
                          {row.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doughnut Chart */}
                {chartConfig.type === 'doughnut' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: '240px',
                        height: '240px',
                        borderRadius: '50%',
                        background: `conic-gradient(${chartConfig.dataRows.map((row: any, i: number) => {
                          const total = chartConfig.dataRows.reduce((sum: number, r: any) => sum + (parseFloat(r.value) || 0), 0)
                          const colors = theme === 'dark'
                            ? ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                            : ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777']
                          return `${colors[i % colors.length]} ${i === 0 ? 0 : chartConfig.dataRows.slice(0, i).reduce((sum: number, r: any) => sum + ((parseFloat(r.value) || 0) / total) * 100, 0)}% ${chartConfig.dataRows.slice(0, i + 1).reduce((sum: number, r: any) => sum + ((parseFloat(r.value) || 0) / total) * 100, 0)}%`
                        }).join(', ')})`,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                      }} />
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '140px',
                        height: '140px',
                        borderRadius: '50%',
                        background: c.blockBg
                      }} />
                    </div>
                    <div style={{ display: 'grid', gap: '10px', width: '100%', maxWidth: '300px' }}>
                      {chartConfig.dataRows.map((row: any, i: number) => {
                        const colors = theme === 'dark'
                          ? ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                          : ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777']
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: colors[i % colors.length] }} />
                            <span style={{ color: c.text, fontWeight: 500 }}>{row.label}:</span>
                            <span style={{ color: c.text, fontWeight: 700 }}>{row.value}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        } catch (err) {
          return (
            <div style={{
              padding: '24px',
              background: c.blockBg,
              border: `1px solid ${c.border}`,
              borderRadius: '16px',
              color: c.textSecondary,
              fontSize: '14px',
              textAlign: 'center'
            }}>
              Invalid chart data
            </div>
          )
        }

      case 'quiz':
        // Handle both string (old format) and array (new format)
        const options = Array.isArray(block.data?.options)
          ? block.data.options
          : (block.data?.options?.split?.('\n').filter((opt: string) => opt.trim()) || [])
        return (
          <div style={{
            background: c.blockBg,
            border: `1px solid ${c.border}`,
            borderRadius: '16px',
            padding: '0',
            overflow: 'hidden'
          }}>
            <div style={{
              background: c.labelBg,
              color: c.labelText,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              padding: '12px 20px',
              fontWeight: 700,
              borderBottom: `1px solid ${c.border}`
            }}>
              Quiz Question
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{
                fontSize: '19px',
                color: c.text,
                marginBottom: '24px',
                fontWeight: 600,
                lineHeight: 1.5
              }}>
                {block.data?.question}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {options.map((option: string, idx: number) => (
                  <div key={idx} style={{
                    padding: '16px 20px',
                    background: c.blockBgAlt,
                    border: `1px solid ${c.border}`,
                    borderRadius: '12px',
                    color: c.text,
                    fontSize: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${c.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: c.textSecondary,
                      flexShrink: 0
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div>{option}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '40px',
      marginTop: '40px'
    }}>
      {blocks.map((block) => (
        <div key={block.id}>
          {renderBlock(block)}
        </div>
      ))}
    </div>
  )
}
