# clawd-arcade

While Claude is thinking, the spinner line ("Sauteing...") is replaced by the Clawd mascot acting out the current spinner word in a little arcade-style scene. Clawd always looks like itself: the scenes change, not the character.

```
             ┏━━━━━┓   Ideating…
 ▐▛███▜▌     ┃  ?  ┃   Clawd breaks a ? block · 12s
▝▜█████▛▘    ┗━━━━━┛
  ▘▘ ▝▝

              ●  ~◉    Conjuring…
    ▐▛███▜▌  ╱         Clawd casts a fireball · 8s
   ▝▜█████▛▘╱
     ▘▘ ▝▝
```

- **Terminal:** acts out the word Claude Code shows (Cooking, Brewing, Pondering, ...).
- **Desktop app:** the desktop row names the current step instead of a word, so the mod picks a word for each turn and keeps the step as a dim detail.
- **Automatic:** the scene appears on its own while the model is thinking; while Claude calls tools or writes its answer, the usual spinner comes back. There is nothing to open or call.

No model calls are made; everything runs locally and costs no tokens.

## Themes

| Theme | Example words | Scene |
| --- | --- | --- |
| platformer | Ideating, Hatching | Bonks an orange `?` block until it breaks and a coin flies up |
| somersault | Spinning, Churning | Flips through the air and scores a perfect 10 |
| blocks | Building, Computing | Builds a brick wall and clears a finished course |
| miner | Crafting, Forging | Swings a pickaxe until a gem drops |
| chef | Cooking, Baking | Flips food until the dish earns three stars |
| potion | Brewing, Percolating | Fills a red HP and a blue MP potion |
| dialogue | Pondering, Mulling | Types `Hmm...` into a dialogue box |
| wizard | Conjuring, Transmuting | Tilts a red-tipped staff and casts a fireball |
| runner | Moseying, Wandering | Runs and jumps over a cactus |
| dancer | Vibing, Jiving | Steps to scrolling arrows |
| dungeon | Spelunking, Scouting | Opens a chest and holds up the treasure |
| muncher | Smooshing, Munching | Chews through a stream of dots |
| attract | Lounging, and any word no other scene claims | Bobs next to a blinking `PRESS START` |

Words are matched by a known-word list first, then by stem rules, then attract mode. To add words or animations, edit [`hooks/themes.ts`](./hooks/themes.ts).

## Install

In a Claude Code terminal session, run:

```
/plugin install clawd-arcade --marketplace enesozdin/clawd-arcade
```

Answer `y` to add the marketplace, then pick the **user** scope so the mod loads in every session (terminal and the desktop app's Code tab).

To try it from a local clone without installing:

```
claude --plugin-dir ./clawd-arcade
```

Only one mod can draw the spinner at a time: if you have another mod that replaces it, disable that one while this one is on.

## Files

| File | Purpose |
| --- | --- |
| `hooks/register.tsx` | Spinner drawing and the frame ticker |
| `hooks/themes.ts` | Word-to-theme mapping and the ASCII frames |
| `hooks/*.test.ts(x)` | Tests, run with `claude plugin test .` |
| `scripts/preview.ts` | Plays every theme in the terminal |
| `types/index.d.ts` | The mod's state contract |
| `.claude-plugin/plugin.json` | Plugin manifest |
| `.claude-plugin/marketplace.json` | Makes this repository installable with `/plugin install` |

## Develop

```
claude plugin validate .
claude plugin test .
```

To watch every animation outside Claude Code (Node 22.18+):

```
node scripts/preview.ts            # all themes, Ctrl+C to quit
node scripts/preview.ts wizard     # a single theme
```

## License

[MIT](./LICENSE)
