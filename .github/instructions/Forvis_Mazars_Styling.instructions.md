---
applyTo: "**"
---
# Forvis Mazars – WeVote Platform Styling Instructions

## Overview
These instructions define the visual language and component patterns for the
WeVote platform, aligned with Forvis Mazars brand guidelines.

---

## Brand Colors

### Primary Palette
```ts
// Use these exact values across all components
const colors = {
  navy:       '#1A1F5E', // Primary brand – headers, sidebars, nav
  coral:      '#E83E2D', // Accent – CTAs, alerts, highlights
  blue:       '#0072CE', // Interactive – links, buttons, focus
  white:      '#FFFFFF', // Backgrounds, reversed text
};
```

### Neutral Palette
```ts
const neutrals = {
  darkGrey:   '#333333', // Body text, headings
  midGrey:    '#8C8C8C', // Secondary text, placeholders
  lightGrey:  '#F4F4F4', // Page backgrounds, card fills
  border:     '#E5E7EB', // Dividers, input borders
};
```

### Tailwind Arbitrary Value Reference
```
Navy   → [#1A1F5E]
Coral  → [#E83E2D]
Blue   → [#0072CE]
```

---

## Typography

### Font Stack
```css
/* Add to index.css or tailwind config */
font-family: 'GT Walsheim', 'Inter', Arial, sans-serif;
```

### Tailwind Class Conventions
| Element       | Classes                                              |
|---------------|------------------------------------------------------|
| Page Title    | `text-4xl font-bold text-[#1A1F5E]`                 |
| Section H2    | `text-3xl font-bold text-[#1A1F5E]`                 |
| Card H3       | `text-xl font-semibold text-[#333333]`              |
| Body Text     | `text-base text-[#333333] leading-relaxed`          |
| Caption/Label | `text-sm text-[#8C8C8C]`                            |
| Link          | `text-[#0072CE] underline hover:text-[#E83E2D]`     |

### Rules
- ✅ Always use **sentence case** for headings
- ✅ Minimum body text size: `text-base` (16px)
- ✅ Line height: `leading-relaxed` or `leading-loose` for readability
- ❌ Never use `text-xs` for meaningful content
- ❌ Never use more than 2 font weights per card/section

---

## Backgrounds

### Page Background (All Pages)
```tsx
// Apply to every page wrapper
<div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4]">
```

### Section Variants
```tsx
// Dark hero/banner section
<section className="bg-[#1A1F5E] text-white">

// Subtle accent section
<section className="bg-[#F4F4F4]">

// White content section
<section className="bg-white">
```

---

## Buttons

### Primary Button
```tsx
<button className="
  bg-gradient-to-r from-[#0072CE] to-[#1A1F5E]
  text-white font-semibold
  px-8 py-3 rounded-full
  transition-all duration-200
  hover:opacity-90 hover:scale-105
  active:scale-95
  shadow-lg
">
  Submit Vote
</button>
```

### Secondary Button
```tsx
<button className="
  bg-transparent
  text-[#1A1F5E] font-semibold
  px-8 py-3 rounded-full
  border-2 border-[#1A1F5E]
  transition-all duration-200
  hover:bg-[#1A1F5E] hover:text-white
  active:scale-95
">
  Cancel
</button>
```

### Danger / Alert Button
```tsx
<button className="
  bg-gradient-to-r from-[#E83E2D] to-[#c0321f]
  text-white font-semibold
  px-8 py-3 rounded-full
  transition-all duration-200
  hover:opacity-90 hover:scale-105
  shadow-lg
">
  Remove
</button>
```

### Icon Button
```tsx
<button className="
  p-2 rounded-full
  text-[#1A1F5E]
  hover:bg-[#1A1F5E]/10
  transition-colors duration-200
">
  <Icon size={20} />
</button>
```

---

## Cards & Containers

