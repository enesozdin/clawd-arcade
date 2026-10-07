import { describe, expect, test } from 'claude-code/testing'

import {
  ALL_WORDS,
  formatElapsed,
  LEFT_WIDTH,
  LINE_COUNT,
  PROP_WIDTH,
  renderFrame,
  themeFor,
  THEMES,
  withEllipsis,
  wordForSeed,
} from './themes'

describe('themeFor', () => {
  test('maps known spinner words to their arcade theme', async () => {
    expect(themeFor('Ideating').id).toBe('platformer')
    expect(themeFor('Spinning').id).toBe('somersault')
    expect(themeFor('Computing').id).toBe('blocks')
    expect(themeFor('Crafting').id).toBe('miner')
    expect(themeFor('Cooking').id).toBe('chef')
    expect(themeFor('Brewing').id).toBe('potion')
    expect(themeFor('Pondering').id).toBe('dialogue')
    expect(themeFor('Conjuring').id).toBe('wizard')
    expect(themeFor('Moseying').id).toBe('runner')
    expect(themeFor('Vibing').id).toBe('dancer')
    expect(themeFor('Spelunking').id).toBe('dungeon')
    expect(themeFor('Smooshing').id).toBe('muncher')
  })

  test('ignores accents, case and a trailing ellipsis', async () => {
    expect(themeFor('Sautéing…').id).toBe('chef')
    expect(themeFor('BREWING...').id).toBe('potion')
  })

  test('falls back to stem rules for unknown words', async () => {
    expect(themeFor('Overbrewed').id).toBe('potion')
    expect(themeFor('Questing').id).toBe('dungeon')
  })

  test('moves words to the scene that suits them best', async () => {
    expect(themeFor('Hustling').id).toBe('runner')
    expect(themeFor('Wrangling').id).toBe('runner')
    expect(themeFor('Mustering').id).toBe('runner')
    expect(themeFor('Alchemizing').id).toBe('potion')
    expect(themeFor('Perusing').id).toBe('dialogue')
    expect(themeFor('Deciphering').id).toBe('dialogue')
    expect(themeFor('Elucidating').id).toBe('dialogue')
    expect(themeFor('Lounging').id).toBe('attract')
    expect(themeFor('Lollygagging').id).toBe('attract')
    expect(themeFor('Building').id).toBe('blocks')
    expect(themeFor('Constructing').id).toBe('blocks')
    expect(themeFor('Assembling').id).toBe('blocks')
    expect(themeFor('Forming').id).toBe('blocks')
    expect(themeFor('Coalescing').id).toBe('blocks')
    expect(themeFor('Reticulating').id).toBe('blocks')
    expect(themeFor('Rebuilding').id).toBe('blocks')
    expect(themeFor('Bricklaying').id).toBe('blocks')
  })

  test('short stems do not match inside unrelated words', async () => {
    expect(themeFor('Illuminating').id).not.toBe('miner')
    expect(themeFor('Heating').id).not.toBe('muncher')
    expect(themeFor('Repeating').id).not.toBe('muncher')
    expect(themeFor('Pruning').id).not.toBe('runner')
    expect(themeFor('Shopping').id).not.toBe('platformer')
  })

  test('short stems still match at the start of a word', async () => {
    expect(themeFor('Mining').id).toBe('miner')
    expect(themeFor('Eating').id).toBe('muncher')
    expect(themeFor('Running').id).toBe('runner')
    expect(themeFor('Hopping').id).toBe('platformer')
  })

  test('uses attract mode when nothing matches', async () => {
    expect(themeFor('Zzyzx').id).toBe('attract')
  })
})

describe('renderFrame', () => {
  test('every frame of every theme fits its columns', async () => {
    for (const theme of Object.values(THEMES)) {
      for (let index = 0; index < theme.frames.length; index++) {
        const lines = renderFrame(theme, index)
        expect(lines).toHaveLength(LINE_COUNT)
        for (const line of lines) {
          expect(line.left.length).toBe(LEFT_WIDTH)
          expect(line.right.length).toBe(PROP_WIDTH)
        }
      }
    }
  })

  test('every theme animates', async () => {
    for (const theme of Object.values(THEMES)) {
      expect(theme.frames.length).toBeGreaterThan(1)
      expect(renderFrame(theme, 0)).not.toEqual(renderFrame(theme, 1))
    }
  })

  test('the somersault lifts Clawd and turns it upside down', async () => {
    const frames = THEMES.somersault.frames.map((_, index) => renderFrame(THEMES.somersault, index))
    expect(frames.some(lines => lines[0]?.left.trim() !== '')).toBe(true)
    expect(frames.some(lines => lines.some(line => line.left.includes('▐▙███▟▌')))).toBe(true)
  })

  test('accent glyphs get their own color', async () => {
    const theme = THEMES.miner
    const gemLines = theme.frames.flatMap((_, index) => renderFrame(theme, index)).filter(line => line.right.includes('◆'))
    expect(gemLines.length).toBeGreaterThan(0)
    for (const line of gemLines) {
      expect(line.rightSegments).toContainEqual({ text: '◆', color: 'suggestion' })
      expect(line.rightSegments.map(segment => segment.text).join('')).toBe(line.right)
    }
  })

  test('the potion brewer fills a red HP and a blue MP bottle', async () => {
    const theme = THEMES.potion
    const full = renderFrame(theme, theme.frames.length - 1)[2]
    expect(full?.rightSegments).toContainEqual({ text: '██', color: 'error' })
    expect(full?.rightSegments).toContainEqual({ text: '██', color: 'suggestion' })
  })

  test('the pickaxe is drawn in wood brown', async () => {
    const [top] = renderFrame(THEMES.miner, 0)
    expect(top?.rightSegments).toContainEqual({ text: '╭━┳━╮', color: '#A0522D' })
  })

  test('frames loop', async () => {
    const theme = THEMES.platformer
    expect(renderFrame(theme, theme.frames.length)).toEqual(renderFrame(theme, 0))
  })
})

describe('helpers', () => {
  test('adds exactly one ellipsis', async () => {
    expect(withEllipsis('Cooking')).toBe('Cooking…')
    expect(withEllipsis('Cooking…')).toBe('Cooking…')
  })

  test('formats elapsed time like the spinner', async () => {
    expect(formatElapsed(12_400)).toBe('12s')
    expect(formatElapsed(64_000)).toBe('1m 4s')
  })

  test('picks a stable known word for a seed', async () => {
    expect(wordForSeed('turn-1')).toBe(wordForSeed('turn-1'))
    expect(ALL_WORDS).toContain(wordForSeed('turn-1'))
  })
})
