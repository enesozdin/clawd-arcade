/**
 * Spinner word -> arcade theme mapping and the ASCII frames of each theme.
 *
 * In every theme the plain Clawd mascot acts out an arcade-style scene with
 * a prop beside it: no costumes, so Clawd always looks like itself.
 * Pure data and functions only, so everything here is unit-testable.
 */

export type ThemeId =
  | 'platformer'
  | 'somersault'
  | 'blocks'
  | 'miner'
  | 'chef'
  | 'potion'
  | 'dialogue'
  | 'wizard'
  | 'runner'
  | 'dancer'
  | 'dungeon'
  | 'muncher'
  | 'attract'

/** Clawd's three body lines: head, arms, legs. */
type Body = readonly [string, string, string]

export type Frame = {
  body: Body
  /** Up to four lines drawn to the right of Clawd: the first above its head, then one per body line. */
  prop?: readonly string[]
  /**
   * Per-column colors for the prop lines: a letter in the theme's palette colors
   * the prop character in the same column; blanks keep the usual color.
   */
  propPaint?: readonly string[]
  /** Columns to shift Clawd right, for bobbing and dancing. */
  offset?: number
  /** Raises Clawd one line, into the line above its head, for jumps and flips. */
  isLifted?: boolean
}

export type Theme = {
  id: ThemeId
  /** Caption shown under the word. */
  label: string
  propColor: string
  /** Columns to shift Clawd right in every frame, bringing it next to a prop it holds. */
  bodyIndent?: number
  /** Prop glyphs drawn in their own color instead of propColor (a gem, a coin...). */
  accents?: Readonly<Record<string, string>>
  /** Colors the letters of a frame's propPaint stand for. */
  palette?: Readonly<Record<string, string>>
  frames: readonly Frame[]
}

/** A run of text drawn in one color. */
export type Segment = {
  text: string
  color: string
}

/** One drawn line: Clawd's part on the left, the prop on the right. */
export type ArcadeLine = {
  left: string
  /** Clawd's part as colored runs. */
  leftSegments: Segment[]
  right: string
  /** The prop split into colored runs, accents in their own color. */
  rightSegments: Segment[]
}

export const LINE_COUNT = 4
export const LEFT_WIDTH = 12
export const PROP_WIDTH = 10
const BODY_COLOR = 'claude'

const STAND: Body = [' ▐▛███▜▌', '▝▜█████▛▘', '  ▘▘ ▝▝']
const STEP: Body = [' ▐▛███▜▌', '▝▜█████▛▘', ' ▘▘   ▝▝']
const BLINK: Body = [' ▐▄███▄▌', '▝▜█████▛▘', '  ▘▘ ▝▝']
const JUMP: Body = [' ▐▛███▜▌', '▝▜█████▛▘', '  ▀▀ ▀▀']
const ARM_UP: Body = [' ▐▛███▜▌▗', '▝▜█████▛▘', '  ▀▀ ▀▀']
/** Clawd upside down: the standing pose flipped top to bottom. */
const UPSIDE_DOWN: Body = ['  ▖▖ ▗▗', '▗▟█████▙▖', ' ▐▙███▟▌']

/** Brown, for wooden things; any color string the surfaces take works here. */
const WOOD = '#A0522D'
/** Orange, for the ? block. */
const BRICK_ORANGE = '#FF8C00'
/** Brick red, for the brick wall. */
const BRICK_RED = '#C1440E'
/**
 * Bricks drop onto a fixed bottom course, joints staggered like a real wall;
 * a finished course flashes and clears.
 */
function brickFrames(): Frame[] {
  const well = (top: string, middle: string): string[] => [`  ${top}`, `  ${middle}`, '  ▆▆▆ ▆▆', '']

  return [
    { body: STAND, prop: well('   ▆▆▆', '▆▆    ') },
    { body: STAND, prop: well('      ', '▆▆ ▆▆▆') },
    { body: JUMP, prop: well('      ', '▒▒▒▒▒▒') },
    { body: BLINK, prop: well('      ', '      ') },
    { body: STAND, prop: well('▆▆    ', '      ') },
    { body: STEP, prop: well('      ', '▆▆    ') },
  ]
}

