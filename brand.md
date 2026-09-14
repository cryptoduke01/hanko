# Brand — Hanko (判子)

_Status: active_

Hanko refracts a tokenized share into its spectrum. The brand is a piece of
financial infrastructure that tells the truth — restrained, precise, editorial.
Named after the seal a Japanese company presses onto a document to make it real.

## Principle

Monochrome does the work; **the refracted spectrum is the only color that ever
appears.** Color is rationed so it means something — it only shows up where a
share is being split into risk. Typography and precise data carry the design.

## Palette (CSS variables in `src/app/globals.css`)

Light — ink `#0a0a0a` on paper `#fafafa`; mute `#6b6b6b`, rule `#d4d4d4`, haze `#f0f0f0`.
Dark — ink `#f2f2f2` on paper `#0c0c0c`; mute `#8a8a8a`, rule `#2a2a2a`, haze `#161616`.

Spectrum (cool → warm = risk → reward), the only chromatic tokens:
- `--shield` senior / safety — `#2f57d4` (light) · `#6d9bff` (dark)
- `--core` mezzanine / exposure — `#0e8f86` (light) · `#2dd4bf` (dark)
- `--edge` junior / upside — `#c2410c` (light) · `#fb923c` (dark)

Never introduce colors outside this set. Positive/negative use `--up` / `--down`.

## Typography

`Inter Tight` (via next/font, `--font-display`) for everything — display, body,
and the tracked-uppercase labels. **No monospace face.** Numbers use
`tabular-nums`. Labels: uppercase, `tracking-[0.12em]–[0.18em]`, small, muted.

## Surfaces & motion

Soft-rounded cards (`rounded-xl` / `rounded-2xl`), pill buttons, hairline
`border-rule`, a faint top vignette (dark theme) for depth, no heavy shadows. Motion is
quiet: `fade-up` on entry, 0.35s ease transitions, and always honor
`prefers-reduced-motion`. No crypto stock art, no gradients-as-decoration.

## Voice

Precise, active, understated. Financial-disclosure register, never hype.
"Refract a share." "Conservation holds." "Not financial advice." Say what a
thing is and what it entitles you to — nothing more.
