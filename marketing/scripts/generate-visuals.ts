#!/usr/bin/env tsx
/**
 * VISUAL ASSETS GENERATOR
 * ========================
 * Generates abstract geometric illustrations for Automatonic AI marketing site
 * Inspired by: Kandinsky, Mondrian, Lissitzky, Suprematism, De Stijl, Constructivism
 *
 * ARTISTIC PHILOSOPHY:
 * - Code-generated SVGs (NOT AI tools, NOT stock images)
 * - Sophisticated geometric abstraction
 * - Mathematical precision (golden ratio, Fibonacci)
 * - Brand palette: Purple (#8B5CF6), Teal (#06B6D4), Green (#10B981)
 * - Dual-mode support (light & dark backgrounds)
 *
 * Epic: CHRONOS-283 (Initial Visual Graphics)
 * Date: 2025-12-09
 */

import * as fs from 'fs/promises'
import * as path from 'path'

// ============================================================================
// BRAND COLORS & THEME CONFIGURATION
// ============================================================================

const COLORS = {
  // Primary brand colors
  purple: '#8B5CF6',    // violet-500 - Primary, dominant
  teal: '#06B6D4',      // cyan-500 - Secondary, energy
  green: '#10B981',     // emerald-500 - Tertiary, growth

  // Background colors
  light: {
    bg: '#FFFFFF',        // White
    grid: '#E5E7EB',      // gray-200 - Subtle grid
    accent: '#F3F4F6'     // gray-100 - Very subtle
  },
  dark: {
    bg: '#0F172A',        // slate-900 - Dark background
    grid: '#334155',      // slate-700 - Visible grid
    accent: '#1E293B'     // slate-800 - Subtle accent
  }
} as const

// Mathematical constants for proportions
const PHI = 1.618 // Golden ratio
const FIBONACCI = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Seeded random number generator for reproducible randomness
 * Allows same "random" output every time with same seed
 */
function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 9301 + 49297) % 233280
    return state / 233280
  }
}

/**
 * Get random element from array using seeded random
 */
function randomChoice<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

/**
 * Map value from one range to another
 */
function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

/**
 * Rotate point around origin
 */
function rotatePoint(x: number, y: number, angle: number): [number, number] {
  const rad = (angle * Math.PI) / 180
  return [
    x * Math.cos(rad) - y * Math.sin(rad),
    x * Math.sin(rad) + y * Math.cos(rad)
  ]
}

// ============================================================================
// SVG GENERATION UTILITIES
// ============================================================================

/**
 * Create SVG wrapper with viewBox
 */
function createSVG(width: number, height: number, content: string, mode: 'light' | 'dark' = 'light'): string {
  const bgColor = mode === 'light' ? COLORS.light.bg : COLORS.dark.bg

  return `<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 ${width} ${height}"
  width="${width}"
  height="${height}"
  role="img"
  aria-label="Automatonic AI Geometric Illustration"
>
  <title>Automatonic AI - Abstract Geometric Composition</title>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="${bgColor}" />

  ${content}
</svg>`
}

/**
 * Generate Mondrian-style grid pattern
 */
function generateGrid(width: number, height: number, mode: 'light' | 'dark' = 'light'): string {
  const gridColor = mode === 'light' ? COLORS.light.grid : COLORS.dark.grid
  const opacity = mode === 'light' ? '0.3' : '0.5' // More visible in dark mode
  const spacing = 40 // Grid cell size

  let lines = ''

  // Vertical lines
  for (let x = 0; x <= width; x += spacing) {
    lines += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${gridColor}" stroke-width="1" opacity="${opacity}" />\n`
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += spacing) {
    lines += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${gridColor}" stroke-width="1" opacity="${opacity}" />\n`
  }

  return `<g id="grid-pattern">\n${lines}</g>`
}

/**
 * Generate circle node (graph theory / Kandinsky style)
 */