/** Clawd chews through a stream of dots scrolling toward it. */
function muncherFrames(): Frame[] {
  const dots = '•  •  •  •  •'
  const frames: Frame[] = []
  for (let step = 0; step < 6; step++) {
    const isChewing = step % 2 === 1
    frames.push({
      body: isChewing ? BLINK : STAND,
      prop: [isChewing ? 'nom' : '', '', dots.slice(step % 3, (step % 3) + PROP_WIDTH)],
    })
  }

  return frames
}

/** Clawd crouches, flips forward through the air, sticks the landing and walks back. */
function somersaultFrames(): Frame[] {
  const score = ['', '  10.0', '  ✦']

  return [
    { body: STAND },
    { body: JUMP },
    { body: JUMP, offset: 1, isLifted: true },
    { body: UPSIDE_DOWN, offset: 2, isLifted: true },
    { body: JUMP, offset: 3, isLifted: true },
    { body: STAND, offset: 3, prop: score },
    { body: BLINK, offset: 3, prop: score },
    { body: STEP, offset: 2 },
    { body: STAND, offset: 1 },
  ]
}

/** A pickaxe swung at a block until it cracks open and drops a gem. */
function minerFrames(): Frame[] {
  const raised = (top: string, bottom: string): string[] => [' ╭━┳━╮', `   ┃   ${top}`, `   ┃   ${bottom}`, '']
  const strike = (top: string, bottom: string): string[] => ['      ✦', `      ╮${top}`, `━━━━━━┫${bottom}`, '      ╯']

  return [
    { body: STAND, prop: raised('▓▓▓', '▓▓▓') },
    { body: STEP, prop: strike('▓▓▓', '▓▓▓') },
    { body: STAND, prop: raised('▒▓▓', '▓▒▓') },
    { body: STEP, prop: strike('▒▒▓', '▒▓▒') },
    { body: STAND, prop: raised('░ ▒', ' ◆░') },
    { body: ARM_UP, prop: ['      ✧', '        ◆', '', ''] },
  ]
}

/** A tall staff held upright, then tilted forward to fire a fireball from its orb. */
function wizardFrames(): Frame[] {
  const upright = (glint: string): string[] => ['●', `┃${glint}`, '┃', '┃']
  const tilted = (shot: string): string[] => [`  ●${shot}`, ' ╱', '╱', '']

  return [
    { body: STAND, prop: upright('') },
    { body: BLINK, prop: upright('✧') },
    { body: STAND, prop: tilted('') },
    { body: STAND, prop: tilted('~◉') },
    { body: STAND, prop: tilted('  ~◉') },
    { body: STAND, prop: tilted('    ~◉') },
    { body: STAND, prop: tilted('      ✸') },
    { body: STAND, prop: upright('') },
  ]
}

/** Clawd's dialogue box types itself out letter by letter. */
function dialogueFrames(text: string): Frame[] {
  const frames: Frame[] = []
  for (let typed = 1; typed <= text.length; typed++) {
    frames.push({ body: STAND, prop: dialogueBox(text.slice(0, typed), false) })
  }
  frames.push({ body: BLINK, prop: dialogueBox(text, true) })
  frames.push({ body: STAND, prop: dialogueBox(text, false) })
  frames.push({ body: STAND, prop: dialogueBox(text, true) })

  return frames
}

function dialogueBox(text: string, isPromptShown: boolean): string[] {
  return ['┌────────┐', `│ ${text.padEnd(6)} │`, `└───────${isPromptShown ? '▼' : '─'}┘`, '']
}

/** A red HP potion and a blue MP potion filling up one after the other. */
function potionFrames(): Frame[] {
  const hp = ['  ', '▄▄', '██', '██']
  const mp = ['  ', '  ', '▄▄', '██']

  return hp.map((red, level) => {
    const isFull = level === hp.length - 1

    return {
      body: isFull ? BLINK : STAND,
      prop: [`  ╔╗ ${isFull ? '✦' : ' '} ╔╗`, ' ╭╯╰╮ ╭╯╰╮', ` │${red}│ │${mp[level]}│`, ' ╰──╯ ╰──╯'],
      propPaint: ['', '', '  rr   bb', ''],
    }
  })
}

/** Arrows scroll up a rhythm lane while Clawd steps side to side. */
function dancerFrames(): Frame[] {
  const arrows = ['↑', '←', '↓', '→']

  return arrows.map((_, beat) => ({
    body: beat % 2 === 0 ? STAND : STEP,
    offset: beat % 2,
    prop: arrows.map((__, row) => {
      const arrow = ` ${arrows[(beat + row) % arrows.length]}`
      if (row !== 0) {
        return arrow
      }
      return beat % 2 === 0 ? `${arrow} GREAT!` : `${arrow} ♪`
    }),
  }))
}

