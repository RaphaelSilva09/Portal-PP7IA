# PP7+IAS Portal - Visual Identity & Design System

> Design System v3.0 — *"Less noise. More clarity."*

---

## 🎨 Color Palette

### Background Colors
| Name | CSS Variable | HEX Value | Usage |
|------|-------------|-----------|-------|
| Primary | `--bg-primary` | `#111111` | Main background |
| Secondary | `--bg-secondary` | `#1a1a1a` | Secondary background/cards |

### Text Colors
| Name | CSS Variable | HEX Value | Usage |
|------|-------------|-----------|-------|
| Primary | `--text-primary` | `#dadada` | Main text |
| Secondary | `--text-secondary` | `#acacac` | Secondary text/labels |

### Brand Colors
| Name | CSS Variable | HEX Value | Usage |
|------|-------------|-----------|-------|
| Blue | `--brand-blue` | `#3b9eff` | Links, highlights, CTAs |
| Purple | `--brand-purple` | `#6366f1` | Gradients, accents |
| Orange | `--brand-orange` | `#f97316` | Alerts, radar |
| Green | `--brand-green` | `#22c55e` | Success, primary CTAs |
| Emerald | `--brand-emerald` | `#059669` | Green gradients |
| Yellow | `--brand-yellow` | `#fbbf24` | Warnings, highlights |

### Surface Colors (Glassmorphism)
| Name | CSS Variable | Value | Usage |
|------|-------------|-------|-------|
| Glass Surface | `--surface-glass` | `rgba(255,255,255,0.05)` | Translucent cards |
| Glass Border | `--border-glass` | `rgba(255,255,255,0.1)` | Card borders |

---

## 🌈 Gradients

### Main Gradients
```css
/* Newsletter - Blue to Purple */
--gradient-newsletter: linear-gradient(135deg, rgb(59,130,246) 0%, rgb(99,102,241) 100%);

/* Radar - Orange to Yellow */
--gradient-radar: linear-gradient(135deg, rgb(249,115,22) 0%, rgb(251,191,36) 100%);

/* CTA - Green to Emerald */
--gradient-cta: linear-gradient(135deg, #22c55e 0%, #059669 100%);
```

### Usage in Tailwind Classes
```jsx
// Blue-purple gradient (brand)
className="bg-linear-to-r from-brand-blue to-brand-purple"

// Standard blue gradient
className="bg-gradient-to-r from-blue-500 to-purple-600"
```

---

## ✨ Shadows

### Base Shadows
| Name | CSS Variable | Usage |
|------|-------------|-------|
| SM | `--shadow-sm` | Subtle elements |
| MD | `--shadow-md` | Cards, buttons |
| LG | `--shadow-lg` | Modals, dropdowns |
| XL | `--shadow-xl` | Overlays |

### Glow Shadows
```css
/* Blue Glow */
--shadow-glow-blue: 0 0 20px rgba(0,129,242,0.4);
--shadow-glow-blue-sm: 0 0 10px rgba(59,130,246,0.3);
--shadow-glow-blue-md: 0 0 20px rgba(59,130,246,0.4);
--shadow-glow-blue-lg: 0 0 30px rgba(59,130,246,0.6);

/* Green Glow */
--shadow-glow-green: 0 0 20px rgba(34,197,94,0.4);
--shadow-glow-green-sm: 0 0 10px rgba(34,197,94,0.3);
--shadow-glow-green-md: 0 0 20px rgba(34,197,94,0.4);
--shadow-glow-green-lg: 0 0 30px rgba(34,197,94,0.6);

/* Purple Glow */
--shadow-glow-purple-md: 0 0 20px rgba(99,102,241,0.4);
--shadow-glow-purple-lg: 0 0 30px rgba(99,102,241,0.6);
```

---

## 🔤 Typography

### Fonts
| Type | Font | Fallbacks |
|------|------|-----------|
| **Sans-Serif** | Inter | SF Pro Display, system-ui, sans-serif |
| **Monospace** | SF Mono | ui-monospace, monospace |

