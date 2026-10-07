import { atom, read, update } from 'claude-code'
import type { Elements, EngineInterface, Register } from 'claude-code'

import { formatElapsed, renderFrame, themeFor, withEllipsis, wordForSeed } from './themes'
import type { Theme } from './themes'

const FRAME_MS = 250
/** The ticker stops redrawing once nothing has drawn Clawd for this long. */
const IDLE_AFTER_MS = 1500
/** The word the desktop shows when its row names no step. */
const DESKTOP_IDLE_WORD = 'Working'

const frame = atom({ plugin: 'clawd-arcade', key: 'frame' } as const, 0)
const turnWord = atom({ plugin: 'clawd-arcade', key: 'turnWord' } as const, null)
const turnStartedAt = atom({ plugin: 'clawd-arcade', key: 'turnStartedAt' } as const, null)

// Drawing bookkeeping only; it resets on reload, which is harmless.
let lastDrawAt = 0

/** Advances the frame only while the spinner drew recently, so idle sessions stay quiet. */
async function tick($: EngineInterface) {
  const now = await $.clock.now()
  if (now - lastDrawAt <= IDLE_AFTER_MS) {
    await update($, frame, n => (n + 1) % 1_000_000)
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    $.clock.every(FRAME_MS, () => void tick($))

    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    const startedAt = await $.clock.now()
    await update($, turnStartedAt, () => startedAt)
    await update($, turnWord, () => wordForSeed(`${e.turnId}:${startedAt}`))

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    await update($, turnStartedAt, () => null)

    return next(e)
  })

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    // Clawd only plays while the model is thinking; every other phase keeps the engine's spinner.
    if (e.props.mode !== 'thinking') {
      return next(e)
    }
    const { Box, Text } = $.ui.resolve(e)
    const [tickFrame, chosenWord, startedAt, now] = await Promise.all([
      read($, frame),
      read($, turnWord),
      read($, turnStartedAt),
      $.clock.now(),
    ])
    lastDrawAt = now

    // The desktop's row names the step ("Creating notes.md") instead of a whimsical word,
    // so there the mod supplies the word and keeps the step as a dim detail.
    const isDesktop = e.surface === 'desktop'
    const word = isDesktop ? (chosenWord ?? wordForSeed(e.requestId)) : e.props.word
    const shown = isDesktop ? word : (e.props.message ?? e.props.word)
    const step = isDesktop && e.props.word !== DESKTOP_IDLE_WORD ? e.props.word : null

    const theme = themeFor(word)
    const elapsed = startedAt === null ? null : formatElapsed(now - startedAt)
    const caption = elapsed ? `${theme.label} · ${elapsed}` : theme.label

    return (
      <Box flexDirection="row">
        {mascot({ Box, Text }, theme, tickFrame)}
        <Box flexDirection="column" marginLeft={1}>
          <Text color="claude" bold>
            {withEllipsis(shown)}
          </Text>
          <Text dimColor>{caption}</Text>
          {step && (
            <Text dimColor wrap="truncate-end">
              {step}
            </Text>
          )}
        </Box>
      </Box>
    )
  })

}

type MascotElements = Pick<Elements['terminal'], 'Box' | 'Text'>

/** Clawd with the theme's prop animating beside it. */
function mascot({ Box, Text }: MascotElements, theme: Theme, frame: number) {
  return (
    <Box flexDirection="column">
      {renderFrame(theme, frame).map(line => (
        <Box flexDirection="row">
          {line.leftSegments.map(segment => (
            <Text color={segment.color}>{segment.text}</Text>
          ))}
          {line.rightSegments.map(segment => (
            <Text color={segment.color}>{segment.text}</Text>
          ))}
        </Box>
      ))}
    </Box>
  )
}
