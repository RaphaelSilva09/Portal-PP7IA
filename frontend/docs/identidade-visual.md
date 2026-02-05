# PP7+IAS Portal - Identidade Visual

> Design System v3.0 — *"Menos ruído. Mais clareza."*

---

## 🎨 Paleta de Cores

### Cores de Background
| Nome | Variável CSS | Valor HEX | Uso |
|------|-------------|-----------|-----|
| Primary | `--bg-primary` | `#111111` | Fundo principal |
| Secondary | `--bg-secondary` | `#1a1a1a` | Fundo secundário/cards |

### Cores de Texto
| Nome | Variável CSS | Valor HEX | Uso |
|------|-------------|-----------|-----|
| Primary | `--text-primary` | `#dadada` | Texto principal |
| Secondary | `--text-secondary` | `#acacac` | Texto secundário/labels |

### Cores da Marca (Brand)
| Nome | Variável CSS | Valor HEX | Uso |
|------|-------------|-----------|-----|
| Blue | `--brand-blue` | `#3b9eff` | Links, destaques, CTAs |
| Purple | `--brand-purple` | `#6366f1` | Gradientes, acentos |
| Orange | `--brand-orange` | `#f97316` | Alertas, radar |
| Green | `--brand-green` | `#22c55e` | Sucesso, CTAs primários |
| Emerald | `--brand-emerald` | `#059669` | Gradientes verdes |
| Yellow | `--brand-yellow` | `#fbbf24` | Warnings, destaques |

### Cores de Superfície (Glassmorphism)
| Nome | Variável CSS | Valor | Uso |
|------|-------------|-------|-----|
| Glass Surface | `--surface-glass` | `rgba(255,255,255,0.05)` | Cards translúcidos |
| Glass Border | `--border-glass` | `rgba(255,255,255,0.1)` | Bordas de cards |

---

## 🌈 Gradientes

### Gradientes Principais
```css
/* Newsletter - Azul para Roxo */
--gradient-newsletter: linear-gradient(135deg, rgb(59,130,246) 0%, rgb(99,102,241) 100%);

/* Radar - Laranja para Amarelo */
--gradient-radar: linear-gradient(135deg, rgb(249,115,22) 0%, rgb(251,191,36) 100%);

/* CTA - Verde para Esmeralda */
--gradient-cta: linear-gradient(135deg, #22c55e 0%, #059669 100%);
```

### Uso em Classes Tailwind
```jsx
// Gradiente azul-roxo (brand)
className="bg-linear-to-r from-brand-blue to-brand-purple"

// Gradiente azul padrão
className="bg-gradient-to-r from-blue-500 to-purple-600"
```

---

## ✨ Sombras

### Sombras Base
| Nome | Variável CSS | Uso |
|------|-------------|-----|
| SM | `--shadow-sm` | Elementos sutis |
| MD | `--shadow-md` | Cards, botões |
| LG | `--shadow-lg` | Modals, dropdowns |
| XL | `--shadow-xl` | Overlays |

### Sombras Glow (Brilho)
```css
/* Glow Azul */
--shadow-glow-blue: 0 0 20px rgba(0,129,242,0.4);
--shadow-glow-blue-sm: 0 0 10px rgba(59,130,246,0.3);
--shadow-glow-blue-md: 0 0 20px rgba(59,130,246,0.4);
--shadow-glow-blue-lg: 0 0 30px rgba(59,130,246,0.6);

/* Glow Verde */
--shadow-glow-green: 0 0 20px rgba(34,197,94,0.4);
--shadow-glow-green-sm: 0 0 10px rgba(34,197,94,0.3);
--shadow-glow-green-md: 0 0 20px rgba(34,197,94,0.4);
--shadow-glow-green-lg: 0 0 30px rgba(34,197,94,0.6);

/* Glow Roxo */
--shadow-glow-purple-md: 0 0 20px rgba(99,102,241,0.4);
--shadow-glow-purple-lg: 0 0 30px rgba(99,102,241,0.6);
```

