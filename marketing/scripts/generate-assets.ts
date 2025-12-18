/**
 * ═══════════════════════════════════════════════════════════════════════
 * ASSET GENERATION SCRIPT
 * ═══════════════════════════════════════════════════════════════════════
 *
 * PURPOSE:
 * Automated generation of favicons and marketing assets from SVG logos.
 *
 * WHAT THIS SCRIPT DOES:
 * 1. Reads SVG logo files from /marketing/assets/logos/
 * 2. Converts SVG → PNG at multiple sizes (16x16, 32x32, etc.)
 * 3. Outputs favicons to /marketing/assets/favicons/
 * 4. Generates manifest.json for PWA support (future)
 *
 * WHY TYPESCRIPT INSTEAD OF MANUAL EXPORT:
 * ─────────────────────────────────────────────────────────────────────
 * - Repeatable: `pnpm run generate:assets` regenerates everything
 * - Version controlled: Script tracks HOW assets are built
 * - Scalable: Easy to add new sizes/formats later
 * - Consistent: Same quality/settings every time
 *
 * HOW TO RUN:
 * ─────────────────────────────────────────────────────────────────────
 * ```bash
 * # Install dependencies (one-time)
 * pnpm add sharp @types/node
 *
 * # Run script
 * npx tsx marketing/scripts/generate-assets.ts
 *
 * # Or add to package.json scripts:
 * pnpm run generate:assets
 * ```
 *
 * DEPENDENCIES:
 * ─────────────────────────────────────────────────────────────────────
 * - sharp: High-performance image processing (Node.js library)
 * - fs/promises: Node.js file system (reading/writing files)
 * - path: Node.js path manipulation (cross-platform file paths)
 *
 * TYPESCRIPT LEARNING NOTES:
 * ─────────────────────────────────────────────────────────────────────
 * If you're new to TypeScript, this file demonstrates:
 * - Import statements (bringing in external libraries)
 * - Interfaces (defining object shapes)
 * - Async/await (handling slow operations like file I/O)
 * - Type annotations (: Type syntax)
 * - Template literals (`string ${variable}`)
 * - Array methods (.map, .forEach)
 *
 * See: docs/guides/development/typescript_frontend_primer.md
 *
 * FILE INFO:
 * ─────────────────────────────────────────────────────────────────────
 * Version: 1.0
 * Date: 2025-12-08
 * Epic: CHRONOS-280
 * Story: CHRONOS-282
 * Maintainer: Project Chronos Team
 * ═══════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════════════════════════════════

/**
 * IMPORT EXPLANATION (for HTML/CSS developers):
 * ───────────────────────────────────────────────────────────────────────
 * Similar to CSS @import, brings in code from other files/packages.
 *
 * Syntax: import { thing } from 'package-name'
 *   - { thing }: Named import (specific function/object)
 *   - 'package-name': Package name (from node_modules/) or file path
 *
 * Example CSS parallel:
 *   @import 'reset.css';        (CSS)
 *   import sharp from 'sharp';  (TypeScript)
 */

// Sharp: Image processing library
// Docs: https://sharp.pixelplumbing.com/
import sharp from 'sharp';

// Resvg: SVG to PNG renderer (Rust-based, very fast)
// Docs: https://github.com/yisibl/resvg-js
import { Resvg } from '@resvg/resvg-js';

// Node.js built-in modules (no pnpm install needed)
import { promises as fs } from 'fs';  // File system (async version)
import path from 'path';               // Path manipulation (cross-platform)
import { fileURLToPath } from 'url';   // Convert import.meta.url to file path

// ═══════════════════════════════════════════════════════════════════════
// PATH SETUP
// ═══════════════════════════════════════════════════════════════════════