function generateCircle(
  cx: number,
  cy: number,
  radius: number,
  color: string,
  opacity: number = 1,
  strokeWidth: number = 0
): string {
  const stroke = strokeWidth > 0 ? `stroke="${COLORS.light.bg}" stroke-width="${strokeWidth}"` : ''
  return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${color}" opacity="${opacity}" ${stroke} />`
}

/**
 * Generate triangle (Suprematism / Malevich style)
 */
function generateTriangle(
  x: number,
  y: number,
  size: number,
  color: string,
  rotation: number = 0,
  opacity: number = 1
): string {
  const height = size * Math.sqrt(3) / 2
  const points = [
    [0, -height * 0.67],
    [-size / 2, height * 0.33],
    [size / 2, height * 0.33]
  ]

  const rotatedPoints = points.map(([px, py]) => rotatePoint(px, py, rotation))
  const pathData = rotatedPoints.map(([px, py], i) =>
    `${i === 0 ? 'M' : 'L'} ${x + px},${y + py}`
  ).join(' ') + ' Z'

  return `<path d="${pathData}" fill="${color}" opacity="${opacity}" />`
}

/**
 * Generate rectangle (De Stijl / Mondrian style)
 */
function generateRectangle(
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  rotation: number = 0,
  opacity: number = 1
): string {
  return `<rect
    x="${x}"
    y="${y}"
    width="${width}"
    height="${height}"
    fill="${color}"
    opacity="${opacity}"
    transform="rotate(${rotation} ${x + width/2} ${y + height/2})"
  />`
}

/**
 * Generate connecting line/edge (graph theory)
 */
function generateLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number = 2,
  opacity: number = 0.6
): string {
  return `<line
    x1="${x1}"
    y1="${y1}"
    x2="${x2}"
    y2="${y2}"
    stroke="${color}"
    stroke-width="${width}"
    opacity="${opacity}"
    stroke-linecap="round"
  />`
}

// ============================================================================
// HERO GRAPHIC GENERATOR
// Hybrid: Kandinsky (floating shapes) + Lissitzky (depth) + Mondrian (grid)
// ============================================================================

