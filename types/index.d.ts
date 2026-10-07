/** The word the mod picked for the current turn, or null before the first turn. */
export type TurnWord = string | null

declare module 'claude-code' {
  interface PluginState {
    'clawd-arcade': {
      /** Animation frame counter, advanced by the ticker while the spinner is drawn. */
      frame: number
      /** The word the mod picked for the current turn (used where the surface shows no word). */
      turnWord: TurnWord
      /** When the current turn started, in clock milliseconds; null while idle. */
      turnStartedAt: number | null
    }
  }
}
