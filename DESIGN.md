# Design

The visual system as built. Written from the code, not from intention. If the two
disagree, the code is right and this file is stale.

## The world

**Foil-blocked stationery.** Warm paper stock, black ink, gold foil.

Gold is treated as a material, not a colour value. That single decision drives most
of the system: a rule is a struck foil line with a lit lower edge, a panel is a plate
pressed into the sheet, and the page carries exactly one inverted ink band so the
paper has something to be lighter than.

The layout is deliberately off-axis. Column splits are 5/7 or 7/5, never 6/6. Plates
run off the right or left edge rather than sitting inside the margin. Cards stagger
vertically instead of aligning. Section headings alternate side down the page.

## Tokens

Defined in `src/app/globals.css` under Tailwind v4's `@theme`. Never hard-code a hex
outside that block.

| Token | Value | Use |
|---|---|---|
| `paper` | `#f7f3ea` | page ground |
| `paper-2` | `#efe8da` | alternating bands, hover fills |
| `paper-3` / `paper-4` | `#e6dccb` / `#d9ccb6` | plate grounds, placeholder artwork |
| `ink` | `#14110d` | body copy, the inverted band, primary buttons |
| `ink-2` | `#4a423a` | secondary copy |
| `ink-3` | `#6f6558` | tertiary, captions |
| `gold` | `#a8842c` | rules, borders, fills, display numerals |
| `gold-deep` | `#7a5f18` | gold **text** on paper |
| `gold-bright` | `#c9a227` | gold on the ink band only |
| `gold-pale` | `#e8d4a0` | foil highlight, selection |

### The contrast rule

Gold at `#a8842c` on paper is 3.1:1. That clears AA for large text and non-text
elements, and fails for body copy. So:

- gold **text** under 24px uses `gold-deep` (5.4:1)
- `gold` is for rules, borders, fills and display-size numerals
- `gold-bright` appears only inside `.on-ink`, where it reads 9.7:1
- `ink-3` at 5.1:1 is the lightest text permitted anywhere

## Type

- **Display:** Bodoni Moda, variable, roman and italic. Applied with `.display`.
  Headlines set a roman first line and an italic gold second line. On the ink band
  `.on-ink .display` raises `opsz` to 20 so the hairlines survive the inversion.
- **Body/UI:** Archivo.
- **Numerals:** `.tabular` everywhere a price, quantity or total appears. Prices are
  readouts, not marketing text, and they must align in a column.

Neither face is a category default; the pairing was chosen against a list of
overused display faces.

## Materials

| Class | What it is |
|---|---|
| `.foil-t` / `.foil-b` | struck foil rule, lit on the lower edge |
| `.rule-ink` | plain hairline, for dense lists where foil would be noisy |
| `.plate` | letterpress plate: pressed border, inner shadow, lit bottom edge |
| `.plate-sunk` | the same, recessed into beige |
| `.on-ink` | the one inverted band per page |
| `.foil-fill` | gradient foil across a fill, for buttons on ink |
| `.press` | 1px travel on `:active`, disabled under reduced motion |

Paper tooth is a single fixed `body::before` layer using an inline SVG turbulence
filter. No network request, no image.

## Components

`src/components/ui.tsx` holds the vocabulary shared by every page: `Knot` (the
interlaced-square mark that opens each section), `Eyebrow`, `PillLink` / `PillButton`,
`Eyelet` (the circular arrow that fills on card hover), `Tag`, `SectionHead`, `Icon`.

`SectionHead` carries an optional two-digit index set out in the margin. That index
is the main editorial device tying the page together.

### One trap worth knowing

`PillLink` sets `display: inline-flex` itself. Putting `hidden sm:inline-flex` on it
does nothing, because both are display utilities of equal specificity and stylesheet
order decides the winner. Breakpoint the wrapper instead. This shipped as a real bug
where the Reserve button appeared on mobile.

## Placeholder artwork

There is no photography yet. `Plate` renders a Sanity image when one exists and
otherwise blocks a foil panel: a diaper lattice, double border, corner rules, and a
rosette whose geometry is derived from a hash of the item's name, so no two match.

Rosettes use 6 or 8 sides only. Four reads as scribble when nested; twelve collapses
into wobbly concentric circles.

This is placeholder work and is meant to be deleted. Every one of these panels should
become a real photograph before launch.

## Motion

Almost none, on purpose. Buttons travel 1px on press, eyelets and borders transition
colour on hover, and the whole set is disabled under `prefers-reduced-motion`. Nothing
animates on scroll and nothing blocks paint.

## Responsive

One breakpoint does most of the work: `lg` (1024px) switches the asymmetric column
grids from stacked to off-axis. `sm` (640px) handles card rows and the header's
Reserve button.

Verified at 390px with real device emulation: `scrollWidth === clientWidth`, so
nothing overflows horizontally.