function generateHeroGraphic(mode: 'light' | 'dark' = 'light'): string {
  const width = 1920
  const height = 1080
  const seed = 42 // Reproducible randomness
  const rng = seededRandom(seed)

  // Color palette for shapes (purple dominant)
  const colors = [
    COLORS.purple, COLORS.purple, COLORS.purple, // 60% purple
    COLORS.teal, COLORS.teal,                     // 30% teal
    COLORS.green                                   // 10% green
  ]

  let content = ''

  // 1. GRID BACKGROUND (Mondrian inspiration)
  content += generateGrid(width, height, mode) + '\n'

  // 2. LAYERED PLANES (Lissitzky spatial depth)
  // Large background rectangles for depth illusion
  content += '<g id="depth-planes">\n'
  content += generateRectangle(
    width * 0.6, height * 0.1,
    width * 0.35, height * 0.4,
    COLORS.teal, 15, 0.1
  ) + '\n'
  content += generateRectangle(
    width * 0.05, height * 0.5,
    width * 0.3, height * 0.45,
    COLORS.purple, -10, 0.08
  ) + '\n'
  content += '</g>\n'

  // 3. CONNECTING EDGES (graph relationships)
  content += '<g id="connections">\n'

  // Define node positions first (we'll draw edges before nodes for layering)
  const nodePositions: Array<{x: number, y: number, size: number, color: string}> = []

  // Generate 10-12 nodes using Fibonacci spacing
  const numNodes = 12
  for (let i = 0; i < numNodes; i++) {
    // Use golden ratio spiral for positioning
    const angle = i * PHI * 2 * Math.PI
    const radius = (i / numNodes) * Math.min(width, height) * 0.35

    const x = width / 2 + radius * Math.cos(angle) + (rng() - 0.5) * 100
    const y = height / 2 + radius * Math.sin(angle) + (rng() - 0.5) * 100
    const size = FIBONACCI[i % FIBONACCI.length] * 3 + 20
    const color = randomChoice(colors, rng)

    nodePositions.push({ x, y, size, color })
  }

  // Draw edges between nearby nodes (force-directed layout concept)
  for (let i = 0; i < nodePositions.length; i++) {
    for (let j = i + 1; j < nodePositions.length; j++) {
      const node1 = nodePositions[i]
      const node2 = nodePositions[j]
      const distance = Math.sqrt((node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2)

      // Only connect nodes within certain distance
      if (distance < 300 && rng() > 0.5) {
        content += generateLine(
          node1.x, node1.y, node2.x, node2.y,
          node1.color, 2, 0.3
        ) + '\n'
      }
    }
  }
  content += '</g>\n'

  // 4. GEOMETRIC NODES (Kandinsky floating elements)
  content += '<g id="geometric-nodes">\n'

  for (const node of nodePositions) {
    const shapeType = rng()

    if (shapeType < 0.6) {
      // Circle (60% - most common, Kandinsky style)
      content += generateCircle(node.x, node.y, node.size, node.color, 0.9, 3) + '\n'
    } else if (shapeType < 0.85) {
      // Triangle (25% - Suprematism)
      content += generateTriangle(node.x, node.y, node.size * 2, node.color, rng() * 360, 0.9) + '\n'
    } else {
      // Rectangle (15% - De Stijl)
      content += generateRectangle(
        node.x - node.size/2, node.y - node.size/2,
        node.size, node.size,
        node.color, rng() * 45, 0.9
      ) + '\n'
    }
  }

  content += '</g>\n'

  // 5. ACCENT ELEMENTS (smaller decorative shapes)
  content += '<g id="accent-shapes">\n'
  for (let i = 0; i < 5; i++) {
    const x = rng() * width
    const y = rng() * height
    const size = 10 + rng() * 20
    content += generateCircle(x, y, size, randomChoice(colors, rng), 0.4) + '\n'
  }
  content += '</g>\n'

  return createSVG(width, height, content, mode)
}

// ============================================================================
// GRAPH DATABASE ILLUSTRATION
// Force-directed network with prominent nodes and edges
// Inspiration: Sol LeWitt + Kandinsky + Network graph theory
// ============================================================================

function generateGraphDatabaseIllustration(mode: 'light' | 'dark' = 'light'): string {
  const width = 800
  const height = 600
  const seed = 100 // Different seed for different composition
  const rng = seededRandom(seed)

  // Color palette (purple dominant for graph nodes)
  const colors = [
    COLORS.purple, COLORS.purple, COLORS.purple, // 60% purple
    COLORS.teal, COLORS.teal,                     // 30% teal
    COLORS.green                                   // 10% green
  ]

  let content = ''

  // 1. SUBTLE GRID BACKGROUND
  content += generateGrid(width, height, mode) + '\n'

  // 2. DEFINE NODE POSITIONS (hierarchical structure)
  // Create a 3-layer network: central hub, inner ring, outer ring
  const nodePositions: Array<{x: number, y: number, size: number, color: string, layer: number}> = []

  // Central hub (1 large node)
  const centerX = width / 2
  const centerY = height / 2
  nodePositions.push({
    x: centerX,
    y: centerY,
    size: 60,
    color: COLORS.purple,
    layer: 0
  })

  // Inner ring (5 nodes)
  const innerRadius = 140
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * 2 * Math.PI - Math.PI / 2
    nodePositions.push({
      x: centerX + innerRadius * Math.cos(angle),
      y: centerY + innerRadius * Math.sin(angle),
      size: 40,
      color: randomChoice(colors, rng),
      layer: 1
    })
  }

  // Outer ring (8 nodes)
  const outerRadius = 240
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * 2 * Math.PI - Math.PI / 2 + (Math.PI / 16) // Slight offset
    nodePositions.push({
      x: centerX + outerRadius * Math.cos(angle) + (rng() - 0.5) * 30,
      y: centerY + outerRadius * Math.sin(angle) + (rng() - 0.5) * 30,
      size: 25 + rng() * 15,
      color: randomChoice(colors, rng),
      layer: 2
    })
  }

  // 3. DRAW EDGES (connections between layers and within layers)
  content += '<g id="graph-edges">\n'

  // Connect center to all inner ring nodes
  for (let i = 1; i <= 5; i++) {
    content += generateLine(
      nodePositions[0].x, nodePositions[0].y,
      nodePositions[i].x, nodePositions[i].y,
      nodePositions[i].color, 3, 0.6
    ) + '\n'
  }

  // Connect inner ring nodes to outer ring nodes (selective connections)
  for (let i = 1; i <= 5; i++) {
    const innerNode = nodePositions[i]
    // Each inner node connects to 2-3 outer nodes
    const numConnections = 2 + Math.floor(rng() * 2)
    for (let j = 0; j < numConnections; j++) {
      const outerNodeIdx = 6 + Math.floor(rng() * 8)
      const outerNode = nodePositions[outerNodeIdx]
      content += generateLine(
        innerNode.x, innerNode.y,
        outerNode.x, outerNode.y,
        outerNode.color, 2, 0.4
      ) + '\n'
    }
  }

  // Some connections within outer ring (creates mesh)
  for (let i = 6; i < nodePositions.length - 1; i++) {
    if (rng() > 0.6) {
      const node1 = nodePositions[i]
      const node2 = nodePositions[i + 1]
      content += generateLine(
        node1.x, node1.y, node2.x, node2.y,
        node1.color, 1.5, 0.3
      ) + '\n'
    }
  }

  content += '</g>\n'

  // 4. DRAW NODES (on top of edges for proper layering)
  content += '<g id="graph-nodes">\n'

  for (const node of nodePositions) {
    // All nodes are circles for graph clarity
    const strokeWidth = node.layer === 0 ? 5 : 3 // Thicker stroke for central node
    content += generateCircle(node.x, node.y, node.size, node.color, 0.95, strokeWidth) + '\n'
  }

  content += '</g>\n'

  // 5. ACCENT DOTS (suggest more data beyond visible graph)
  content += '<g id="accent-dots">\n'
  for (let i = 0; i < 4; i++) {
    const x = rng() * width
    const y = rng() * height
    content += generateCircle(x, y, 6, randomChoice(colors, rng), 0.3) + '\n'
  }
  content += '</g>\n'

  return createSVG(width, height, content, mode)
}

