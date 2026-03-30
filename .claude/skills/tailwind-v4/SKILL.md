---
name: tailwind-v4
description: Expert guidance for Tailwind CSS v4 in Next.js 15 projects. Use this skill whenever writing or reviewing JSX/TSX components with Tailwind classes, designing layouts, implementing responsive design, building UI components, handling dark mode, or using the `cn()` utility. Activate even if the user just says "add styles", "make it look good", or "design this component" — if there's UI involved in this project, this skill applies.
---

# Tailwind CSS v4 — Biblioteca Virtual

This project uses **Tailwind CSS v4** with Next.js 15 App Router. Apply these guidelines whenever writing or reviewing styled components.

## Key v4 Differences from v3

Tailwind v4 uses CSS-first configuration via `@import "tailwindcss"` instead of `tailwind.config.js`. Custom tokens are defined in CSS with `@theme`:

```css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --font-sans: 'Inter', sans-serif;
}
```

There is no `tailwind.config.js` to extend — all customization lives in the CSS file.

## Class Ordering Convention

Always apply classes in this order (improves readability and avoids specificity surprises):

1. Layout & display (`flex`, `grid`, `block`, `hidden`)
2. Position (`relative`, `absolute`, `fixed`, `z-*`)
3. Box model (`w-*`, `h-*`, `p-*`, `m-*`)
4. Typography (`text-*`, `font-*`, `leading-*`, `tracking-*`)
5. Colors & background (`bg-*`, `text-*`, `border-*`)
6. Borders & radius (`border`, `rounded-*`, `ring-*`)
7. Effects (`shadow-*`, `opacity-*`, `transition-*`)
8. Responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
9. State variants (`hover:`, `focus:`, `active:`, `disabled:`)
10. Dark mode (`dark:`)

## `cn()` Utility

Use `cn()` from `lib/utils` for conditional classes. Never concatenate strings manually.

```tsx
// Good
<button className={cn(
  "flex items-center px-4 py-2 rounded-lg font-medium transition-colors",
  variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
  variant === "ghost" && "text-gray-600 hover:bg-gray-100",
  disabled && "opacity-50 cursor-not-allowed"
)}>

// Bad
<button className={`flex items-center ${variant === "primary" ? "bg-blue-600" : "bg-gray-100"}`}>
```

## Responsive Design

This project targets mobile-first. Always design for mobile, then expand up:

```tsx
// Mobile-first pattern
<div className="flex flex-col gap-4 md:flex-row md:gap-6 lg:gap-8">
```

Key breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).

## Component Patterns for This Project

### Card (used for BookCard, UserCard)
```tsx
<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
```

### Badge (loan status, roles)
```tsx
<span className={cn(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  status === "active" && "bg-green-100 text-green-700",
  status === "overdue" && "bg-red-100 text-red-700",
  status === "returned" && "bg-gray-100 text-gray-600"
)}>
```

### Form inputs
```tsx
<input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-400" />
```

### Page layout
```tsx
<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
```

## Accessibility

- Always pair color with another indicator (icon, text, pattern) — never color alone
- Use `sr-only` for screen-reader-only labels
- Ensure focus rings are visible: `focus-visible:ring-2 focus-visible:ring-blue-500`
- Minimum touch targets: `min-h-[44px] min-w-[44px]`

## What to Avoid

- Avoid arbitrary values like `w-[347px]` — prefer spacing scale values
- Avoid `!important` overrides (`!text-red-500`) unless truly necessary
- Don't use inline `style` prop when a Tailwind class exists
- Don't mix Tailwind with custom CSS modules in the same component
