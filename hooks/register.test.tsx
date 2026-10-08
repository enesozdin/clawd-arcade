import { expect, mock, test } from 'claude-code/testing'

const SPINNER = { word: 'Brewing', message: null, suffix: '…', mode: 'thinking' } as const

test('terminal spinner acts out the word it is given', async ($, on) => {
  mock.clock(on, { now: 10_000 })
  const ui = await $.ui.mount({
    plugin: 'clawd-arcade',
    surface: 'terminal',
    component: 'Spinner',
    props: SPINNER,
  })

  expect(await ui.find({ type: 'Text', text: 'Brewing…' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /HP and MP potions/ })).toBeDefined()
})

test('Clawd replaces the spinner in every phase, not only while thinking', async ($, on) => {
  mock.clock(on, { now: 10_000 })
  on('ui.render', { component: 'Spinner' }, ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine spinner</Text>
  })

  for (const mode of ['requesting', 'thinking', 'responding', 'tool-input', 'tool-use'] as const) {
    const ui = await $.ui.mount({
      plugin: 'clawd-arcade',
      surface: 'terminal',
      component: 'Spinner',
      props: { ...SPINNER, mode },
    })
    expect(await ui.find({ type: 'Text', text: 'engine spinner' })).toBeUndefined()
    expect(await ui.find({ type: 'Text', text: /brews HP and MP potions/ })).toBeDefined()
  }
})

test('desktop spinner shows an arcade word and keeps the step as detail', async ($, on) => {
  mock.clock(on, { now: 10_000 })
  const ui = await $.ui.mount({
    plugin: 'clawd-arcade',
    surface: 'desktop',
    component: 'Spinner',
    props: { ...SPINNER, word: 'Creating notes.md' },
  })

  expect(await ui.find({ type: 'Text', text: 'Creating notes.md' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^[A-Z][a-z]+…$/ })).toBeDefined()
})

test('a started turn shows its elapsed time', async ($, on) => {
  const clock = mock.clock(on, { now: 10_000 })
  on('turn.start', (_$, e) => ({ turnId: e.turnId }))
  await $.turn.start({ text: 'hi', turnId: 'turn-1' })
  await clock.advance(12_000)

  const ui = await $.ui.mount({
    plugin: 'clawd-arcade',
    surface: 'terminal',
    component: 'Spinner',
    props: SPINNER,
  })

  expect(await ui.find({ type: 'Text', text: /· 12s$/ })).toBeDefined()
})