### Standard Card
```tsx
<div className="
  bg-white
  rounded-3xl
  shadow-xl
  p-8
  border border-[#E5E7EB]
  hover:shadow-2xl
  transition-shadow duration-300
">
```

### Accent Card (with navy top border)
```tsx
<div className="
  bg-white
  rounded-3xl
  shadow-xl
  p-8
  border-t-4 border-t-[#1A1F5E]
  border border-[#E5E7EB]
">
```

### Coral Accent Card (highlight/featured)
```tsx
<div className="
  bg-white
  rounded-3xl
  shadow-xl
  p-8
  border-t-4 border-t-[#E83E2D]
  border border-[#E5E7EB]
">
```

### Stat / Info Card
```tsx
<div className="
  bg-gradient-to-br from-[#1A1F5E] to-[#0072CE]
  text-white
  rounded-3xl
  shadow-xl
  p-6
">
```

---

## Form Inputs

### Text Input
```tsx
<input className="
  w-full
  px-4 py-3
  rounded-2xl
  border-2 border-[#E5E7EB]
  text-[#333333]
  placeholder-[#8C8C8C]
  bg-white
  focus:outline-none
  focus:border-[#1A1F5E]
  focus:ring-2 focus:ring-[#1A1F5E]/20
  transition-all duration-200
" />
```

### Select Dropdown
```tsx
<select className="
  w-full
  px-4 py-3
  rounded-2xl
  border-2 border-[#E5E7EB]
  text-[#333333]
  bg-white
  focus:outline-none
  focus:border-[#1A1F5E]
  focus:ring-2 focus:ring-[#1A1F5E]/20
  transition-all duration-200
" />
```

### Form Label
```tsx
<label className="block text-sm font-semibold text-[#333333] mb-2">
  Email Address
</label>
```

### Error State
```tsx
<input className="
  ... /* base input classes */
  border-[#E83E2D]
  focus:border-[#E83E2D]
  focus:ring-[#E83E2D]/20
" />
<p className="text-sm text-[#E83E2D] mt-1">This field is required.</p>
```

---

## Navigation

### Top Nav Bar
```tsx
<nav className="
  bg-[#1A1F5E]
  text-white
  shadow-2xl
  px-8 py-4
  flex items-center justify-between
">
```

### Nav Link
```tsx
<a className="
  text-white/80
  hover:text-white
  font-medium
  transition-colors duration-200
  relative after:absolute after:bottom-0 after:left-0
  after:h-0.5 after:w-0 after:bg-[#E83E2D]
  hover:after:w-full after:transition-all after:duration-300
">
```

### Active Nav Link
```tsx
<a className="text-white font-semibold border-b-2 border-[#E83E2D]">
```

---

## Badges & Tags

### Status Badges
```tsx
// Active / Success
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
  Active
</span>

// Pending / Warning
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
  Pending
</span>

// Closed / Inactive
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#8C8C8C]/10 text-[#8C8C8C]">
  Closed
</span>

// Featured / Navy
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1A1F5E]/10 text-[#1A1F5E]">
  Resolution
</span>

// Alert / Coral
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E83E2D]/10 text-[#E83E2D]">
  Urgent
</span>
```

---

## Alerts & Notifications

### Success Alert
```tsx
<div className="
  flex items-center gap-3
  bg-green-50 border border-green-200
  text-green-800
  px-5 py-4 rounded-2xl
">
```

### Error Alert
```tsx
<div className="
  flex items-center gap-3
  bg-[#E83E2D]/10 border border-[#E83E2D]/30
  text-[#E83E2D]
  px-5 py-4 rounded-2xl
">
```

### Info Alert
```tsx
<div className="
  flex items-center gap-3
  bg-[#0072CE]/10 border border-[#0072CE]/30
  text-[#1A1F5E]
  px-5 py-4 rounded-2xl
">
```

---

## Framer Motion Patterns

