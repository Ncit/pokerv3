# PF Din Text Comp Pro Fonts

This directory contains the PF Din Text Comp Pro font family for the poker game project.

## Font Files

- `PFDinTextCompPro-Regular.woff2` - Regular weight (400)
- `PFDinTextCompPro-Medium.woff2` - Medium weight (500)  
- `PFDinTextCompPro-Bold.woff2` - Bold weight (700)

## Installation

1. **Replace placeholder files**: The current files are placeholders. Replace them with the actual font files in WOFF2 format.

2. **Font loading**: The fonts are automatically loaded via `fonts.css` which is included in `index.html`.

## Usage

### CSS Variables
The font is available through CSS variables:

```css
/* Font family */
font-family: var(--font-primary);

/* Font weights */
font-weight: var(--font-weight-regular);  /* 400 */
font-weight: var(--font-weight-medium);   /* 500 */
font-weight: var(--font-weight-bold);     /* 700 */
```

### Utility Classes
Use these classes for quick font weight changes:

```html
<div class="font-regular">Regular text</div>
<div class="font-medium">Medium text</div>
<div class="font-bold">Bold text</div>
```

### Direct Usage
You can also use the font directly:

```css
.my-text {
    font-family: 'PF Din Text Comp Pro', sans-serif;
    font-weight: 500;
}
```

## Phaser.js Integration

For text objects in Phaser.js, you can specify the font family:

```javascript
this.add.text(x, y, 'Your text', {
    fontFamily: 'PF Din Text Comp Pro',
    fontSize: '24px',
    fontWeight: '500'
});
```

## Browser Support

- WOFF2 format is supported by all modern browsers
- Fallback fonts are provided for older browsers
- Font display is set to 'swap' for better performance

## Performance

- WOFF2 format provides the best compression
- Font-display: swap ensures text remains visible during font loading
- Fonts are loaded asynchronously for better page performance 