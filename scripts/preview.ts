/**
 * Plays every arcade theme side by side in the terminal, outside Claude Code.
 *
 *   node scripts/preview.ts             animate all themes (Ctrl+C to quit)
 *   node scripts/preview.ts wizard      animate one theme
 *   node scripts/preview.ts --once      print a single frame and exit
 *
 * Needs Node 22.18+ (runs TypeScript directly). Not part of the plugin:
 * hooks/hooks.json loads only hooks/register.tsx.
 */
import { LEFT_WIDTH, PROP_WIDTH, renderFrame, THEMES } from '../hooks/themes.ts'
import type { Theme } from '../hooks/themes.ts'

const FRAME_MS = 250
const CELL_GAP = 3
const LONGEST_LABEL = Math.max(...Object.values(THEMES).map(theme => theme.label.length))
const CELL_WIDTH = Math.max(LEFT_WIDTH + PROP_WIDTH, LONGEST_LABEL) + CELL_GAP

/** Approximate terminal colors for the Claude Code theme keys the themes use. */
const ANSI: Record<string, string> = {
  claude: '\x1b[38;2;215;119;87m',
  error: '\x1b[91m',
  warning: '\x1b[93m',
  success: '\x1b[92m',
  suggestion: '\x1b[94m',
  merged: '\x1b[95m',
  subtle: '\x1b[90m',
  text: '\x1b[97m',
}
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'

/** A theme key's color, or a `#rrggbb` color as a 24-bit escape. */
function ansiFor(color: string): string {
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color)
  if (hex) {
    const [red, green, blue] = hex.slice(1).map(part => parseInt(part, 16))
    return `[38;2;${red};${green};${blue}m`
  }
  return ANSI[color] ?? ''
}

function paint(text: string, color: string): string {
  return `${ansiFor(color)}${text}${RESET}`
}

/** One theme's cell: its id, four animated lines and its caption. */
function cell(theme: Theme, frame: number): string[] {
  const title = `${BOLD}${theme.id.padEnd(CELL_WIDTH)}${RESET}`
  const lines = renderFrame(theme, frame).map(
    line =>
      line.leftSegments.map(segment => paint(segment.text, segment.color)).join('') +
      line.rightSegments.map(segment => paint(segment.text, segment.color)).join('') +
      ' '.repeat(CELL_WIDTH - LEFT_WIDTH - PROP_WIDTH),
  )
  const caption = `${DIM}${theme.label.padEnd(CELL_WIDTH)}${RESET}`

  return [title, ...lines, caption, '']
}

function drawGrid(themes: readonly Theme[], frame: number): string {
  const columns = Math.max(1, Math.floor((process.stdout.columns || 80) / CELL_WIDTH))
  const rows: string[] = []
  for (let start = 0; start < themes.length; start += columns) {
    const cells = themes.slice(start, start + columns).map(theme => cell(theme, frame))
    const height = cells[0]?.length ?? 0
    for (let row = 0; row < height; row++) {
      rows.push(cells.map(lines => lines[row] ?? '').join(''))
    }
  }

  return rows.join('\n')
}

function main(): void {
  const args = process.argv.slice(2)
  const isOnce = args.includes('--once')
  const wanted = args.find(arg => !arg.startsWith('--'))
  const themes = Object.values(THEMES).filter(theme => !wanted || theme.id === wanted)

  if (themes.length === 0) {
    console.error(`Unknown theme "${wanted}". Themes: ${Object.keys(THEMES).join(', ')}`)
    process.exitCode = 1
    return
  }
  if (isOnce) {
    console.log(drawGrid(themes, 0))
    return
  }

  let frame = 0
  const restoreTerminal = () => {
    process.stdout.write('\x1b[?25h\n')
    process.exit(0)
  }
  process.on('SIGINT', restoreTerminal)
  process.stdout.write('\x1b[?25l\x1b[2J')
  setInterval(() => {
    process.stdout.write(`\x1b[H${drawGrid(themes, frame)}\n${DIM}Ctrl+C to quit${RESET}\x1b[J`)
    frame += 1
  }, FRAME_MS)
}

main()
