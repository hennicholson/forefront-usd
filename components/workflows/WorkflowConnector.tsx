'use client'
import { WorkflowConnection } from '@/lib/workflows/workflow-types'

interface WorkflowConnectorProps {
  connection: WorkflowConnection
  fromPos: { x: number; y: number }
  toPos: { x: number; y: number }
  zoom: number
  pan: { x: number; y: number }
  isSelected: boolean
  onSelect: () => void
}

export function WorkflowConnector({
  connection,
  fromPos,
  toPos,
  zoom,
  pan,
  isSelected,
  onSelect
}: WorkflowConnectorProps) {
  // Apply pan and zoom to positions
  const from = {
    x: fromPos.x * zoom + pan.x,
    y: fromPos.y * zoom + pan.y
  }
  const to = {
    x: toPos.x * zoom + pan.x,
    y: toPos.y * zoom + pan.y
  }

  // Calculate control points for smooth bezier curve
  const dx = to.x - from.x
  const dy = to.y - from.y
  const curvature = 0.3

  const controlPoint1 = {
    x: from.x,
    y: from.y + Math.abs(dy) * curvature
  }
  const controlPoint2 = {
    x: to.x,
    y: to.y - Math.abs(dy) * curvature
  }

  // Simpler path - straight line with slight curve
  const pathData = `M ${from.x} ${from.y} L ${to.x} ${to.y}`

  const strokeWidth = isSelected ? 3 : 2
  const strokeColor = isSelected ? '#fff' : '#555'

  return (
    <g onClick={onSelect} style={{ cursor: 'pointer' }}>
      {/* Invisible wider path for easier clicking */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        pointerEvents="stroke"
      />

      {/* Visible connection line */}
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        style={{
          transition: 'all 0.2s'
        }}
      />

      {/* Arrow head */}
      <defs>
        <marker
          id={`arrow-${connection.id}`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path
            d="M 0 0 L 10 5 L 0 10 z"
            fill={strokeColor}
            style={{ transition: 'fill 0.2s' }}
          />
        </marker>
      </defs>
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={strokeWidth}
        markerEnd={`url(#arrow-${connection.id})`}
      />


      {/* Label */}
      {connection.label && (
        <g>
          <text
            x={(from.x + to.x) / 2}
            y={(from.y + to.y) / 2 - 10}
            textAnchor="middle"
            fill="#666"
            fontSize="11"
            fontWeight="600"
            style={{
              background: '#000',
              padding: '4px 8px'
            }}
          >
            {connection.label}
          </text>
        </g>
      )}
    </g>
  )
}
