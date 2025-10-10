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
              Live Preview
            </div>
            <div style={{ padding: '20px' }}>
              <iframe
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <style>${block.data?.css || ''}</style>
                    </head>
                    <body>
                      ${block.data?.html || ''}
                      <script>${block.data?.js || ''}</script>
                    </body>
                  </html>
                `}
                style={{
                  width: '100%',
                  height: '400px',
                  border: `1px solid ${c.border}`,
                  borderRadius: '8px',
                  background: '#fff'
                }}
                sandbox="allow-scripts"
              />
            </div>
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
            <div style={{
              fontSize: 'clamp(15px, 2vw, 17px)',
              lineHeight: 1.7,
              color: c.text,
              fontWeight: 500,
              position: 'relative'
            }}>
              {block.data?.text}
            </div>
          </div>
        )

      case 'chart':
        try {
          const chartData = JSON.parse(block.data?.chartData || '{}')
          const maxValue = Math.max(...(chartData.data || [1]))
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
                Chart
              </div>
              <div style={{
                padding: '24px',
                color: c.text
              }}>
                {chartData.labels?.map((label: string, i: number) => (
                  <div key={i} style={{ marginBottom: '20px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: c.text
                      }}>
                        {label}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: c.text,
                        fontFamily: 'monospace'
                      }}>
                        {chartData.data[i]}
                      </div>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: c.blockBgAlt,
                      borderRadius: '4px',
                      overflow: 'hidden',
                      border: `1px solid ${c.border}`
                    }}>
                      <div style={{
                        background: c.accent,
                        height: '100%',
                        width: `${(chartData.data[i] / maxValue) * 100}%`,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        } catch {
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
        const options = block.data?.options?.split('\n').filter((opt: string) => opt.trim()) || []
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