---

## 🔤 Tipografia

### Fontes
| Tipo | Fonte | Fallbacks |
|------|-------|-----------|
| **Sans-Serif** | Inter | SF Pro Display, system-ui, sans-serif |
| **Monospace** | SF Mono | ui-monospace, monospace |

### Pesos Disponíveis (Inter)
- `400` — Regular
- `500` — Medium
- `600` — Semibold
- `700` — Bold
- `800` — Extrabold
- `900` — Black

### Uso
```jsx
// Fonte sans padrão
className="font-sans"

// Fonte monospace
className="font-mono"
```

---

## 📐 Border Radius

| Nome | Variável CSS | Valor | Uso |
|------|-------------|-------|-----|
| Pill | `--radius-pill` | `9999px` | Botões pill |
| Card | `--radius-card` | `24px` | Cards grandes |
| Large | `--radius-lg` | `16px` | Modals |
| Medium | `--radius-md` | `12px` | Inputs, cards pequenos |
| Small | `--radius-sm` | `8px` | Tags, badges |

---

## 🎬 Animações

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

### Classes de Animação
| Classe | Efeito |
|--------|--------|
| `animate-fade-in` | Fade in suave |
| `animate-scale-in` | Scale + fade in |
| `animate-fade-in-up` | Fade + slide up |
| `animate-fade-slide-up` | Slide up com delay |
| `animate-float` | Flutuação contínua |
| `animate-pulse-dot` | Pulso de indicador |
| `animate-pulse-slow` | Pulso lento (símbolo "7") |
| `animate-pulse-ring` | Pulso em anel (CTAs) |
| `shimmer` | Efeito shimmer/loading |

### Animation Delays
Classes: `animate-delay-75`, `animate-delay-100`, `animate-delay-150`, `animate-delay-200`, `animate-delay-300`, `animate-delay-400`, `animate-delay-500`

---

## 🪟 Glassmorphism

### Classes Disponíveis
```css
/* Glass genérico */
.glass {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
}

/* Navbar transparente */
.glass-navbar {
  background: rgba(17,17,17,0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-glass);
}

/* Cards glass */
.glass-card {
  background: var(--surface-glass);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-glass);
  border-radius: 24px;
}
```

---

## 🎯 Botões

### Classes de Botão Gradiente
```css
/* Primário (Azul → Roxo) */
.btn-gradient-primary {
  background: linear-gradient(to right, var(--brand-blue), var(--brand-purple));
  box-shadow: var(--shadow-glow-blue-md);
}

/* CTA (Verde → Esmeralda) */
.btn-gradient-cta {
  background: var(--gradient-cta);
  box-shadow: var(--shadow-glow-green-md);
}
```

---

## 🎭 Símbolos e Logo

### Logo Principal
```
PP7+IAS.portal
```

**Tratamento:**
- "PP7+IAS" — Gradiente azul→roxo (`from-brand-blue to-brand-purple`)
- ".portal" — Branco sólido (`text-white`)

### O Número 7
O número **7** é central na identidade da marca. Usa o efeito `animate-pulse-slow` para destacar em seções importantes.

---

## 📱 Responsividade e Acessibilidade

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

## 🖥️ Theme Color
```
#111111
```
Usado no meta tag `theme-color` para navegadores mobile.

---

## 📚 Referência Rápida - Tailwind Custom Classes

| Classe | Descrição |
|--------|-----------|
| `bg-bg-primary` | Background primário |
| `bg-bg-secondary` | Background secundário |
| `text-text-primary` | Texto principal |
| `text-text-secondary` | Texto secundário |
| `bg-brand-blue` | Cor azul da marca |
| `bg-brand-purple` | Cor roxa da marca |
| `bg-brand-green` | Cor verde da marca |
| `bg-brand-orange` | Cor laranja da marca |
| `bg-brand-yellow` | Cor amarela da marca |
| `border-border-glass` | Borda glassmorphism |
| `bg-surface-glass` | Superfície translúcida |