export const THEMES: Record<ThemeId, Theme> = {
  platformer: {
    id: 'platformer',
    label: 'Clawd breaks a ? block',
    propColor: BRICK_ORANGE,
    accents: { '?': 'warning', '●': 'warning', '+': 'text', '1': 'text' },
    frames: [
      { body: STAND, prop: [' ┏━━━━━┓', ' ┃  ?  ┃', ' ┗━━━━━┛'] },
      { body: BLINK, prop: [' ┏━━━━━┓', ' ┃  ?  ┃', ' ┗━━━━━┛'] },
      { body: JUMP, prop: [' ┏━━┳━━┓', ' ┣━━╋━━┫', ' ┗━━┻━━┛'] },
      { body: JUMP, prop: ['▗▄▖   ▗▄▖', '    ●', '▝▀▘   ▝▀▘'] },
      { body: JUMP, prop: ['▘   ●   ▝', '', '', '▖       ▗'] },
      { body: STAND, prop: ['   +1', '', '', ' ▖     ▗'] },
      { body: STAND },
    ],
  },
  somersault: {
    id: 'somersault',
    label: 'Clawd does a somersault',
    propColor: 'warning',
    frames: somersaultFrames(),
  },
  blocks: {
    id: 'blocks',
    label: 'Clawd builds a brick wall',
    propColor: 'subtle',
    accents: { '▆': BRICK_RED, '▒': 'warning' },
    frames: brickFrames(),
  },
  miner: {
    id: 'miner',
    label: 'Clawd mines for gems',
    propColor: 'subtle',
    accents: { '◆': 'suggestion', '╭': WOOD, '━': WOOD, '┳': WOOD, '╮': WOOD, '┃': WOOD, '┫': WOOD, '╯': WOOD },
    frames: minerFrames(),
  },
  chef: {
    id: 'chef',
    label: 'Clawd cooks a 3-star dish',
    propColor: 'warning',
    frames: [
      { body: STAND, prop: ['', '   •', '━(▄▄▄)', '  ^v^'] },
      { body: STAND, prop: ['   •', '', '━(▄▄▄)', '  v^v'] },
      { body: STAND, prop: ['', '   •', '━(▄▄▄)', '  ^^^'] },
      { body: BLINK, prop: [' ★★★', '', '━(▄●▄)', '  ^v^'] },
    ],
  },
  potion: {
    id: 'potion',
    label: 'Clawd brews HP and MP potions',
    propColor: 'text',
    accents: { '✦': 'warning' },
    palette: { r: 'error', b: 'suggestion' },
    frames: potionFrames(),
  },
  dialogue: {
    id: 'dialogue',
    label: 'Clawd is in a dialogue',
    propColor: 'text',
    frames: dialogueFrames('Hmm...'),
  },
  wizard: {
    id: 'wizard',
    label: 'Clawd casts a fireball',
    propColor: 'error',
    bodyIndent: 3,
    accents: { '┃': WOOD, '╱': WOOD, '●': 'error', '✧': 'warning' },
    frames: wizardFrames(),
  },
  runner: {
    id: 'runner',
    label: 'Clawd runs and jumps',
    propColor: 'subtle',
    frames: [
      { body: STAND, prop: ['', '', '', '▁▁▁▁▁▁▁▟▁'] },
      { body: STEP, prop: ['', '', '', '▁▁▁▁▁▟▁▁▁'] },
      { body: STAND, prop: ['', '', '', '▁▁▁▟▁▁▁▁▁'] },
      { body: JUMP, prop: ['', '', '', '▟▁▁▁▁▁▁▁▁'] },
      { body: STEP, prop: ['', '', '', '▁▁▁▁▁▁▁▁▁'] },
    ],
  },
  dancer: {
    id: 'dancer',
    label: 'Clawd hits every arrow',
    propColor: 'merged',
    frames: dancerFrames(),
  },
  dungeon: {
    id: 'dungeon',
    label: 'Clawd opens a treasure chest',
    propColor: 'warning',
    frames: [
      { body: STAND, prop: ['', '', ' ▄▄▄▄', ' █▀▀█'] },
      { body: STEP, prop: ['', '', ' ▄▄▄▄', ' █▀▀█'] },
      { body: STAND, prop: ['  ✧', ' ▗▄▄▖', ' ▐▀▀▌', ' █▄▄█'] },
      { body: ARM_UP, prop: [' ✧◆✧', ' ▗▄▄▖', ' ▐  ▌', ' █▄▄█'] },
      { body: ARM_UP, prop: ['  ◆', ' ▗▄▄▖', ' ▐  ▌', ' █▄▄█'] },
    ],
  },
  muncher: {
    id: 'muncher',
    label: 'Clawd munches dots',
    propColor: 'warning',
    frames: muncherFrames(),
  },
  attract: {
    id: 'attract',
    label: 'Insert coin to continue',
    propColor: 'warning',
    frames: [
      { body: STAND, prop: ['', ' PRESS', ' START'] },
      { body: STAND, offset: 1 },
      { body: BLINK, prop: ['', ' PRESS', ' START'] },
      { body: STAND, offset: 1 },
    ],
  },
}