// ============================================================================
// GEOSPATIAL DATABASE ILLUSTRATION
// Circle-packed world map (abstract geometric continents)
// Inspiration: Oliver Byrne's Euclid + Circle packing algorithms
// ============================================================================

function generateGeospatialIllustration(mode: 'light' | 'dark' = 'light'): string {
  const width = 800
  const height = 600
  const seed = 200
  const rng = seededRandom(seed)

  let content = ''

  // 1. NO GRID for geospatial (cleaner map aesthetic)

  // 2. DEFINE CONTINENTS using circle clusters
  // We'll create abstract land masses using circles of uniform size
  const circleRadius = 18

  // Helper function to create a continent cluster
  function createContinent(
    centerX: number,
    centerY: number,
    rows: number,
    cols: number,
    color: string,
    randomness: number = 0.3
  ): string {
    let circles = ''
    const spacing = circleRadius * 2 * 0.9 // Slight overlap for organic look

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Hexagonal packing for tighter arrangement
        const offsetX = row % 2 === 0 ? 0 : spacing / 2
        const x = centerX + col * spacing + offsetX + (rng() - 0.5) * spacing * randomness
        const y = centerY + row * spacing * 0.866 + (rng() - 0.5) * spacing * randomness // 0.866 = sqrt(3)/2

        circles += generateCircle(x, y, circleRadius, color, 0.85, 0) + '\n'
      }
    }
    return circles
  }

  content += '<g id="geospatial-map">\n'

  // 3. DRAW "CONTINENTS" (purple for land)
  // North America-ish (left side, upper)
  content += createContinent(180, 180, 5, 6, COLORS.purple, 0.4)

  // South America-ish (left side, lower)
  content += createContinent(200, 380, 4, 3, COLORS.purple, 0.3)

  // Europe-ish (center-right, upper)
  content += createContinent(440, 160, 3, 5, COLORS.purple, 0.35)

  // Africa-ish (center-right, middle)
  content += createContinent(460, 320, 6, 4, COLORS.purple, 0.3)

  // Asia-ish (right side, large)
  content += createContinent(580, 200, 5, 7, COLORS.purple, 0.4)

  // Australia-ish (right side, lower, small)
  content += createContinent(640, 450, 2, 3, COLORS.purple, 0.25)

  content += '</g>\n'

  // 4. DATA POINTS / MARKERS (teal and green pins)
  content += '<g id="geospatial-markers">\n'

  // Major hubs (teal - larger)
  const majorHubs = [
    { x: 200, y: 200 }, // North America
    { x: 460, y: 180 }, // Europe
    { x: 480, y: 340 }, // Africa
    { x: 600, y: 240 }, // Asia
    { x: 220, y: 400 }, // South America
  ]

  for (const hub of majorHubs) {
    // Pin style: small dot + outer ring
    content += generateCircle(hub.x, hub.y, 8, COLORS.teal, 1, 0) + '\n'
    content += generateCircle(hub.x, hub.y, 16, COLORS.teal, 0.3, 2) + '\n'
  }

  // Minor markers (green - smaller, scattered)
  const minorMarkers = [
    { x: 160, y: 240 },
    { x: 240, y: 160 },
    { x: 430, y: 200 },
    { x: 500, y: 300 },
    { x: 620, y: 200 },
    { x: 660, y: 280 },
    { x: 640, y: 460 },
    { x: 180, y: 420 },
  ]

  for (const marker of minorMarkers) {
    content += generateCircle(marker.x, marker.y, 5, COLORS.green, 1, 0) + '\n'
  }

  content += '</g>\n'

  // 5. CONNECTION LINES (suggest geospatial relationships)
  content += '<g id="geospatial-connections">\n'

  // Connect some major hubs with curved paths (suggest global connections)
  const connections = [
    [majorHubs[0], majorHubs[1]], // NA to Europe
    [majorHubs[1], majorHubs[3]], // Europe to Asia
    [majorHubs[0], majorHubs[4]], // NA to SA
    [majorHubs[1], majorHubs[2]], // Europe to Africa
  ]

  for (const [hub1, hub2] of connections) {
    content += generateLine(
      hub1.x, hub1.y, hub2.x, hub2.y,
      COLORS.teal, 1.5, 0.25
    ) + '\n'
  }

  content += '</g>\n'

  // 6. COORDINATE GRID (subtle, suggests lat/long)
  content += '<g id="coordinate-grid">\n'
  const gridColor = mode === 'light' ? COLORS.light.grid : COLORS.dark.grid
  const gridOpacity = mode === 'light' ? '0.15' : '0.25'

  // Vertical meridians (every ~100px)
  for (let x = 100; x < width; x += 150) {
    content += `<line x1="${x}" y1="50" x2="${x}" y2="${height - 50}" stroke="${gridColor}" stroke-width="1" opacity="${gridOpacity}" stroke-dasharray="4,4" />\n`
  }

  // Horizontal parallels
  for (let y = 100; y < height; y += 150) {
    content += `<line x1="50" y1="${y}" x2="${width - 50}" y2="${y}" stroke="${gridColor}" stroke-width="1" opacity="${gridOpacity}" stroke-dasharray="4,4" />\n`
  }

  content += '</g>\n'

  return createSVG(width, height, content, mode)
}

