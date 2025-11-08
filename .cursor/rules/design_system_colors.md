# Design System Color Usage Rules

## **CRITICAL: Use Only CSS Variables from index.css**

### **❌ FORBIDDEN: Hardcoded Colors**
Never use hardcoded color values like:
- `text-gray-600`
- `text-blue-600` 
- `text-red-500`
- `bg-gray-200`
- `border-gray-300`
- Any Tailwind color with numbers (e.g., `text-gray-500`, `bg-blue-400`)
- **`hsl(var(--color-name))`** - Don't wrap CSS variables in `hsl()`
- **`#hex-colors`** - No hex color codes

### **✅ REQUIRED: Use CSS Variables Only**
Always use semantic color variables from `index.css`:

#### **Text Colors:**
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary/muted text
- `text-primary` - Primary brand color
- `text-destructive` - Error/danger text
- `text-success` - Success text
- `text-warning` - Warning text

#### **Background Colors:**
- `bg-background` - Main background
- `bg-card` - Card backgrounds
- `bg-muted` - Muted backgrounds
- `bg-primary` - Primary backgrounds
- `bg-destructive` - Error backgrounds
- `bg-success` - Success backgrounds
- `bg-warning` - Warning backgrounds

#### **Border Colors:**
- `border-border` - Default borders
- `border-primary` - Primary borders
- `border-destructive` - Error borders

### **Examples:**

#### **❌ Wrong:**
```tsx
<span className="text-gray-600">Secondary text</span>
<button className="text-red-500 hover:text-red-700">Delete</button>
<div className="bg-gray-200">Background</div>
<div style={{ backgroundColor: 'hsl(var(--muted))' }}>Chart</div>
<Cell fill="hsl(var(--chart-1))" />
```

#### **✅ Correct:**
```tsx
<span className="text-muted-foreground">Secondary text</span>
<button className="text-destructive hover:text-destructive/80">Delete</button>
<div className="bg-muted">Background</div>
<div style={{ backgroundColor: 'var(--muted)' }}>Chart</div>
<Cell fill="var(--chart-1)" />
```

### **Why This Matters:**
1. **Consistent theming** - Colors adapt to light/dark mode
2. **Design system compliance** - Follows shadcn/ui patterns
3. **Maintainability** - Single source of truth for colors
4. **Accessibility** - Proper contrast ratios maintained
5. **Brand consistency** - Uses defined color palette

### **Enforcement:**
- Always check `index.css` for available color variables
- Use semantic naming (e.g., `text-destructive` not `text-red-500`)
- Prefer CSS variables over hardcoded values
- **Use direct CSS variables**: `var(--color-name)` not `hsl(var(--color-name))`
- When in doubt, use `text-muted-foreground` for secondary text
- For inline styles, use `var(--color-name)` directly
