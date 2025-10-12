export interface MindmapNode {
  id: string
  type: 'center' | 'topic' | 'user'
  label: string
  x: number
  y: number
  size: number
  color?: string
  data?: any
}

export interface MindmapConnection {
  from: string
  to: string
  strength: number
}

interface LayoutOptions {
  width: number
  height: number
  centerRadius: number
  topicRadius: number
  userRadius: number
}

/**
 * Calculate radial positions for topic nodes around the center
 */
export function calculateTopicPositions(
  topicCount: number,
  centerX: number,
  centerY: number,
  radius: number
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = []
  const angleStep = (2 * Math.PI) / topicCount

  for (let i = 0; i < topicCount; i++) {
    const angle = i * angleStep - Math.PI / 2 // Start from top
    positions.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    })
  }

  return positions
}

/**
 * Calculate positions for user nodes around their parent topic
 */
export function calculateUserPositions(
  userCount: number,
  topicX: number,
  topicY: number,
  radius: number,
  startAngle: number = 0
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = []
  const angleStep = (2 * Math.PI) / Math.max(userCount, 3) // Minimum 3 for spacing

  for (let i = 0; i < userCount; i++) {
    const angle = startAngle + i * angleStep
    positions.push({
      x: topicX + radius * Math.cos(angle),
      y: topicY + radius * Math.sin(angle)
    })
  }

  return positions
}

/**
 * Generate complete mindmap layout from topic clusters
 */
export function generateMindmapLayout(
  clusters: Array<{
    topic: string
    users: Array<{ userId: string; userName: string; userBio: string | null; modules: string[] }>
  }>,
  options: LayoutOptions
): { nodes: MindmapNode[]; connections: MindmapConnection[] } {
  const { width, height, centerRadius, topicRadius, userRadius } = options
  const centerX = width / 2
  const centerY = height / 2

  const nodes: MindmapNode[] = []
  const connections: MindmapConnection[] = []

  // Add center node
  nodes.push({
    id: 'center',
    type: 'center',
    label: 'learning network',
    x: centerX,
    y: centerY,
    size: 80,
    color: '#000'
  })

  // Calculate topic positions
  const topicPositions = calculateTopicPositions(clusters.length, centerX, centerY, topicRadius)

  // Topic colors (black and white only)
  const topicColors = [
    '#000', '#333', '#666', '#999',
    '#000', '#333', '#666', '#999',
    '#000', '#333'
  ]

  // Add topic nodes and their user nodes
  clusters.forEach((cluster, clusterIndex) => {
    const topicId = `topic-${clusterIndex}`
    const topicPos = topicPositions[clusterIndex]
    const topicColor = topicColors[clusterIndex % topicColors.length]

    // Add topic node
    nodes.push({
      id: topicId,
      type: 'topic',
      label: cluster.topic,
      x: topicPos.x,
      y: topicPos.y,
      size: 60,
      color: topicColor,
      data: { userCount: cluster.users.length }
    })

    // Connect topic to center
    connections.push({
      from: 'center',
      to: topicId,
      strength: cluster.users.length
    })

    // Calculate user positions around this topic
    const userPositions = calculateUserPositions(
      cluster.users.length,
      topicPos.x,
      topicPos.y,
      userRadius,
      clusterIndex * 0.3 // Slight rotation offset per cluster for visual variety
    )

    // Add user nodes
    cluster.users.forEach((user, userIndex) => {
      const userId = `user-${cluster.topic}-${user.userId}`
      const userPos = userPositions[userIndex]

      nodes.push({
        id: userId,
        type: 'user',
        label: user.userName,
        x: userPos.x,
        y: userPos.y,
        size: 40,
        color: topicColor,
        data: {
          userId: user.userId,
          userName: user.userName,
          userBio: user.userBio,
          modules: user.modules,
          topicId
        }
      })

      // Connect user to topic
      connections.push({
        from: topicId,
        to: userId,
        strength: user.modules.length
      })
    })
  })

  return { nodes, connections }
}

/**
 * Apply force-directed physics simulation for organic movement
 */
export function applyForceSimulation(
  nodes: MindmapNode[],
  connections: MindmapConnection[],
  iterations: number = 50
): MindmapNode[] {
  const updatedNodes = [...nodes]
  const centerNode = updatedNodes.find(n => n.type === 'center')

  if (!centerNode) return updatedNodes

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between nodes (except center which is fixed)
    for (let i = 0; i < updatedNodes.length; i++) {
      if (updatedNodes[i].type === 'center') continue

      for (let j = i + 1; j < updatedNodes.length; j++) {
        if (updatedNodes[j].type === 'center') continue

        const dx = updatedNodes[j].x - updatedNodes[i].x
        const dy = updatedNodes[j].y - updatedNodes[i].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 100 && distance > 0) {
          const force = (100 - distance) / distance * 0.5
          updatedNodes[i].x -= (dx * force)
          updatedNodes[i].y -= (dy * force)
          updatedNodes[j].x += (dx * force)
          updatedNodes[j].y += (dy * force)
        }
      }
    }

    // Spring forces along connections
    connections.forEach(conn => {
      const fromNode = updatedNodes.find(n => n.id === conn.from)
      const toNode = updatedNodes.find(n => n.id === conn.to)

      if (!fromNode || !toNode || fromNode.type === 'center') return

      const dx = toNode.x - fromNode.x
      const dy = toNode.y - fromNode.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const idealDistance = fromNode.type === 'topic' ? 150 : 100

      if (distance > 0) {
        const force = (distance - idealDistance) / distance * 0.1
        // fromNode is already guaranteed to not be 'center' from the check above
        fromNode.x += dx * force
        fromNode.y += dy * force

        if (toNode.type !== 'center') {
          toNode.x -= dx * force
          toNode.y -= dy * force
        }
      }
    })
  }

  return updatedNodes
}

/**
 * Get color for connection based on strength
 */
export function getConnectionColor(strength: number, baseColor: string): string {
  const opacity = Math.min(0.3 + (strength * 0.1), 0.8)
  return `${baseColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`
}

/**
 * Calculate zoom level based on number of nodes
 */
export function calculateInitialZoom(nodeCount: number): number {
  if (nodeCount < 10) return 1
  if (nodeCount < 30) return 0.8
  if (nodeCount < 50) return 0.6
  return 0.5
}