/** Spinner words Claude Code is known to use, grouped by the theme that animates them. */
const KNOWN_WORDS: Record<ThemeId, readonly string[]> = {
  platformer: [
    'ideating', 'hatching', 'imagining', 'envisioning', 'incubating', 'germinating',
    'inventing', 'dreaming', 'brainstorming', 'scheming',
  ],
  somersault: [
    'spinning', 'churning', 'whirring', 'swirling', 'twisting', 'unfurling', 'combobulating',
    'discombobulating', 'flibbertigibbeting', 'wibbling', 'booping', 'honking',
  ],
  blocks: [
    'building', 'constructing', 'assembling', 'forming', 'coalescing', 'reticulating',
    'calculating', 'computing', 'crunching', 'processing', 'synthesizing', 'compiling',
    'analyzing',
  ],
  miner: [
    'crafting', 'creating', 'forging', 'generating', 'tinkering', 'actualizing',
    'accomplishing', 'actioning', 'doing', 'effecting', 'working', 'making', 'sculpting',
  ],
  chef: [
    'baking', 'cooking', 'sauteing', 'simmering', 'stewing', 'marinating', 'frying',
    'roasting', 'grilling', 'toasting', 'braising', 'kneading', 'whisking', 'seasoning',
    'garnishing', 'caramelizing', 'flambeing', 'julienning',
  ],
  potion: ['brewing', 'percolating', 'steeping', 'fermenting', 'distilling', 'infusing', 'alchemizing'],
  dialogue: [
    'thinking', 'pondering', 'mulling', 'musing', 'ruminating', 'cogitating', 'cerebrating',
    'considering', 'contemplating', 'deliberating', 'philosophising', 'philosophizing',
    'pontificating', 'reflecting', 'wondering', 'puzzling', 'inferring', 'determining',
    'reasoning', 'perusing', 'deciphering', 'elucidating',
  ],
  wizard: [
    'conjuring', 'transmuting', 'enchanting', 'manifesting', 'divining', 'wizarding',
    'channelling', 'channeling', 'clauding',
  ],
  runner: [
    'moseying', 'schlepping', 'herding', 'meandering', 'wandering', 'frolicking',
    'scurrying', 'galloping', 'sauntering', 'hustling', 'wrangling', 'mustering',
  ],
  dancer: [
    'vibing', 'noodling', 'puttering', 'jiving', 'grooving', 'finagling', 'shimmying',
  ],
  dungeon: [
    'spelunking', 'sussing', 'unravelling', 'unraveling', 'investigating', 'scouting',
    'searching',
  ],
  muncher: ['smooshing', 'shucking', 'munching', 'chomping', 'nibbling', 'gobbling'],
  attract: ['lounging', 'lollygagging'],
}

/**
 * Stem rules for words not in the known list, tried in order. Short stems that
 * hide inside unrelated words (eat, run, hop, min) only match at the start.
 */
