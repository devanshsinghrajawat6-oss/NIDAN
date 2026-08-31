---
name: Clinical Insight & Natural Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf4'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d4e4fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#43474e'
  inverse-surface: '#223144'
  inverse-on-surface: '#eaf1ff'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#455f88'
  primary: '#002045'
  on-primary: '#ffffff'
  primary-container: '#1a365d'
  on-primary-container: '#86a0cd'
  inverse-primary: '#adc7f7'
  secondary: '#0a6c44'
  on-secondary: '#ffffff'
  secondary-container: '#9ff5c1'
  on-secondary-container: '#167249'
  tertiary: '#321b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#4f2e00'
  on-tertiary-container: '#d4903b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#adc7f7'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#2d476f'
  secondary-fixed: '#9ff5c1'
  secondary-fixed-dim: '#83d8a6'
  on-secondary-fixed: '#002111'
  on-secondary-fixed-variant: '#005231'
  tertiary-fixed: '#ffddba'
  tertiary-fixed-dim: '#ffb866'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#673d00'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d4e4fc'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
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
  margin-mobile: 16px
  margin-desktop: 40px
  max-width: 1440px
---

## Brand & Style

The design system is engineered for **NIDANA**, an enterprise-grade medical research platform where scientific rigor meets natural wellness. The brand personality is authoritative yet organic—marrying the cold precision of clinical data with the warm, holistic ethos of herbal medicine.

The visual style is **Corporate / Modern** with a strong emphasis on **Functional Minimalism**. It prioritizes high data density and accessibility, ensuring that complex research findings remain legible and actionable. The aesthetic is defined by:
- **Clinical Clarity:** Ample negative space and a strict grid system to reduce cognitive load during intense data analysis.
- **Natural Sophistication:** Subtle nods to the logo's herbal theme through organic accents and a refined botanical-inspired color palette.
- **Professional Trust:** A sturdy, reliable structure that evokes the feeling of a high-end medical laboratory.

## Colors

The color palette is built on a foundation of "Trustworthy Deep Blues" to establish institutional authority, contrasted with "Herbal Greens" that serve as a bridge to the natural research focus.

- **Primary (#1A365D):** A deep, scholarly navy used for navigation, primary actions, and core branding. It ensures high contrast and a serious tone.
- **Secondary (#2F855A):** An "Herbal Green" derived from the logo, used for success states, trend indicators, and natural-themed accents.
- **Tertiary (#F6AD55):** An "Amber Clay" used sparingly for warnings or to highlight specific research data points, providing warmth to the clinical UI.
- **Backgrounds:** Use a crisp white (`#FFFFFF`) for card surfaces and a very soft slate-white (`#F8FAFC`) for the page background to differentiate container boundaries.

## Typography

This design system utilizes a dual-font approach to balance modern aesthetics with extreme legibility.

1. **Manrope (Headlines):** A geometric sans-serif that feels contemporary and balanced. Use this for page titles and section headers to provide a sense of structure and modernism.
2. **Hanken Grotesk (Body & Data):** A sharp, professional grotesque font designed for clarity. Its high x-height makes it perfect for dense research papers, data tables, and technical labels.

**Scaling Rules:**
- On mobile, reduce `display` sizes by 25% to prevent clipping. 
- Use `label-bold` for table headers and secondary metadata to create clear visual separation from standard body text.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop to maintain optimal line lengths for medical reading, while transitioning to a **Fluid Grid** for mobile.

- **Grid Model:** 12-column system on desktop (1440px max-width). Columns are separated by 24px gutters.
- **Spacing Rhythm:** Based on a 4px base unit. Consistent use of `16px`, `24px`, and `32px` for padding within cards ensures a rhythmic, professional feel.
- **Data Density:** Use "Comfortable" spacing for dashboard overviews and "Compact" spacing (8px increments) for research data tables and clinical logs.
- **Breakpoints:**
  - Mobile: 0 - 767px (1 column, 16px margins)
  - Tablet: 768px - 1023px (6 columns, 24px margins)
  - Desktop: 1024px+ (12 columns, 40px margins)

## Elevation & Depth

This design system avoids heavy shadows to maintain a clean, clinical aesthetic. Hierarchy is instead established through **Tonal Layers** and **Low-Contrast Outlines**.

- **Surfaces:** Use a `1px` solid border (`#E2E8F0`) for all cards and containers. This provides a "technical" look that feels more precise than soft shadows.
- **Interactive States:** Use a subtle, extremely diffused shadow (0px 4px 12px rgba(26, 54, 93, 0.05)) only when a card is hovered to indicate interactivity.
- **Z-Index Strategy:** Modals and dropdowns should use a higher-contrast border (`#CBD5E0`) and a backdrop blur of `8px` to maintain focus without losing the context of the underlying data.

## Shapes

The shape language is **Soft (0.25rem / 4px)**. This choice reflects the precision of medical equipment—it is approachable but avoids the "playful" feel of high-radius circles.

- **Standard Elements:** Buttons, inputs, and checkboxes use a `4px` radius.
- **Container Elements:** Large cards and dashboard sections use `8px` (rounded-lg) to frame content more softly.
- **Herbal Accents:** Infographic elements or status "pills" may use a full pill-shape (999px) to provide a organic, leaf-like contrast to the otherwise rectangular grid.

## Components

### Buttons
- **Primary:** Solid `#1A365D` with white text. High contrast, sharp 4px corners.
- **Secondary:** Transparent background with a 1px `#1A365D` border.
- **Success/Herbal:** Solid `#2F855A` for completion actions or positive research findings.

### Cards
- White background, 1px `#E2E8F0` border. 
- Header section should have a subtle bottom border or a light slate tint (`#F8FAFC`) to house section titles and action icons.

### Inputs & Forms
- Focus state: `2px` solid border using the primary blue with a very light blue outer glow. 
- Labels: Use `label-bold` for all field descriptors to ensure they are distinct from the user's input text.

### Data Tables
- Row height: 48px for high density.
- Alternating row stripes: Use `#F8FAFC` for even rows to aid horizontal eye-tracking across complex data sets.

### Research Chips
- Small, pill-shaped tags used for categorizing botanical specimens or research tags. Use light tints of the primary and secondary colors (e.g., 10% opacity background with 100% opacity text).