// ============================================================================
// TIME-SERIES DATABASE ILLUSTRATION
// Flowing temporal lines with rhythmic patterns
// Inspiration: Bridget Riley + Flow fields + Data visualization
// ============================================================================

function generateTimeSeriesIllustration(mode: 'light' | 'dark' = 'light'): string {
  const width = 800
  const height = 600
  const seed = 300
  const rng = seededRandom(seed)

  let content = ''

  // 1. TIME AXIS (subtle horizontal reference)
  const gridColor = mode === 'light' ? COLORS.light.grid : COLORS.dark.grid
  content += `<line x1="60" y1="${height / 2}" x2="${width - 60}" y2="${height / 2}" stroke="${gridColor}" stroke-width="1" opacity="0.2" stroke-dasharray="2,4" />\n`

  // 2. FLOWING TIME-SERIES WAVES
  // Multiple overlapping sine-like waves that suggest temporal flow
  content += '<g id="timeseries-waves">\n'

  const numWaves = 7
  const waveColors = [
    COLORS.purple, COLORS.purple, COLORS.purple, // More purple
    COLORS.teal, COLORS.teal,
    COLORS.green, COLORS.green
  ]

  for (let i = 0; i < numWaves; i++) {
    const baseY = 100 + (i * 70)
    const amplitude = 30 + rng() * 40
    const frequency = 0.01 + rng() * 0.015
    const phase = rng() * Math.PI * 2
    const color = waveColors[i]
    const strokeWidth = 2 + rng() * 2

    // Generate smooth wave path
    let pathData = `M 60,${baseY}`

    for (let x = 60; x <= width - 60; x += 5) {
      const y = baseY + Math.sin(x * frequency + phase) * amplitude
      pathData += ` L ${x},${y}`
    }

    content += `<path d="${pathData}" stroke="${color}" stroke-width="${strokeWidth}" fill="none" opacity="0.7" stroke-linecap="round" />\n`
  }

  content += '</g>\n'

  // 3. DATA POINTS on waves (suggest discrete measurements)
  content += '<g id="timeseries-datapoints">\n'

  // Select a few waves and add data point markers
  const markerWaves = [1, 3, 5]
  for (const waveIdx of markerWaves) {
    const baseY = 100 + (waveIdx * 70)
    const amplitude = 30 + rng() * 40
    const frequency = 0.01 + rng() * 0.015
    const phase = rng() * Math.PI * 2
    const color = waveColors[waveIdx]

    // Add markers at regular intervals
    for (let x = 100; x < width - 100; x += 80) {
      const y = baseY + Math.sin(x * frequency + phase) * amplitude
      content += generateCircle(x, y, 4, color, 1, 0) + '\n'
    }
  }

  content += '</g>\n'

  // 4. VERTICAL TIME MARKERS (suggest time intervals)
  content += '<g id="time-markers">\n'

  for (let x = 150; x < width - 60; x += 150) {
    content += `<line x1="${x}" y1="80" x2="${x}" y2="${height - 80}" stroke="${gridColor}" stroke-width="1" opacity="0.15" stroke-dasharray="3,6" />\n`

    // Small accent at top
    content += generateCircle(x, 70, 3, COLORS.teal, 0.4) + '\n'
  }

  content += '</g>\n'

  // 5. TREND INDICATORS (arrows suggesting temporal direction)
  content += '<g id="trend-indicators">\n'

  // Upward trend arrow (right side, purple)
  const arrowX = width - 120
  const arrowY = 200
  const arrowPath = `M ${arrowX},${arrowY + 40} L ${arrowX},${arrowY} L ${arrowX - 10},${arrowY + 12} M ${arrowX},${arrowY} L ${arrowX + 10},${arrowY + 12}`
  content += `<path d="${arrowPath}" stroke="${COLORS.purple}" stroke-width="3" fill="none" opacity="0.6" stroke-linecap="round" stroke-linejoin="round" />\n`

  // Downward trend arrow (right side, lower, teal)
  const arrowX2 = width - 120
  const arrowY2 = 450
  const arrowPath2 = `M ${arrowX2},${arrowY2 - 40} L ${arrowX2},${arrowY2} L ${arrowX2 - 10},${arrowY2 - 12} M ${arrowX2},${arrowY2} L ${arrowX2 + 10},${arrowY2 - 12}`
  content += `<path d="${arrowPath2}" stroke="${COLORS.teal}" stroke-width="3" fill="none" opacity="0.6" stroke-linecap="round" stroke-linejoin="round" />\n`

  content += '</g>\n'

  // 6. TEMPORAL GRADIENT OVERLAY (subtle, suggests flow direction)
  content += '<defs>\n'
  content += '  <linearGradient id="temporal-gradient" x1="0%" y1="0%" x2="100%" y2="0%">\n'
  content += `    <stop offset="0%" style="stop-color:${COLORS.purple};stop-opacity:0.05" />\n`
  content += `    <stop offset="100%" style="stop-color:${COLORS.teal};stop-opacity:0.05" />\n`
  content += '  </linearGradient>\n'
  content += '</defs>\n'
  content += `<rect x="60" y="80" width="${width - 120}" height="${height - 160}" fill="url(#temporal-gradient)" />\n`

  return createSVG(width, height, content, mode)
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/**
 * Ensure directory exists
 */
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

/**
 * Write SVG file
 */
async function writeSVG(filePath: string, content: string): Promise<void> {
  await fs.writeFile(filePath, content, 'utf-8')
  console.log(`  ✅ Generated ${path.basename(filePath)}`)
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🎨 Visual Assets Generator')
  console.log('═══════════════════════════════════════')
  console.log('')

  // Output directory
  const outputDir = path.join(process.cwd(), 'marketing', 'assets', 'illustrations')
  await ensureDir(outputDir)

  console.log('📁 Output directory:', outputDir)
  console.log('')
  console.log('🔄 Generating hero graphics...')

  // Generate hero graphics (light & dark modes)
  const heroLight = generateHeroGraphic('light')
  const heroDark = generateHeroGraphic('dark')

  await writeSVG(path.join(outputDir, 'hero-light.svg'), heroLight)
  await writeSVG(path.join(outputDir, 'hero-dark.svg'), heroDark)

  console.log('')
  console.log('🔄 Generating database paradigm illustrations...')

  // Generate graph database illustration (light & dark modes)
  const graphLight = generateGraphDatabaseIllustration('light')
  const graphDark = generateGraphDatabaseIllustration('dark')

  await writeSVG(path.join(outputDir, 'graph-database-light.svg'), graphLight)
  await writeSVG(path.join(outputDir, 'graph-database-dark.svg'), graphDark)

  // Generate geospatial database illustration (light & dark modes)
  const geospatialLight = generateGeospatialIllustration('light')
  const geospatialDark = generateGeospatialIllustration('dark')

  await writeSVG(path.join(outputDir, 'geospatial-database-light.svg'), geospatialLight)
  await writeSVG(path.join(outputDir, 'geospatial-database-dark.svg'), geospatialDark)

  // Generate time-series database illustration (light & dark modes)
  const timeSeriesLight = generateTimeSeriesIllustration('light')
  const timeSeriesDark = generateTimeSeriesIllustration('dark')

  await writeSVG(path.join(outputDir, 'timeseries-database-light.svg'), timeSeriesLight)
  await writeSVG(path.join(outputDir, 'timeseries-database-dark.svg'), timeSeriesDark)

  console.log('')
  console.log('✅ Asset generation complete!')
  console.log(`   Output: ${outputDir}`)
  console.log('')
  console.log('💡 Next steps:')
  console.log('   1. Review generated SVGs in browser/editor')
  console.log('   2. Integrate into Next.js pages')
  console.log('   3. Add Framer Motion animations')
}

// Run if called directly (ES module compatible)
const isMainModule = import.meta.url === `file://${process.argv[1]}`
if (isMainModule) {
  main().catch((error) => {
    console.error('❌ Error generating visual assets:', error)
    process.exit(1)
  })
}

export {
  generateHeroGraphic,
  generateGraphDatabaseIllustration,
  generateGeospatialIllustration,
  generateTimeSeriesIllustration,
  generateGrid,
  generateCircle,
  generateTriangle,
  generateRectangle,
  generateLine,
  createSVG
}
