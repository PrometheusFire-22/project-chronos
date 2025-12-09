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
  generateGrid,
  generateCircle,
  generateTriangle,
  generateRectangle,
  generateLine,
  createSVG
}
