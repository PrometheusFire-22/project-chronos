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

  // Generate 8-9 nodes using Fibonacci spacing (reduced from 12 for breathing room)
  const numNodes = 9
  for (let i = 0; i < numNodes; i++) {
    // Use golden ratio spiral for positioning with more spread
    const angle = i * PHI * 2 * Math.PI
    const radius = (i / numNodes) * Math.min(width, height) * 0.42 // Increased from 0.35 for more space

    const x = width / 2 + radius * Math.cos(angle) + (rng() - 0.5) * 120 // Increased jitter
    const y = height / 2 + radius * Math.sin(angle) + (rng() - 0.5) * 120
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

  // Color palette with more teal and green (but purple still dominant)
  const colors = [
    COLORS.purple, COLORS.purple, COLORS.purple, COLORS.purple, // 40% purple
    COLORS.teal, COLORS.teal, COLORS.teal,                       // 30% teal (increased)
    COLORS.green, COLORS.green, COLORS.green                     // 30% green (increased)
  ]

  let content = ''

  // 1. SUBTLE GRID BACKGROUND
  content += generateGrid(width, height, mode) + '\n'

  // 2. DEFINE NODE POSITIONS (randomized, decentralized)
  // No central hub - distributed randomly across canvas
  const nodePositions: Array<{x: number, y: number, size: number, color: string}> = []

  const numNodes = 14 // Slightly more nodes, spread out
  const margin = 80

  for (let i = 0; i < numNodes; i++) {
    // Fully randomized positions (avoid center clustering)
    const x = margin + rng() * (width - margin * 2)
    const y = margin + rng() * (height - margin * 2)

    // Randomized sizes (20-45px range, no huge central node)
    const size = 20 + rng() * 25

    const color = randomChoice(colors, rng)

    nodePositions.push({ x, y, size, color })
  }

  // 3. DRAW EDGES (connections between nearby nodes, force-directed style)
  content += '<g id="graph-edges">\n'

  // Connect nodes based on proximity (distance-based connections)
  for (let i = 0; i < nodePositions.length; i++) {
    for (let j = i + 1; j < nodePositions.length; j++) {
      const node1 = nodePositions[i]
      const node2 = nodePositions[j]
      const distance = Math.sqrt((node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2)

      // Connect if nodes are reasonably close (threshold: 200px)
      if (distance < 200 && rng() > 0.4) {
        content += generateLine(
          node1.x, node1.y, node2.x, node2.y,
          node1.color, 2, 0.4
        ) + '\n'
      }
    }
  }

  content += '</g>\n'

  // 4. DRAW NODES (on top of edges for proper layering)
  content += '<g id="graph-nodes">\n'

  for (const node of nodePositions) {
    // All nodes are circles for graph clarity, uniform stroke
    content += generateCircle(node.x, node.y, node.size, node.color, 0.9, 3) + '\n'
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
  // Reduced to 4 waves (from 7) for less density: 2 purple, 1 teal, 1 green
  content += '<g id="timeseries-waves">\n'

  const numWaves = 4
  const waveColors = [
    COLORS.purple, COLORS.purple, // 2 purple
    COLORS.teal,                   // 1 teal
    COLORS.green                   // 1 green
  ]

  for (let i = 0; i < numWaves; i++) {
    const baseY = 120 + (i * 110) // Increased spacing from 70 to 110 for better separation
    const amplitude = 35 + rng() * 40
    const frequency = 0.01 + rng() * 0.015
    const phase = rng() * Math.PI * 2
    const color = waveColors[i]
    const strokeWidth = 2.5 + rng() * 1.5

    // Generate smooth wave path
    let pathData = `M 60,${baseY}`

    for (let x = 60; x <= width - 60; x += 5) {
      const y = baseY + Math.sin(x * frequency + phase) * amplitude
      pathData += ` L ${x},${y}`
    }

    content += `<path d="${pathData}" stroke="${color}" stroke-width="${strokeWidth}" fill="none" opacity="0.75" stroke-linecap="round" />\n`
  }

  content += '</g>\n'

  // 3. DATA POINTS on waves (reduced, suggest discrete measurements)
  content += '<g id="timeseries-datapoints">\n'

  // Add data points to 2 of the 4 waves (reduced from 3 of 7)
  const markerWaves = [0, 2] // First purple and teal
  for (const waveIdx of markerWaves) {
    const baseY = 120 + (waveIdx * 110)
    const amplitude = 35 + rng() * 40
    const frequency = 0.01 + rng() * 0.015
    const phase = rng() * Math.PI * 2
    const color = waveColors[waveIdx]

    // Reduced frequency: every 120px instead of 80px (fewer dots)
    for (let x = 120; x < width - 100; x += 120) {
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
// VECTOR DATABASE ILLUSTRATION
// Cubist multi-perspective composition (4th dimension concept)
// Inspiration: Picasso/Braque Analytical Cubism + Lissitzky spatial depth
// ============================================================================

function generateVectorIllustration(mode: 'light' | 'dark' = 'light'): string {
  const width = 800
  const height = 600
  const seed = 400
  const rng = seededRandom(seed)

  let content = ''

  // 1. BACKGROUND DEPTH PLANES (Lissitzky style)
  content += '<g id="depth-planes">\n'

  // Multiple overlapping translucent rectangles at various angles
  const planes = [
    { x: 100, y: 80, w: 300, h: 200, angle: 15, color: COLORS.purple, opacity: 0.08 },
    { x: 400, y: 150, w: 280, h: 250, angle: -12, color: COLORS.teal, opacity: 0.08 },
    { x: 200, y: 300, w: 350, h: 180, angle: 8, color: COLORS.green, opacity: 0.06 },
    { x: 450, y: 50, w: 200, h: 300, angle: -20, color: COLORS.purple, opacity: 0.06 },
  ]

  for (const plane of planes) {
    content += generateRectangle(plane.x, plane.y, plane.w, plane.h, plane.color, plane.angle, plane.opacity) + '\n'
  }

  content += '</g>\n'

  // 2. FRAGMENTED GEOMETRIC OBJECTS (Cubist decomposition)
  // Show same object from multiple viewpoints simultaneously
  content += '<g id="cubist-fragments">\n'

  const centerX = width / 2
  const centerY = height / 2

  // Central "object" - a cube shown from multiple perspectives
  // Front face
  const cubeSize = 120
  const faces = [
    // Face 1 (frontal)
    {
      points: [
        [centerX - cubeSize / 2, centerY - cubeSize / 2],
        [centerX + cubeSize / 2, centerY - cubeSize / 2],
        [centerX + cubeSize / 2, centerY + cubeSize / 2],
        [centerX - cubeSize / 2, centerY + cubeSize / 2],
      ],
      color: COLORS.purple,
      opacity: 0.7,
    },
    // Face 2 (top perspective, shifted)
    {
      points: [
        [centerX - cubeSize / 2 + 20, centerY - cubeSize / 2 - 40],
        [centerX + cubeSize / 2 + 40, centerY - cubeSize / 2 - 30],
        [centerX + cubeSize / 2 + 20, centerY - 20],
        [centerX - cubeSize / 2, centerY - 30],
      ],
      color: COLORS.teal,
      opacity: 0.6,
    },
    // Face 3 (side perspective)
    {
      points: [
        [centerX + cubeSize / 2, centerY - cubeSize / 2],
        [centerX + cubeSize / 2 + 60, centerY - cubeSize / 2 + 20],
        [centerX + cubeSize / 2 + 60, centerY + cubeSize / 2 + 20],
        [centerX + cubeSize / 2, centerY + cubeSize / 2],
      ],
      color: COLORS.green,
      opacity: 0.65,
    },
  ]

  for (const face of faces) {
    const pathData = face.points.map((point, i) => `${i === 0 ? 'M' : 'L'} ${point[0]},${point[1]}`).join(' ') + ' Z'
    content += `<path d="${pathData}" fill="${face.color}" opacity="${face.opacity}" stroke="${face.color}" stroke-width="2" />\n`
  }

  content += '</g>\n'

  // 3. FRAGMENTED CIRCLES (multiple perspectives of sphere)
  content += '<g id="sphere-fragments">\n'

  const sphereFragments = [
    { x: 200, y: 180, r: 50, color: COLORS.purple, opacity: 0.5, strokeDash: '5,5' },
    { x: 210, y: 170, r: 45, color: COLORS.teal, opacity: 0.6, strokeDash: 'none' },
    { x: 600, y: 400, r: 60, color: COLORS.green, opacity: 0.4, strokeDash: '8,4' },
    { x: 590, y: 390, r: 55, color: COLORS.purple, opacity: 0.55, strokeDash: 'none' },
  ]

  for (const frag of sphereFragments) {
    const dashAttr = frag.strokeDash !== 'none' ? `stroke-dasharray="${frag.strokeDash}"` : ''
    content += `<circle cx="${frag.x}" cy="${frag.y}" r="${frag.r}" fill="none" stroke="${frag.color}" stroke-width="2" opacity="${frag.opacity}" ${dashAttr} />\n`
    // Fill some
    if (rng() > 0.5) {
      content += generateCircle(frag.x, frag.y, frag.r, frag.color, frag.opacity * 0.3, 0) + '\n'
    }
  }

  content += '</g>\n'

  // 4. ANGULAR LINES (suggest vector directions / dimensions)
  content += '<g id="vector-lines">\n'

  const vectorLines = [
    { x1: 150, y1: 100, x2: 280, y2: 80, color: COLORS.purple },
    { x1: 500, y1: 120, x2: 630, y2: 200, color: COLORS.teal },
    { x1: 300, y1: 450, x2: 200, y2: 350, color: COLORS.green },
    { x1: 550, y1: 480, x2: 680, y2: 420, color: COLORS.purple },
    { x1: centerX, y1: centerY, x2: centerX + 80, y2: centerY - 100, color: COLORS.teal },
  ]

  for (const line of vectorLines) {
    content += generateLine(line.x1, line.y1, line.x2, line.y2, line.color, 2, 0.4) + '\n'
    // Arrowhead at endpoint
    const angle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1)
    const arrowSize = 10
    const arrowAngle = Math.PI / 6
    const arrow1X = line.x2 - arrowSize * Math.cos(angle - arrowAngle)
    const arrow1Y = line.y2 - arrowSize * Math.sin(angle - arrowAngle)
    const arrow2X = line.x2 - arrowSize * Math.cos(angle + arrowAngle)
    const arrow2Y = line.y2 - arrowSize * Math.sin(angle + arrowAngle)

    content += generateLine(line.x2, line.y2, arrow1X, arrow1Y, line.color, 2, 0.4) + '\n'
    content += generateLine(line.x2, line.y2, arrow2X, arrow2Y, line.color, 2, 0.4) + '\n'
  }

  content += '</g>\n'

  // 5. DIMENSION LABELS (suggest high-dimensional space)
  // Small triangular markers suggesting dimensional axes
  content += '<g id="dimension-markers">\n'

  const markers = [
    { x: 120, y: 500, color: COLORS.purple },
    { x: 680, y: 100, color: COLORS.teal },
    { x: 700, y: 550, color: COLORS.green },
  ]

  for (const marker of markers) {
    content += generateTriangle(marker.x, marker.y, 20, marker.color, rng() * 360, 0.6) + '\n'
  }

  content += '</g>\n'

  // 6. OVERLAPPING TRANSPARENT SQUARES (suggest vector embeddings)
  content += '<g id="embedding-layers">\n'

  for (let i = 0; i < 5; i++) {
    const x = rng() * (width - 100) + 50
    const y = rng() * (height - 100) + 50
    const size = 40 + rng() * 40
    const color = randomChoice([COLORS.purple, COLORS.teal, COLORS.green], rng)
    const rotation = rng() * 60 - 30

    content += generateRectangle(x, y, size, size, color, rotation, 0.15) + '\n'
  }

  content += '</g>\n'

  return createSVG(width, height, content, mode)
}

// ============================================================================
// RELATIONAL DATABASE ILLUSTRATION
// Mondrian-style table schema with structured grid
// Inspiration: Piet Mondrian + Max Bill + Database schema diagrams
// ============================================================================

function generateRelationalIllustration(mode: 'light' | 'dark' = 'light'): string {
  const width = 800
  const height = 600
  const seed = 500
  const rng = seededRandom(seed)

  let content = ''

  // 1. TABLE STRUCTURES (rectangular blocks representing tables)
  content += '<g id="table-blocks">\n'

  // Define 3 main tables with header + rows
  const tables = [
    // Table 1 (Users table) - left side
    {
      x: 80,
      y: 120,
      cols: 3,
      rows: 5,
      cellWidth: 70,
      cellHeight: 35,
      headerColor: COLORS.purple,
      rowColors: [COLORS.purple, COLORS.purple, COLORS.purple, COLORS.purple],
      name: 'Users',
    },
    // Table 2 (Orders table) - center
    {
      x: 320,
      y: 200,
      cols: 4,
      rows: 4,
      cellWidth: 60,
      cellHeight: 35,
      headerColor: COLORS.teal,
      rowColors: [COLORS.teal, COLORS.teal, COLORS.teal],
      name: 'Orders',
    },
    // Table 3 (Products table) - right side
    {
      x: 540,
      y: 140,
      cols: 3,
      rows: 6,
      cellWidth: 65,
      cellHeight: 35,
      headerColor: COLORS.green,
      rowColors: [COLORS.green, COLORS.green, COLORS.green, COLORS.green, COLORS.green],
      name: 'Products',
    },
  ]

  for (const table of tables) {
    // Header row (darker)
    for (let col = 0; col < table.cols; col++) {
      const x = table.x + col * table.cellWidth
      const y = table.y
      content += generateRectangle(
        x, y,
        table.cellWidth - 2, // Gap between cells
        table.cellHeight,
        table.headerColor,
        0,
        0.8
      ) + '\n'
      // Border
      content += `<rect x="${x}" y="${y}" width="${table.cellWidth - 2}" height="${table.cellHeight}" fill="none" stroke="${table.headerColor}" stroke-width="2" />\n`
    }

    // Data rows (lighter)
    for (let row = 0; row < table.rows; row++) {
      for (let col = 0; col < table.cols; col++) {
        const x = table.x + col * table.cellWidth
        const y = table.y + (row + 1) * table.cellHeight
        const rowColor = table.rowColors[row % table.rowColors.length]
        content += generateRectangle(
          x, y,
          table.cellWidth - 2,
          table.cellHeight,
          rowColor,
          0,
          0.15
        ) + '\n'
        // Border
        content += `<rect x="${x}" y="${y}" width="${table.cellWidth - 2}" height="${table.cellHeight}" fill="none" stroke="${rowColor}" stroke-width="1" opacity="0.6" />\n`
      }
    }
  }

  content += '</g>\n'

  // 2. RELATIONSHIP LINES (foreign keys connecting tables)
  content += '<g id="relationship-lines">\n'

  // Users -> Orders (1-to-many)
  const users_x = tables[0].x + (tables[0].cols * tables[0].cellWidth) / 2
  const users_y = tables[0].y + (tables[0].rows + 1) * tables[0].cellHeight
  const orders_x = tables[1].x
  const orders_y = tables[1].y + tables[1].cellHeight * 2

  content += generateLine(users_x, users_y, orders_x, orders_y, COLORS.purple, 3, 0.6) + '\n'

  // Orders -> Products (many-to-many concept)
  const orders_x2 = tables[1].x + tables[1].cols * tables[1].cellWidth
  const orders_y2 = tables[1].y + tables[1].cellHeight * 2
  const products_x = tables[2].x
  const products_y = tables[2].y + tables[2].cellHeight * 3

  content += generateLine(orders_x2, orders_y2, products_x, products_y, COLORS.teal, 3, 0.6) + '\n'

  // Add relationship indicators (circles at connection points)
  const connectionPoints = [
    { x: users_x, y: users_y, color: COLORS.purple },
    { x: orders_x, y: orders_y, color: COLORS.purple },
    { x: orders_x2, y: orders_y2, color: COLORS.teal },
    { x: products_x, y: products_y, color: COLORS.green },
  ]

  for (const point of connectionPoints) {
    content += generateCircle(point.x, point.y, 6, point.color, 1, 2) + '\n'
  }

  content += '</g>\n'

  // 3. MONDRIAN ACCENT BLOCKS (decorative, suggests structured data)
  content += '<g id="mondrian-accents">\n'

  const accentBlocks = [
    { x: 60, y: 450, w: 100, h: 80, color: COLORS.purple, opacity: 0.3 },
    { x: 680, y: 80, w: 80, h: 60, color: COLORS.teal, opacity: 0.3 },
    { x: 620, y: 480, w: 120, h: 70, color: COLORS.green, opacity: 0.25 },
  ]

  for (const block of accentBlocks) {
    content += generateRectangle(block.x, block.y, block.w, block.h, block.color, 0, block.opacity) + '\n'
    content += `<rect x="${block.x}" y="${block.y}" width="${block.w}" height="${block.h}" fill="none" stroke="${block.color}" stroke-width="3" />\n`
  }

  content += '</g>\n'

  // 4. GRID OVERLAY (subtle Mondrian grid)
  const gridColor = mode === 'light' ? COLORS.light.grid : COLORS.dark.grid
  content += '<g id="mondrian-grid">\n'

  // Vertical lines (fewer than full grid)
  const verticalLines = [200, 400, 600]
  for (const x of verticalLines) {
    content += `<line x1="${x}" y1="50" x2="${x}" y2="${height - 50}" stroke="${gridColor}" stroke-width="2" opacity="0.2" />\n`
  }

  // Horizontal lines
  const horizontalLines = [150, 300, 450]
  for (const y of horizontalLines) {
    content += `<line x1="50" y1="${y}" x2="${width - 50}" y2="${y}" stroke="${gridColor}" stroke-width="2" opacity="0.2" />\n`
  }

  content += '</g>\n'

  // 5. KEY INDICATORS (suggest primary/foreign keys)
  content += '<g id="key-indicators">\n'

  // Small squares suggesting key columns
  const keyMarkers = [
    { x: tables[0].x + 10, y: tables[0].y + 10, color: COLORS.purple }, // Users PK
    { x: tables[1].x + 10, y: tables[1].y + 10, color: COLORS.teal },   // Orders PK
    { x: tables[2].x + 10, y: tables[2].y + 10, color: COLORS.green },  // Products PK
  ]

  for (const marker of keyMarkers) {
    content += generateRectangle(marker.x, marker.y, 12, 12, marker.color, 45, 1) + '\n'
  }

  content += '</g>\n'

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

  // Generate vector database illustration (light & dark modes)
  const vectorLight = generateVectorIllustration('light')
  const vectorDark = generateVectorIllustration('dark')

  await writeSVG(path.join(outputDir, 'vector-database-light.svg'), vectorLight)
  await writeSVG(path.join(outputDir, 'vector-database-dark.svg'), vectorDark)

  // Generate relational database illustration (light & dark modes)
  const relationalLight = generateRelationalIllustration('light')
  const relationalDark = generateRelationalIllustration('dark')

  await writeSVG(path.join(outputDir, 'relational-database-light.svg'), relationalLight)
  await writeSVG(path.join(outputDir, 'relational-database-dark.svg'), relationalDark)

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
  generateVectorIllustration,
  generateRelationalIllustration,
  generateGrid,
  generateCircle,
  generateTriangle,
  generateRectangle,
  generateLine,
  createSVG
}
