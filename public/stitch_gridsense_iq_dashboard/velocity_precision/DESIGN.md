---
name: Velocity Precision
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#3a393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1c1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#b9cac9'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#839493'
  outline-variant: '#3a4a49'
  surface-tint: '#00dddd'
  primary: '#ffffff'
  on-primary: '#003737'
  primary-container: '#00fbfb'
  on-primary-container: '#007070'
  inverse-primary: '#006a6a'
  secondary: '#ffb596'
  on-secondary: '#581e00'
  secondary-container: '#fe6500'
  on-secondary-container: '#541d00'
  tertiary: '#ffffff'
  on-tertiary: '#313030'
  tertiary-container: '#e5e2e1'
  on-tertiary-container: '#656464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#00fbfb'
  primary-fixed-dim: '#00dddd'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#004f4f'
  secondary-fixed: '#ffdbcd'
  secondary-fixed-dim: '#ffb596'
  on-secondary-fixed: '#360f00'
  on-secondary-fixed-variant: '#7c2e00'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin: 40px
  container-max: 1440px
---

## Brand & Style

This design system embodies the high-stakes world of elite motorsport engineering and real-time telemetry. The aesthetic is a fusion of Audi’s precision-grade industrial design and the high-energy, digitally native vibrance of modern racing icons. It is built for a target audience that demands technical mastery, instant data comprehension, and a premium, "cockpit-ready" interface.

The design style is a sophisticated hybrid of **Glassmorphism** and **High-Contrast Bold**. It utilizes deep, multi-layered dark surfaces to simulate carbon-fiber chassis construction, overlaid with translucent glass panels that suggest head-up displays (HUDs). The emotional response should be one of "controlled velocity"—urgent and energetic, yet grounded in engineering reliability and absolute clarity.

## Colors

The palette is anchored in a "Midnight Carbon" ecosystem. The primary background uses a near-black neutral to maximize the luminosity of the accent colors. 

- **Neon Cyan (#00ffff):** Used for primary actions, active telemetry streams, and "Go" states. It represents the electrical pulse of the system.
- **Electric Orange (#ff6600):** Reserved for critical alerts, high-performance thresholds, and interactive highlights. 
- **Glass Base:** A semi-transparent black (#000000 at 45-60% opacity) used for component containers to create depth against the carbon backgrounds.
- **Accents:** Subtle slate greys are used for inactive states and borders to ensure the neon elements remain the focal point of the hierarchy.

## Typography

The typographic strategy balances technical aggression with legible refinement. **Space Grotesk** is the engine of the system, used for all headlines and data labels to provide a futuristic, geometric edge that feels like a racing team’s technical readout. 

**Manrope** serves as the body typeface, chosen for its modern, balanced proportions that maintain readability even in high-density data environments. All labels and tactical information should use uppercase Space Grotesk with increased letter spacing to mimic aerospace instrumentation.

## Layout & Spacing

The design system utilizes a **12-column fluid grid** designed for high-density information display. The rhythm is based on a 4px baseline shift to ensure mathematical precision in element alignment, echoing engineering schematics.

Layouts should favor "modular stacking," where components are housed in distinct glass panels separated by consistent 24px gutters. Deep margins (40px+) are encouraged for top-level containers to provide the "breathing room" required for the high-energy neon elements to pop without overwhelming the user.

## Elevation & Depth

Depth is conveyed through **Backdrop Blurs** and **Luminous Outer Glows** rather than traditional soft shadows. 

1.  **Ground Layer:** A deep charcoal background, occasionally featuring a subtle carbon-fiber micro-texture (low-contrast diagonal patterns).
2.  **Surface Layer:** Frosted glass panels with a 20px backdrop blur and a 1px internal stroke (border) of 15% white to define edges.
3.  **Active Layer:** Elements in an active or hovered state emit a "Neon Bloom"—a diffused outer glow using the primary or secondary hex colors (e.g., `box-shadow: 0 0 15px #00ffff66`).
4.  **Data Lines:** Connection paths and decorative accents use thin, high-contrast strokes that appear to be "etched" into the glass surfaces.

## Shapes

The shape language is "Technical-Soft." While the overall vibe is sharp and precise, a subtle **0.25rem (4px)** corner radius is applied to all components to prevent the UI from feeling dangerously sharp, aligning with the machined-finish aesthetic of F1 components. 

Large containers and glass panels should use the `rounded-lg` (8px) setting, while interactive elements like buttons and input fields stay at the base `rounded` (4px) level. Decorative elements, such as status pips and data nodes, may use full circular (pill) shapes to differentiate them from structural modules.

## Components

### Buttons
Primary buttons are solid Neon Cyan with black text, featuring a sharp transition to an Electric Orange glow on hover. Secondary buttons use a "Ghost" style: a 1px Cyan border with a glass-blur background.

### Cards & Modules
All containers must use the "Glass Panel" style: a semi-transparent black fill with a heavy backdrop blur. Each module should have a 1px top-left highlight border to simulate a light source hitting a physical glass edge.

### Inputs & Form Elements
Input fields are dark, recessed wells with a 1px bottom-border highlight. Upon focus, the border glows Neon Cyan, and the label (in Space Grotesk) shifts to the primary color.

### Data Visualization
Lines in line charts should use a "Glow-Trace" effect—a solid 2px line with a 4px soft outer glow. Use Neon Cyan for steady-state data and Electric Orange for anomalies or peak performance spikes.

### Icons
Icons must be "Micro-Line" style: 1.5px stroke weight, geometric, and non-filled. They should always inherit the color of their accompanying text or the system's primary accent.

### Additional Components: Telemetry Strips
Thin, horizontal tickers used at the top or bottom of panels to display scrolling real-time data or system status, using monospaced numbers for maximum technical feel.