/**
 * EXPLANATION:
 * ───────────────────────────────────────────────────────────────────────
 * In ES modules (modern TypeScript), __dirname doesn't exist.
 * We recreate it using import.meta.url.
 *
 * Process:
 * 1. import.meta.url = "file:///home/user/project/scripts/generate-assets.ts"
 * 2. fileURLToPath() converts to: "/home/user/project/scripts/generate-assets.ts"
 * 3. path.dirname() gets directory: "/home/user/project/scripts"
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CRITICAL PATHS
 * ───────────────────────────────────────────────────────────────────────
 * Define absolute paths to directories (prevents "file not found" errors).
 *
 * path.resolve() = Builds absolute path from relative parts
 * __dirname = Current script directory (/marketing/scripts/)
 * '..' = Go up one level
 * 'assets/logos' = Go into assets/logos
 *
 * Result: /absolute/path/to/marketing/assets/logos/
 */
const PATHS = {
  logos: path.resolve(__dirname, '../assets/logos'),
  favicons: path.resolve(__dirname, '../assets/favicons'),
  ogImages: path.resolve(__dirname, '../assets/og-images'),
};

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

/**
 * INTERFACE EXPLANATION:
 * ───────────────────────────────────────────────────────────────────────
 * Interface = "contract" defining shape of an object.
 *
 * Like CSS requiring certain properties:
 *   .button { width: required; height: required; }
 *
 * This ensures every FaviconSize has:
 *   - size: number (e.g., 16, 32)
 *   - name: string (e.g., "favicon-16x16.png")
 *   - purpose: optional string (e.g., "Standard browser tab")
 */
interface FaviconSize {
  size: number;          // Pixel dimensions (square)
  name: string;          // Output filename
  purpose?: string;      // Description (optional, hence "?")
}

/**
 * FAVICON SIZES (Web Standard + PWA)
 * ───────────────────────────────────────────────────────────────────────
 * Different browsers/platforms need different sizes:
 *
 * - 16x16: Browser tab (most common)
 * - 32x32: Retina browser tab, Windows taskbar
 * - 180x180: Apple Touch Icon (iOS home screen)
 * - 192x192: Android Chrome
 * - 512x512: PWA splash screen
 *
 * NOTE: We're starting with basic sizes (per your request).
 * PWA-specific sizes (maskable icons, etc.) added later.
 */
const FAVICON_SIZES: FaviconSize[] = [
  { size: 16, name: 'favicon-16x16.png', purpose: 'Browser tab icon' },
  { size: 32, name: 'favicon-32x32.png', purpose: 'Browser tab icon (retina)' },
  { size: 180, name: 'apple-touch-icon.png', purpose: 'iOS home screen' },
  { size: 192, name: 'android-chrome-192x192.png', purpose: 'Android home screen' },
  { size: 512, name: 'android-chrome-512x512.png', purpose: 'PWA splash screen' },
];

/**
 * LOGO VARIANTS
 * ───────────────────────────────────────────────────────────────────────
 * Which SVG logo to use for favicon generation.
 *
 * RECOMMENDATION: Use "ai-wordmark" for favicons
 * WHY:
 * - Simplest shape (scales better at tiny 16x16 size)
 * - Recognizable even when small
 * - Symmetrical lowercase "a" + dot = iconic
 *
 * Graph variants better for:
 * - Full-size logo displays (header, footer)
 * - Marketing materials
 * - Social media profile pics (larger)
 */
const DEFAULT_LOGO = 'logo-ai-wordmark.svg';