const STEM_RULES: readonly (readonly [ThemeId, RegExp])[] = [
  ['potion', /brew|percolat|steep|ferment|distill|potion|alchem/],
  ['muncher', /munch|chomp|nibbl|gobbl|smoosh|shuck|^eat/],
  ['chef', /cook|bak|saut|simmer|stew|marinat|fry|roast|grill|toast|boil|chop|stir/],
  ['dialogue', /think|ponder|mull|rumin|cogit|consider|contempl|deliber|reflect|wonder|reason|perus|deciph|elucid/],
  ['platformer', /idea|hatch|imagin|envision|invent|dream|jump|^hop/],
  ['blocks', /build|construct|assembl|brick|stack|coalesc|reticul|calculat|comput|crunch|process|synthes|compil|analy/],
  ['wizard', /conjur|transmut|enchant|manifest|divin|wizard|magic|spell/],
  ['dungeon', /spelunk|suss|unravel|investig|scout|search|explor|seek|quest/],
  ['runner', /mosey|schlep|herd|meander|wander|frolic|walk|march|stroll|scurr|hustl|wrangl|muster|^run/],
  ['dancer', /vib|noodl|putter|jiv|groov|danc|shimm/],
  ['attract', /loung|lollygag|relax|chill|idl/],
  ['somersault', /spin|churn|whir|swirl|twist|twirl|flip|tumbl|zoom/],
  ['miner', /craft|creat|forg|generat|tinker|mak|^min/],
]

const WORD_TO_THEME: ReadonlyMap<string, ThemeId> = new Map(
  Object.entries(KNOWN_WORDS).flatMap(([theme, words]) =>
    words.map(word => [word, theme as ThemeId] as const),
  ),
)

/** Every known word, capitalised as the spinner shows them. */
export const ALL_WORDS: readonly string[] = [...WORD_TO_THEME.keys()].map(
  word => word.charAt(0).toUpperCase() + word.slice(1),
)

/** Lowercases, strips accents (Sautéing -> sauteing) and drops everything but letters. */
export function normalizeWord(word: string): string {
  return word
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

/** Picks the theme that animates a spinner word: known list, then stem rules, then attract mode. */
export function themeFor(word: string): Theme {
  const normalized = normalizeWord(word)
  const known = WORD_TO_THEME.get(normalized)
  if (known) {
    return THEMES[known]
  }
  const rule = STEM_RULES.find(([, pattern]) => pattern.test(normalized))

  return THEMES[rule ? rule[0] : 'attract']
}

/** A stable pick from the known words for a seed (a turn id, for instance). */
export function wordForSeed(seed: string): string {
  let hash = 0
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }

  return ALL_WORDS[hash % ALL_WORDS.length] ?? 'Clauding'
}

/** The four lines of a theme's frame, each part padded to its column width. */
export function renderFrame(theme: Theme, frameIndex: number): ArcadeLine[] {
  const frame = theme.frames[frameIndex % theme.frames.length] ?? theme.frames[0]
  if (!frame) {
    return []
  }
  const indent = ' '.repeat((frame.offset ?? 0) + (theme.bodyIndent ?? 0))
  const prop = frame.prop ?? []
  const body = frame.body.map(line => `${indent}${line}`)
  const lefts = frame.isLifted ? [...body, ''] : ['', ...body]

  return lefts.map((line, row) => {
    const left = line.padEnd(LEFT_WIDTH)
    const right = (prop[row] ?? '').padEnd(PROP_WIDTH)

    return {
      left,
      leftSegments: [{ text: left, color: BODY_COLOR }],
      right,
      rightSegments: colorSegments(right, theme.propColor, theme.accents ?? {}, {
        mask: frame.propPaint?.[row] ?? '',
        palette: theme.palette ?? {},
      }),
    }
  })
}

/** A per-column paint mask and the colors its letters stand for. */
export type Paint = {
  mask: string
  palette: Readonly<Record<string, string>>
}

/** Splits text into runs of one color: painted columns first, then accent glyphs, then the base color. */
export function colorSegments(
  text: string,
  baseColor: string,
  accents: Readonly<Record<string, string>>,
  paint: Paint = { mask: '', palette: {} },
): Segment[] {
  const segments: Segment[] = []
  let column = 0
  for (const char of text) {
    const painted = paint.palette[paint.mask[column] ?? ' ']
    column += 1
    const color = painted ?? accents[char] ?? baseColor
    const last = segments[segments.length - 1]
    if (last && last.color === color) {
      last.text += char
    } else {
      segments.push({ text: char, color })
    }
  }

  return segments
}

/** The caption the spinner shows: the word with one trailing ellipsis. */
export function withEllipsis(text: string): string {
  const trimmed = text.trim()

  return /(…|\.\.\.)$/.test(trimmed) ? trimmed : `${trimmed}…`
}

/** Formats elapsed milliseconds as the spinner does: `12s`, `1m 4s`. */
export function formatElapsed(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(seconds / 60)

  return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`
}