### Available Weights (Inter)
- `400` — Regular
- `500` — Medium
- `600` — Semibold
- `700` — Bold
- `800` — Extrabold
- `900` — Black

### Usage
```jsx
// Default sans font
className="font-sans"

// Monospace font
className="font-mono"
```

---

## 📐 Border Radius

| Name | CSS Variable | Value | Usage |
|------|-------------|-------|-------|
| Pill | `--radius-pill` | `9999px` | Pill buttons |
| Card | `--radius-card` | `24px` | Large cards |
| Large | `--radius-lg` | `16px` | Modals |
| Medium | `--radius-md` | `12px` | Inputs, small cards |
| Small | `--radius-sm` | `8px` | Tags, badges |

---

## 🎬 Animations

### Durations
```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-slower: 600ms;
```

### Easing Functions
```css
--ease-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
```

### Animation Classes
| Class | Effect |
|-------|--------|
| `animate-fade-in` | Smooth fade in |
| `animate-scale-in` | Scale + fade in |
| `animate-fade-in-up` | Fade + slide up |
| `animate-fade-slide-up` | Slide up with delay |
| `animate-float` | Continuous float |
| `animate-pulse-dot` | Indicator pulse |
| `animate-pulse-slow` | Slow pulse ("7" symbol) |
| `animate-pulse-ring` | Ring pulse (CTAs) |
| `shimmer` | Shimmer/loading effect |

### Animation Delays
Classes: `animate-delay-75`, `animate-delay-100`, `animate-delay-150`, `animate-delay-200`, `animate-delay-300`, `animate-delay-400`, `animate-delay-500`

---

## 🪟 Glassmorphism

### Available Classes
```css
/* Generic glass */
.glass {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
}

/* Transparent navbar */
.glass-navbar {
  background: rgba(17,17,17,0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-glass);
}

/* Glass cards */
.glass-card {
  background: var(--surface-glass);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-glass);
  border-radius: 24px;
}
```

---

## 🎯 Buttons

### Gradient Button Classes
```css
/* Primary (Blue → Purple) */
.btn-gradient-primary {
  background: linear-gradient(to right, var(--brand-blue), var(--brand-purple));
  box-shadow: var(--shadow-glow-blue-md);
}

/* CTA (Green → Emerald) */
.btn-gradient-cta {
  background: var(--gradient-cta);
  box-shadow: var(--shadow-glow-green-md);
}
```

---

## 🎭 Symbols and Logo

### Main Logo
```
PP7+IAS.portal
```

**Treatment:**
- "PP7+IAS" — Blue→purple gradient (`from-brand-blue to-brand-purple`)
- ".portal" — Solid white (`text-white`)

### The Number 7
The number **7** is central to the brand identity. Uses `animate-pulse-slow` effect to highlight in important sections.

---

## 📱 Responsiveness and Accessibility

### Touch Targets
```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

### Safe Areas (Mobile)
```css
.safe-area-top { padding-top: env(safe-area-inset-top, 0); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom, 0); }
```

### Focus Visible
```css
:focus-visible {
  outline: 2px solid var(--brand-blue);
  outline-offset: 2px;
}
```

---

## 🖥 ️ Theme Color
```
#111111
```
Used in `theme-color` meta tag for mobile browsers.

---

## 📚 Quick Reference - Tailwind Custom Classes

| Class | Description |
|-------|-------------|
| `bg-bg-primary` | Primary background |
| `bg-bg-secondary` | Secondary background |
| `text-text-primary` | Primary text |
| `text-text-secondary` | Secondary text |
| `bg-brand-blue` | Brand blue color |
| `bg-brand-purple` | Brand purple color |
| `bg-brand-green` | Brand green color |
| `bg-brand-orange` | Brand orange color |
| `bg-brand-yellow` | Brand yellow color |
| `border-border-glass` | Glassmorphism border |
| `bg-surface-glass` | Translucent surface |

---

**Last Updated**: February 2026  
**Location**: `frontend/app/globals.css`