// ═══════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/**
 * ASYNC FUNCTION EXPLANATION:
 * ───────────────────────────────────────────────────────────────────────
 * "async" keyword = function can use "await" for slow operations.
 *
 * Why needed:
 * - File I/O is slow (reading SVG from disk)
 * - Don't want to freeze entire program waiting
 * - "await" = pause here until done, then continue
 *
 * Similar to CSS animations:
 *   transition: opacity 2s; (waits 2s, doesn't block page)
 *   await readFile();       (waits for file, doesn't block script)
 */

/**
 * Ensure directory exists, create if missing.
 *
 * @param dirPath - Absolute path to directory
 *
 * PARAMETERS EXPLAINED:
 * ───────────────────────────────────────────────────────────────────────
 * (dirPath: string)
 *   - dirPath = parameter name
 *   - : string = type annotation (must be string)
 *
 * Like function signature in documentation:
 *   function(dirPath: String) in pseudocode
 */
async function ensureDir(dirPath: string): Promise<void> {
  /**
   * RETURN TYPE: Promise<void>
   * ───────────────────────────────────────────────────────────────────
   * - Promise = "I'll give you a result later" (async)
   * - <void> = "No return value" (like CSS property with no value)
   *
   * Alternatives:
   *   Promise<string> = Returns a string eventually
   *   Promise<number> = Returns a number eventually
   *   void = Returns nothing (just does action)
   */

  try {
    // Check if directory exists
    await fs.access(dirPath);
  } catch {
    // Directory doesn't exist, create it
    // recursive: true = create parent directories too (like mkdir -p)
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
}

/**
 * Generate favicon at specified size.
 *
 * @param logoPath - Path to source SVG logo
 * @param outputPath - Path to output PNG favicon
 * @param size - Pixel dimensions (square)
 *
 * SHARP LIBRARY EXPLAINED:
 * ───────────────────────────────────────────────────────────────────────
 * sharp() = Load image
 * .resize() = Change dimensions
 * .png() = Convert to PNG format
 * .toFile() = Save to disk
 *
 * Chain methods (like jQuery or D3.js):
 *   sharp(input).resize(128).png().toFile(output)
 *
 * CSS parallel (method chaining):
 *   element.style.color = "red"; element.style.fontSize = "16px";
 *   vs.
 *   $(element).css("color", "red").css("fontSize", "16px"); (jQuery)
 */
async function generateFavicon(
  logoPath: string,
  outputPath: string,
  size: number
): Promise<void> {
  try {
    /**
     * SVG → PNG CONVERSION PROCESS
     * ───────────────────────────────────────────────────────────────────
     * Step 1: Read SVG file from disk
     * Step 2: Render SVG to PNG using Resvg (at target size)
     * Step 3: Save PNG to disk
     *
     * Why Resvg?
     * - Fast (Rust-based)
     * - Accurate SVG rendering
     * - No browser dependency (unlike Puppeteer)
     */

    // Step 1: Read SVG source
    const svgBuffer = await fs.readFile(logoPath);

    // Step 2: Render SVG → PNG
    const resvg = new Resvg(svgBuffer, {
      fitTo: {
        mode: 'width',
        value: size,
      },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // Step 3: Save to file
    await fs.writeFile(outputPath, pngBuffer);

    console.log(`  ✅ Generated ${path.basename(outputPath)} (${size}x${size})`);
  } catch (error) {
    console.error(`  ❌ Failed to generate ${path.basename(outputPath)}:`, (error as Error).message);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Main execution function.
 *
 * FLOW:
 * 1. Ensure output directories exist
 * 2. Load source SVG logo
 * 3. Generate all favicon sizes
 * 4. Report success/failure
 *
 * ARRAY.MAP() EXPLAINED:
 * ───────────────────────────────────────────────────────────────────────
 * .map() = Transform each array item
 *
 * Example:
 *   [1, 2, 3].map(x => x * 2)  →  [2, 4, 6]
 *
 * In our code:
 *   FAVICON_SIZES.map(config => generateFavicon(...))
 *   = For each size config, generate a favicon
 *
 * CSS parallel (conceptually):
 *   For each .button, apply hover style
 *   .button:hover { ... }
 */
async function main() {
  console.log('🎨 Asset Generation Script');
  console.log('═══════════════════════════════════════════════════════\n');

  // Step 1: Ensure directories exist
  console.log('📁 Ensuring directories exist...');
  await ensureDir(PATHS.favicons);
  await ensureDir(PATHS.ogImages);
  console.log('');

  // Step 2: Load source logo
  const logoPath = path.join(PATHS.logos, DEFAULT_LOGO);
  console.log(`📄 Using source logo: ${DEFAULT_LOGO}\n`);

  // Check if logo exists
  try {
    await fs.access(logoPath);
  } catch {
    console.error(`❌ Error: Logo not found at ${logoPath}`);
    console.error('   Please ensure SVG logos are in /marketing/assets/logos/');
    /**
     * process.exit(1)
     * ───────────────────────────────────────────────────────────────────
     * Exits script with error code 1 (signals failure to shell).
     * Like HTTP status codes: 200 = OK, 404 = Not Found
     * Exit codes: 0 = success, 1 = error
     */
    process.exit(1);
  }

  // Step 3: Generate favicons
  console.log('🔄 Generating favicons...');

  /**
   * PROMISE.ALL() EXPLAINED:
   * ───────────────────────────────────────────────────────────────────
   * Runs multiple async operations in parallel (not sequential).
   *
   * Sequential (slow):
   *   await generateFavicon(16);   // Wait 1s
   *   await generateFavicon(32);   // Wait 1s
   *   await generateFavicon(180);  // Wait 1s
   *   Total: 3 seconds
   *
   * Parallel (fast):
   *   await Promise.all([
   *     generateFavicon(16),   // All 3 run
   *     generateFavicon(32),   // at the same
   *     generateFavicon(180),  // time!
   *   ]);
   *   Total: 1 second (fastest operation)
   *
   * Like loading multiple CSS files:
   *   <link rel="stylesheet" href="a.css">
   *   <link rel="stylesheet" href="b.css">
   *   Browser loads both simultaneously
   */
  await Promise.all(
    FAVICON_SIZES.map((config) => {
      const outputPath = path.join(PATHS.favicons, config.name);
      return generateFavicon(logoPath, outputPath, config.size);
    })
  );

  // Step 4: Report completion
  console.log('\n✅ Asset generation complete!');
  console.log(`   Output: ${PATHS.favicons}`);
  console.log('');
  console.log('💡 Next steps:');
  console.log('   1. Review generated favicons in /marketing/assets/favicons/');
  console.log('   2. Copy to /apps/marketing-site/public/ when ready');
  console.log('   3. Update <link> tags in HTML <head>');
  console.log('');
}

// ═══════════════════════════════════════════════════════════════════════
// SCRIPT EXECUTION
// ═══════════════════════════════════════════════════════════════════════

// IIFE PATTERN: Immediately Invoked Function Expression
// ───────────────────────────────────────────────────────────────────────
// Runs main() immediately when script loads.
//
// .catch() = Handle any errors from main()
//
// CSS parallel (conceptually):
//   @media (prefers-color-scheme: dark) {
//     /* Runs immediately when condition met */
//   }
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

// ═══════════════════════════════════════════════════════════════════════
// USAGE EXAMPLES
// ═══════════════════════════════════════════════════════════════════════
//
// BASIC USAGE:
//   npx tsx marketing/scripts/generate-assets.ts
//
// ADD TO PACKAGE.JSON:
//   {
//     "scripts": {
//       "generate:assets": "tsx marketing/scripts/generate-assets.ts"
//     }
//   }
//
// THEN RUN:
//   pnpm run generate:assets
//
// CUSTOMIZATION IDEAS (for later):
// 1. Accept logo variant as command-line argument:
//    pnpm run generate:assets -- --logo=symmetrical
//
// 2. Generate multiple variants:
//    For each logo in /logos/, generate full favicon set
//
// 3. Add watermarking:
//    Overlay "Beta" badge on icons
//
// 4. Generate manifest.json:
//    PWA manifest with icon references
//
// 5. Optimize SVGs first:
//    Run SVGO before converting to PNG
//
// ═══════════════════════════════════════════════════════════════════════
