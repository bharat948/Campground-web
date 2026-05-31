# Accessibility Guide — YelpCamp

> Based on [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/) targets.

---

## Current State

Partial accessibility support via Bootstrap and some ARIA labels. No formal audit performed.

---

## Requirements for New UI Work

### Semantic HTML

- Use `<main>`, `<nav>`, heading hierarchy (`h1` → `h2`)
- Form inputs must have associated `<label>` elements
- Use `<button>` for actions, not styled `<div>`s

### Images

- All `<img>` tags must have meaningful `alt` text
- Decorative images: `alt=""`

### Forms

- Mark required fields with `required` attribute AND visible indicator
- Associate validation errors with inputs (`aria-describedby`)
- Star rating fieldset has some ARIA labels — maintain when editing

### Keyboard Navigation

- All interactive elements must be focusable
- Carousel controls must be keyboard accessible (Bootstrap provides this)
- Map interactions are mouse-focused — provide text alternative for campground location

### Color Contrast

- Custom CSS uses CSS variables — verify 4.5:1 contrast ratio for text
- Do not rely on color alone for status (use icons/text too)

---

## Known Gaps

| Issue | Location | Fix |
|-------|----------|-----|
| Map not screen-reader accessible | clusterMap.js, show.ejs | Add text list alternative |
| `sr-only` labels incomplete | Some reply forms | Add visible or sr-only labels |
| Focus management after redirect | Flash messages | Announce via aria-live region |
| Skip navigation link | boilerplate.ejs | Add skip-to-main link |

---

## Testing

- Manual: Tab through all pages without mouse
- Tools: axe DevTools, Lighthouse accessibility audit
- Target: Lighthouse accessibility score > 90

---

## Related

- [DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md)