### Page Entry Animation
```tsx
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -20 },
};

<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={{ duration: 0.4, ease: 'easeOut' }}
>
```

### Card Hover Animation
```tsx
<motion.div
  whileHover={{ scale: 1.02, y: -4 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
>
```

### Staggered List
```tsx
const containerVariants = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

<motion.ul variants={containerVariants} initial="initial" animate="animate">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants}>
```

### Button Press
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
>
```

---

## Dividers & Spacing

### Section Divider
```tsx
<hr className="border-[#E5E7EB] my-8" />
```

### Accent Divider (navy)
```tsx
<div className="h-1 w-16 bg-[#1A1F5E] rounded-full my-4" />
```

### Coral Accent Line
```tsx
<div className="h-1 w-12 bg-[#E83E2D] rounded-full my-4" />
```

### Spacing Scale Convention
| Purpose          | Class          |
|------------------|----------------|
| Micro            | `gap-1 / p-1`  |
| Tight            | `gap-2 / p-2`  |
| Default          | `gap-4 / p-4`  |
| Component        | `gap-6 / p-6`  |
| Section          | `gap-10 / p-10`|
| Page section     | `py-20`        |

---

## Logo & Favicon Rules

- ✅ Use **white logo** on navy (`#1A1F5E`) backgrounds
- ✅ Use **full colour logo** on white or light grey backgrounds
- ✅ Favicon uses the **"FM" monogram** on navy — `16x16`, `32x32`, `64x64`
- ✅ Maintain clear space equal to the height of the logomark on all sides
- ❌ Never stretch, recolour, or rotate the logo
- ❌ Never place the logo on a busy background without an overlay

---

## Accessibility Rules

- ✅ All colour combinations must meet **WCAG AA** (4.5:1 contrast ratio)
- ✅ All images must have meaningful `alt` attributes
- ✅ Focus states must be visible: `focus:ring-2 focus:ring-[#1A1F5E]/50`
- ✅ Interactive targets minimum `44x44px`
- ✅ Use semantic HTML — `<button>`, `<nav>`, `<main>`, `<section>`, `<header>`
- ❌ Never use colour alone to convey meaning — always pair with icon or text

---

## Responsive Breakpoints

| Breakpoint | Tailwind Prefix | Min Width |
|------------|-----------------|-----------|
| Mobile     | (default)       | 0px       |
| Tablet     | `md:`           | 768px     |
| Desktop    | `lg:`           | 1024px    |
| Wide       | `xl:`           | 1280px    |

```tsx
// Example responsive pattern
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

## ❌ Anti-Patterns — Never Do These

| ❌ Avoid                                     | ✅ Do Instead                                  |
|----------------------------------------------|------------------------------------------------|
| Inline `style={{}}` for colours              | Use Tailwind arbitrary values `[#hex]`         |
| `rounded` or `rounded-lg` on cards           | Use `rounded-2xl` or `rounded-3xl`             |
| Generic grey buttons                         | Use navy/coral/blue gradient buttons           |
| `shadow-sm` on elevated components          | Use `shadow-xl` or `shadow-2xl`                |
| Coral as a background colour                 | Use coral only as **accent/border/text**       |
| Navy and coral together as equal elements    | One dominates, other **accents**               |
| Animations without `transition` or easing   | Always define `duration` and `ease`            |
| Missing loading/error states                 | Always handle both in every async component    |

---

## Quick Reference Snippet

```tsx
// Standard WeVote Page Shell
export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4]">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Page Header */}
        <div className="mb-10">
          <div className="h-1 w-12 bg-[#E83E2D] rounded-full mb-4" />
          <h1 className="text-4xl font-bold text-[#1A1F5E]">Page Title</h1>
          <p className="text-[#8C8C8C] mt-2 text-base leading-relaxed">
            Supporting description text.
          </p>
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-t-[#1A1F5E]">
            {/* Card content */}
          </div>
        </div>

      </div>
    </div>
  );
}