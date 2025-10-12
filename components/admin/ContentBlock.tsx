'use client'
import { useState, useEffect } from 'react'
import { RichTextEditor } from './RichTextEditor'

export type ContentBlockType = 'text' | 'code' | 'codePreview' | 'image' | 'video' | 'note' | 'chart' | 'quiz'

export interface ContentBlock {
  id: string
  type: ContentBlockType
  data: any
}

interface ContentBlockProps {
  block: ContentBlock
  onChange: (block: ContentBlock) => void
  onDelete: () => void
  onDuplicate?: () => void
}

// Chart Block Editor Component
function ChartBlockEditor({ block, onChange, labelStyle, inputStyle }: any) {
  // Initialize chart data structure
  const initChartData = () => {
    if (!block.data?.chartConfig) {
      return {
        type: 'bar',
        title: '',
        xAxisLabel: '',
        yAxisLabel: '',
        dataRows: [
          { label: 'Category 1', value: 10 },
          { label: 'Category 2', value: 20 },
          { label: 'Category 3', value: 15 }
        ],
        color: '#3b82f6',
        showValues: true
      }
    }
    return block.data.chartConfig
  }

  const [chartConfig, setChartConfig] = useState(initChartData())

  useEffect(() => {
    onChange({ ...block, data: { ...block.data, chartConfig } })
  }, [chartConfig])

  const updateConfig = (key: string, value: any) => {
    setChartConfig({ ...chartConfig, [key]: value })
  }

  const addDataRow = () => {
    setChartConfig({
      ...chartConfig,
      dataRows: [...chartConfig.dataRows, { label: `Category ${chartConfig.dataRows.length + 1}`, value: 0 }]
    })
  }

  const removeDataRow = (index: number) => {
    if (chartConfig.dataRows.length > 1) {
      setChartConfig({
        ...chartConfig,
        dataRows: chartConfig.dataRows.filter((_: any, i: number) => i !== index)
      })
    }
  }

  const updateDataRow = (index: number, field: 'label' | 'value', value: string | number) => {
    const updated = [...chartConfig.dataRows]
    updated[index] = { ...updated[index], [field]: value }
    setChartConfig({ ...chartConfig, dataRows: updated })
  }

  // Calculate max value for chart preview
  const maxValue = Math.max(...chartConfig.dataRows.map((row: any) => parseFloat(row.value) || 0), 1)

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Chart Type & Title */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Chart Type</label>
          <select
            value={chartConfig.type}
            onChange={(e) => updateConfig('type', e.target.value)}
            style={inputStyle}
          >
            <option value="bar">📊 Bar Chart</option>
            <option value="line">📈 Line Chart</option>
            <option value="pie">🥧 Pie Chart</option>
            <option value="area">📉 Area Chart</option>
            <option value="doughnut">🍩 Doughnut Chart</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Chart Title</label>
          <input
            type="text"
            value={chartConfig.title}
            onChange={(e) => updateConfig('title', e.target.value)}
            placeholder="e.g., Monthly Sales"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Axis Labels (for bar/line/area charts) */}
      {['bar', 'line', 'area'].includes(chartConfig.type) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>X-Axis Label (optional)</label>
            <input
              type="text"
              value={chartConfig.xAxisLabel || ''}
              onChange={(e) => updateConfig('xAxisLabel', e.target.value)}
              placeholder="e.g., Months"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Y-Axis Label (optional)</label>
            <input
              type="text"
              value={chartConfig.yAxisLabel || ''}
              onChange={(e) => updateConfig('yAxisLabel', e.target.value)}
              placeholder="e.g., Revenue ($)"
              style={inputStyle}
            />
          </div>
        </div>
      )}

      {/* Data Rows */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Chart Data</label>
          <button
            onClick={addDataRow}
            style={{
              padding: '6px 14px',
              background: '#14b8a6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#0d9488'}
            onMouseOut={(e) => e.currentTarget.style.background = '#14b8a6'}
          >
            + Add Row
          </button>
        </div>

        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr auto',
          gap: '8px',
          padding: '10px',
          background: '#f9fafb',
          borderRadius: '8px 8px 0 0',
          border: '2px solid #e5e7eb',
          borderBottom: 'none',
          fontWeight: 600,
          fontSize: '12px',
          color: '#374151',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <div>Label</div>
          <div>Value</div>
          <div style={{ width: '60px' }}>Action</div>
        </div>

        {/* Data Rows */}
        <div style={{
          border: '2px solid #e5e7eb',
          borderRadius: '0 0 8px 8px',
          background: '#fff'
        }}>
          {chartConfig.dataRows.map((row: any, index: number) => (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr auto',
                gap: '8px',
                padding: '8px',
                borderBottom: index < chartConfig.dataRows.length - 1 ? '1px solid #f3f4f6' : 'none'
              }}
            >
              <input
                type="text"
                value={row.label}
                onChange={(e) => updateDataRow(index, 'label', e.target.value)}
                placeholder="Label"
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  outline: 'none',
                  background: '#fff',
                  color: '#1f2937'
                }}
              />
              <input
                type="number"
                value={row.value}
                onChange={(e) => updateDataRow(index, 'value', parseFloat(e.target.value) || 0)}
                placeholder="Value"
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  outline: 'none',
                  background: '#fff',
                  color: '#1f2937'
                }}
              />
              <button
                onClick={() => removeDataRow(index)}
                disabled={chartConfig.dataRows.length === 1}
                style={{
                  padding: '8px',
                  background: chartConfig.dataRows.length === 1 ? '#f3f4f6' : '#fee2e2',
                  color: chartConfig.dataRows.length === 1 ? '#9ca3af' : '#dc2626',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: chartConfig.dataRows.length === 1 ? 'not-allowed' : 'pointer',
                  width: '60px'
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Chart Color</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={chartConfig.color}
              onChange={(e) => updateConfig('color', e.target.value)}
              style={{
                width: '60px',
                height: '42px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            />
            <input
              type="text"
              value={chartConfig.color}
              onChange={(e) => updateConfig('color', e.target.value)}
              placeholder="#3b82f6"
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', paddingTop: '28px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
            <input
              type="checkbox"
              checked={chartConfig.showValues}
              onChange={(e) => updateConfig('showValues', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span>Show values on chart</span>
          </label>
        </div>
      </div>

      {/* Live Preview */}
      <div>
        <label style={{ ...labelStyle, marginBottom: '12px' }}>Live Preview</label>
        <div style={{
          padding: '24px',
          background: '#f9fafb',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          minHeight: '300px'
        }}>
          {chartConfig.title && (
            <h3 style={{
              textAlign: 'center',
              fontSize: '18px',
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '24px'
            }}>
              {chartConfig.title}
            </h3>
          )}

          {/* Simple CSS-based chart preview */}
          {chartConfig.type === 'bar' && (
            <div style={{ padding: '20px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', gap: '16px', position: 'relative', height: '220px' }}>
                {chartConfig.dataRows.map((row: any, i: number) => {
                  const value = parseFloat(row.value) || 0
                  const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative', minWidth: '50px', maxWidth: '100px' }}>
                      {chartConfig.showValues && (
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#374151',
                          position: 'absolute',
                          top: `${95 - heightPercent}%`,
                          transform: 'translateY(-100%)',
                          marginBottom: '4px'
                        }}>
                          {value}
                        </div>
                      )}
                      <div
                        style={{
                          width: '100%',
                          height: `${Math.max(heightPercent, 2)}%`,
                          background: chartConfig.color,
                          borderRadius: '8px 8px 0 0',
                          transition: 'height 0.3s ease, background 0.3s ease',
                          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
                          position: 'relative'
                        }}
                      />
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', gap: '16px', marginTop: '12px' }}>
                {chartConfig.dataRows.map((row: any, i: number) => (
                  <div key={i} style={{
                    flex: 1,
                    fontSize: '12px',
                    color: '#6b7280',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    fontWeight: 500,
                    minWidth: '50px',
                    maxWidth: '100px'
                  }}>
                    {row.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {chartConfig.type === 'pie' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: `conic-gradient(${chartConfig.dataRows.map((row: any, i: number) => {
                  const total = chartConfig.dataRows.reduce((sum: number, r: any) => sum + (parseFloat(r.value) || 0), 0)
                  const percentage = ((parseFloat(row.value) || 0) / total) * 100
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                  return `${colors[i % colors.length]} ${i === 0 ? 0 : chartConfig.dataRows.slice(0, i).reduce((sum: number, r: any) => sum + ((parseFloat(r.value) || 0) / total) * 100, 0)}% ${chartConfig.dataRows.slice(0, i + 1).reduce((sum: number, r: any) => sum + ((parseFloat(r.value) || 0) / total) * 100, 0)}%`
                }).join(', ')})`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }} />
              <div style={{ display: 'grid', gap: '8px' }}>
                {chartConfig.dataRows.map((row: any, i: number) => {
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: colors[i % colors.length] }} />
                      <span style={{ color: '#374151' }}>{row.label}: {row.value}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {chartConfig.type === 'line' && (
            <div style={{ padding: '20px', position: 'relative' }}>
              <svg width="100%" height="180" viewBox="0 0 600 180" preserveAspectRatio="none">
                <polyline
                  points={chartConfig.dataRows.map((row: any, i: number) => {
                    const x = (i / (chartConfig.dataRows.length - 1)) * 580 + 10
                    const y = 170 - ((parseFloat(row.value) || 0) / maxValue) * 150
                    return `${x},${y}`
                  }).join(' ')}
                  fill="none"
                  stroke={chartConfig.color}
                  strokeWidth="3"
                />
                {chartConfig.dataRows.map((row: any, i: number) => {
                  const x = (i / (chartConfig.dataRows.length - 1)) * 580 + 10
                  const y = 170 - ((parseFloat(row.value) || 0) / maxValue) * 150
                  return (
                    <circle key={i} cx={x} cy={y} r="5" fill={chartConfig.color} />
                  )
                })}
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '8px' }}>
                {chartConfig.dataRows.map((row: any, i: number) => (
                  <div key={i} style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                    {row.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {chartConfig.type === 'area' && (
            <div style={{ padding: '20px', position: 'relative' }}>
              <svg width="100%" height="180" viewBox="0 0 600 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: chartConfig.color, stopOpacity: 0.5 }} />
                    <stop offset="100%" style={{ stopColor: chartConfig.color, stopOpacity: 0.1 }} />
                  </linearGradient>
                </defs>
                <polygon
                  points={`10,170 ${chartConfig.dataRows.map((row: any, i: number) => {
                    const x = (i / (chartConfig.dataRows.length - 1)) * 580 + 10
                    const y = 170 - ((parseFloat(row.value) || 0) / maxValue) * 150
                    return `${x},${y}`
                  }).join(' ')} 590,170`}
                  fill="url(#areaGradient)"
                />
                <polyline
                  points={chartConfig.dataRows.map((row: any, i: number) => {
                    const x = (i / (chartConfig.dataRows.length - 1)) * 580 + 10
                    const y = 170 - ((parseFloat(row.value) || 0) / maxValue) * 150
                    return `${x},${y}`
                  }).join(' ')}
                  fill="none"
                  stroke={chartConfig.color}
                  strokeWidth="3"
                />
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '8px' }}>
                {chartConfig.dataRows.map((row: any, i: number) => (
                  <div key={i} style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                    {row.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {chartConfig.type === 'doughnut' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: `conic-gradient(${chartConfig.dataRows.map((row: any, i: number) => {
                    const total = chartConfig.dataRows.reduce((sum: number, r: any) => sum + (parseFloat(r.value) || 0), 0)
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                    return `${colors[i % colors.length]} ${i === 0 ? 0 : chartConfig.dataRows.slice(0, i).reduce((sum: number, r: any) => sum + ((parseFloat(r.value) || 0) / total) * 100, 0)}% ${chartConfig.dataRows.slice(0, i + 1).reduce((sum: number, r: any) => sum + ((parseFloat(r.value) || 0) / total) * 100, 0)}%`
                  }).join(', ')})`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: '#f9fafb'
                }} />
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {chartConfig.dataRows.map((row: any, i: number) => {
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: colors[i % colors.length] }} />
                      <span style={{ color: '#374151' }}>{row.label}: {row.value}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ContentBlockEditor({ block, onChange, onDelete, onDuplicate }: ContentBlockProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [html, setHtml] = useState(block.data?.html || '')
  const [css, setCSS] = useState(block.data?.css || '')
  const [js, setJS] = useState(block.data?.js || '')

  useEffect(() => {
    if (block.type === 'codePreview') {
      onChange({ ...block, data: { html, css, js } })
    }
  }, [html, css, js])

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    fontSize: '13px',
    color: '#374151'
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    fontSize: '14px',
    color: '#1f2937',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    outline: 'none'
  }

  const textareaStyle = {
    ...inputStyle,
    fontFamily: 'monospace',
    lineHeight: 1.6,
    resize: 'vertical' as const
  }

  const renderEditor = () => {
    switch (block.type) {
      case 'text':
        return (
          <div>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '13px', color: '#374151' }}>
              Text Content
            </label>
            <RichTextEditor
              content={block.data?.html || block.data?.text || ''}
              onChange={(html) => onChange({ ...block, data: { html, text: html } })}
              placeholder="Enter your text content..."
            />
          </div>
        )

      case 'code':
        return (
          <div>
            <label style={labelStyle}>Language</label>
            <select
              value={block.data?.language || 'javascript'}
              onChange={(e) => onChange({ ...block, data: { ...block.data, language: e.target.value } })}
              style={{ ...inputStyle, marginBottom: '16px' }}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="json">JSON</option>
              <option value="bash">Bash</option>
              <option value="sql">SQL</option>
            </select>
            <label style={labelStyle}>Code</label>
            <textarea
              value={block.data?.code || ''}
              onChange={(e) => onChange({ ...block, data: { ...block.data, code: e.target.value } })}
              rows={10}
              style={textareaStyle}
              placeholder="Paste your code here..."
            />
          </div>
        )

      case 'codePreview':
        return (
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={labelStyle}>HTML</label>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                rows={6}
                style={textareaStyle}
                placeholder="<div>Your HTML here...</div>"
              />
            </div>
            <div>
              <label style={labelStyle}>CSS</label>
              <textarea
                value={css}
                onChange={(e) => setCSS(e.target.value)}
                rows={6}
                style={textareaStyle}
                placeholder="body { ... }"
              />
            </div>
            <div>
              <label style={labelStyle}>JavaScript</label>
              <textarea
                value={js}
                onChange={(e) => setJS(e.target.value)}
                rows={6}
                style={textareaStyle}
                placeholder="console.log('Hello');"
              />
            </div>
            <div>
              <label style={labelStyle}>Live Preview</label>
              <iframe
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <style>${css}</style>
                    </head>
                    <body>
                      ${html}
                      <script>${js}</script>
                    </body>
                  </html>
                `}
                style={{
                  width: '100%',
                  height: '300px',
                  border: '2px solid #e5e7eb',
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
          <div>
            <label style={labelStyle}>Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onloadend = () => {
                  onChange({ ...block, data: { src: reader.result as string } })
                }
                reader.readAsDataURL(file)
              }}
              style={{
                ...inputStyle,
                padding: '10px',
                cursor: 'pointer'
              }}
            />
            {block.data?.src && (
              <div style={{ marginTop: '16px' }}>
                <label style={labelStyle}>Preview</label>
                <img
                  src={block.data.src}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb'
                  }}
                />
              </div>
            )}
          </div>
        )

      case 'video':
        return (
          <div>
            <label style={labelStyle}>Video URL (YouTube/Vimeo)</label>
            <input
              type="text"
              value={block.data?.url || ''}
              onChange={(e) => onChange({ ...block, data: { url: e.target.value } })}
              placeholder="https://www.youtube.com/watch?v=..."
              style={inputStyle}
            />
          </div>
        )

      case 'note':
        return (
          <div>
            <label style={labelStyle}>Note / Pro Tip</label>
            <textarea
              value={block.data?.text || ''}
              onChange={(e) => onChange({ ...block, data: { text: e.target.value } })}
              rows={4}
              style={{ ...inputStyle, fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical' as const }}
              placeholder="Enter a helpful note or pro tip..."
            />
          </div>
        )

      case 'chart':
        return <ChartBlockEditor block={block} onChange={onChange} labelStyle={labelStyle} inputStyle={inputStyle} />

      case 'quiz':
        return (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Question</label>
              <input
                type="text"
                value={block.data?.question || ''}
                onChange={(e) => onChange({ ...block, data: { ...block.data, question: e.target.value } })}
                placeholder="What is the correct answer?"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Answer Options (one per line)</label>
              <textarea
                value={block.data?.options || ''}
                onChange={(e) => onChange({ ...block, data: { ...block.data, options: e.target.value } })}
                rows={5}
                placeholder={"Option 1\nOption 2\nOption 3\nOption 4"}
                style={{ ...inputStyle, fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical' as const }}
              />
            </div>
            <div>
              <label style={labelStyle}>Correct Answer (0 = first option, 1 = second, etc.)</label>
              <input
                type="number"
                value={block.data?.correctAnswer ?? 0}
                onChange={(e) => onChange({ ...block, data: { ...block.data, correctAnswer: parseInt(e.target.value) } })}
                min="0"
                style={inputStyle}
              />
            </div>
          </div>
        )

      default:
        return <div>Unknown block type</div>
    }
  }

  const blockColors = {
    text: { bg: '#3b82f6', light: '#eff6ff' },
    code: { bg: '#8b5cf6', light: '#f5f3ff' },
    codePreview: { bg: '#6366f1', light: '#eef2ff' },
    image: { bg: '#10b981', light: '#f0fdf4' },
    video: { bg: '#ef4444', light: '#fef2f2' },
    note: { bg: '#eab308', light: '#fefce8' },
    chart: { bg: '#14b8a6', light: '#f0fdfa' },
    quiz: { bg: '#ec4899', light: '#fdf2f8' }
  }

  const color = blockColors[block.type as keyof typeof blockColors] || { bg: '#6b7280', light: '#f9fafb' }

  return (
    <div style={{
      padding: '0',
      background: '#ffffff',
      border: `2px solid ${color.bg}`,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: color.bg,
        borderBottom: isCollapsed ? 'none' : `2px solid ${color.bg}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            {isCollapsed ? '▶' : '▼'}
          </button>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: '#fff'
          }}>
            {block.type === 'codePreview' ? 'Live Code' :
             block.type === 'text' ? 'Text Block' :
             block.type === 'code' ? 'Code Block' :
             block.type === 'image' ? 'Image Block' :
             block.type === 'video' ? 'Video Block' :
             block.type === 'note' ? 'Note Block' :
             block.type === 'chart' ? 'Chart Block' :
             block.type === 'quiz' ? 'Quiz Block' : 'Unknown'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {onDuplicate && (
            <button
              onClick={onDuplicate}
              style={{
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'all 0.2s'
              }}
              title="Duplicate this block"
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              Duplicate
            </button>
          )}
          <button
            onClick={onDelete}
            style={{
              padding: '6px 12px',
              background: 'rgba(0,0,0,0.2)',
              color: '#fff',
              border: '1px solid rgba(0,0,0,0.2)',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Content - only shown when not collapsed */}
      {!isCollapsed && (
        <div style={{ padding: '20px', background: '#ffffff' }}>
          {renderEditor()}
        </div>
      )}
    </div>
  )
}
