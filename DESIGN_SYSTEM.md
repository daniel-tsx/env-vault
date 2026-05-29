# EnvVault Design System

A comprehensive design system built with shadcn/ui, Tailwind CSS, and a custom color palette designed for a security-focused developer tool.

## Design Principles

1. **Security-first**: Visual hierarchy emphasizes trust and security
2. **Developer-friendly**: Clean, minimal interface with clear information architecture
3. **Accessible**: WCAG 2.1 AA compliant with proper contrast ratios
4. **Consistent**: Unified component library with predictable behavior
5. **Dark mode optimized**: Designed for dark mode as the primary experience

## Color System

### Primary Palette (Blue/Indigo - Trust & Security)

```css
/* Light Mode */
--primary: oklch(0.55 0.2 260);           /* Deep blue */
--primary-foreground: oklch(0.985 0 0);   /* White */

/* Dark Mode */
--primary: oklch(0.7 0.18 260);           /* Lighter blue for dark mode */
--primary-foreground: oklch(0.145 0 0);   /* Dark text */
```

The primary color is a carefully chosen blue/indigo (hue 260) that conveys:
- **Trust**: Blue is universally associated with security and reliability
- **Professionalism**: Suitable for enterprise and developer tools
- **Calm**: Reduces anxiety when managing sensitive data

### Neutral Palette

```css
/* Light Mode */
--background: oklch(1 0 0);               /* Pure white */
--foreground: oklch(0.145 0 0);           /* Near black */
--muted: oklch(0.97 0 0);                 /* Light gray */
--muted-foreground: oklch(0.556 0 0);     /* Medium gray */

/* Dark Mode */
--background: oklch(0.145 0 0);           /* Near black */
--foreground: oklch(0.985 0 0);           /* Near white */
--muted: oklch(0.269 0 0);                /* Dark gray */
--muted-foreground: oklch(0.708 0 0);     /* Light gray */
```

### Semantic Colors

```css
--destructive: oklch(0.704 0.191 22.216); /* Red for errors/deletion */
--border: oklch(1 0 0 / 10%);             /* Subtle borders in dark mode */
--ring: oklch(0.7 0.18 260);              /* Focus rings match primary */
```

### Chart Colors

Sequential blue palette for data visualization:
```css
--chart-1: oklch(0.7 0.18 260);   /* Darkest */
--chart-2: oklch(0.6 0.2 260);
--chart-3: oklch(0.5 0.22 260);
--chart-4: oklch(0.4 0.24 260);
--chart-5: oklch(0.3 0.26 260);   /* Lightest */
```

## Typography

### Font Stack

```css
--font-sans: var(--font-geist-sans);  /* Geist Sans - Modern, geometric */
--font-mono: var(--font-geist-mono);  /* Geist Mono - For code/variables */
```

**Geist** is chosen for:
- Excellent readability at small sizes
- Modern, technical aesthetic
- Great for code and technical content
- Optimized for screens

### Type Scale

```tsx
// Headings
text-4xl md:text-6xl  // Hero titles
text-2xl md:text-3xl  // Section titles
text-xl               // Page titles
text-lg               // Subsection titles

// Body
text-base             // Default body text
text-sm               // Secondary text, labels
text-xs               // Captions, metadata

// Code
font-mono text-sm     // Variable keys
font-mono text-xs     // Variable values
```

## Spacing System

Based on Tailwind's default spacing scale (4px base):

```tsx
// Component padding
p-3    // 12px - Compact components
p-4    // 16px - Standard components
p-6    // 24px - Cards, sections

// Gaps
gap-1  // 4px - Tight spacing
gap-2  // 8px - Related items
gap-3  // 12px - Form fields
gap-4  // 16px - Card content
gap-6  // 24px - Sections
gap-8  // 32px - Major sections

// Margins
mb-1   // 4px - Label to input
mb-2   // 8px - Title to description
mb-4   // 16px - Component spacing
mb-6   // 24px - Section spacing
mb-8   // 32px - Major section spacing
```

## Border Radius

```css
--radius: 0.625rem;  /* 10px base */

/* Derived radii */
--radius-sm: calc(var(--radius) - 4px);   /* 6px */
--radius-md: calc(var(--radius) - 2px);   /* 8px */
--radius-lg: var(--radius);               /* 10px */
--radius-xl: calc(var(--radius) + 4px);   /* 14px */
```

## Component Library

### Buttons

```tsx
// Primary action
<Button>Save</Button>

// Secondary action
<Button variant="outline">Cancel</Button>

// Ghost/subtle action
<Button variant="ghost">Edit</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// With icon
<Button>
  <Plus className="size-4" data-icon="inline-start" />
  Add
</Button>

// Loading state
<Button disabled>
  <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
  Saving...
</Button>

// Sizes
<Button size="sm">Small</Button>
<Button>Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Project Name</CardTitle>
    <CardDescription>Project description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

### Forms

```tsx
<form>
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea id="description" placeholder="Enter description..." />
    </div>
    
    <Button type="submit">Submit</Button>
  </div>
</form>
```

### Dialogs

```tsx
<Dialog>
  <DialogTrigger render={<Button />}>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Alerts

```tsx
// Destructive alert
<Alert variant="destructive">
  <AlertDescription>Error message</AlertDescription>
</Alert>

// Default alert
<Alert>
  <AlertDescription>Info message</AlertDescription>
</Alert>
```

### Badges

```tsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
```

### Tooltips

```tsx
<Tooltip>
  <TooltipTrigger render={<Button />}>
    <Icon />
  </TooltipTrigger>
  <TooltipContent>Tooltip text</TooltipContent>
</Tooltip>
```

### Dropdown Menus

```tsx
<DropdownMenu>
  <DropdownMenuTrigger render={<Button />}>
    Menu
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Icon System

Using **Lucide React** icons for consistency:

```tsx
import { Lock, Folder, Search, Copy, Eye, EyeOff, Trash2 } from "lucide-react";

// Standard size
<Icon className="size-4" />

// With buttons
<Button>
  <Plus className="size-4" data-icon="inline-start" />
  Add
</Button>
```

### Common Icons

- **Lock**: Security, encryption
- **Folder**: Projects
- **Search**: Search functionality
- **Copy**: Copy to clipboard
- **Eye/EyeOff**: Reveal/hide secrets
- **Trash2**: Delete actions
- **Plus**: Add/create actions
- **ArrowLeft**: Back navigation
- **Loader2**: Loading states (with `animate-spin`)
- **Check**: Success states

## Layout Patterns

### Page Layout

```tsx
<div className="max-w-6xl mx-auto px-6 py-8">
  <header className="mb-8">
    <h1 className="text-2xl font-bold">Page Title</h1>
    <p className="text-muted-foreground">Description</p>
  </header>
  
  <main>
    {/* Content */}
  </main>
</div>
```

### Sticky Header

```tsx
<header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
  {/* Header content */}
</header>
```

### Grid Layouts

```tsx
// Responsive grid
<div className="grid md:grid-cols-3 gap-8">
  {/* Items */}
</div>

// List layout
<div className="space-y-4">
  {/* Items */}
</div>
```

## Empty States

```tsx
<Card>
  <CardContent className="flex flex-col items-center justify-center py-16">
    <Icon className="size-12 mb-4 text-muted-foreground" />
    <h3 className="text-lg font-medium mb-2">No items yet</h3>
    <p className="text-muted-foreground text-center">
      Description of empty state
    </p>
  </CardContent>
</Card>
```

## Loading States

```tsx
// Button loading
<Button disabled>
  <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
  Loading...
</Button>

// Skeleton loading
<Skeleton className="h-4 w-[200px]" />
<Skeleton className="h-4 w-[150px]" />
```

## Feedback

### Toast Notifications (Sonner)

```tsx
import { toast } from "sonner";

// Success
toast.success("Variable created");

// Error
toast.error("Failed to delete variable");

// Info
toast.info("Copied to clipboard");
```

## Security Patterns

### Secret Display

```tsx
// Masked by default
<Badge variant="outline" className="font-mono">
  ••••••••••••
</Badge>

// Revealed on demand
<code className="text-xs font-mono text-muted-foreground break-all">
  {decryptedValue}
</code>
```

### Confirmation Dialogs

Always use AlertDialog for destructive actions:

```tsx
<AlertDialog>
  <AlertDialogTrigger>Delete</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete project</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive">
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Accessibility

### Focus Management

- All interactive elements have visible focus rings
- Focus rings use `--ring` color (matches primary)
- Dialogs trap focus when open
- Escape key closes overlays

### Keyboard Navigation

- Tab: Navigate between interactive elements
- Enter/Space: Activate buttons/links
- Escape: Close dialogs/menus
- Arrow keys: Navigate within menus

### ARIA Labels

```tsx
<Button aria-label="Delete project">
  <Trash2 className="size-4" />
</Button>

<Tooltip>
  <TooltipTrigger aria-describedby="tooltip-id">
    <Icon />
  </TooltipTrigger>
  <TooltipContent id="tooltip-id">
    Tooltip text
  </TooltipContent>
</Tooltip>
```

## Responsive Design

### Breakpoints

```tsx
sm:  640px   // Mobile landscape
md:  768px   // Tablet
lg:  1024px  // Desktop
xl:  1280px  // Large desktop
```

### Responsive Patterns

```tsx
// Stack on mobile, row on desktop
<div className="flex flex-col sm:flex-row gap-4">

// Hide on mobile
<div className="hidden md:block">

// Responsive text
<h1 className="text-2xl md:text-4xl">

// Responsive padding
<div className="px-4 md:px-6 lg:px-8">
```

## Animation

### Transitions

```tsx
// Color transitions
transition-colors hover:bg-accent

// Opacity transitions
transition-opacity hover:opacity-90

// All properties
transition-all hover:shadow-lg
```

### Loading Animations

```tsx
// Spinner
<Loader2 className="size-4 animate-spin" />

// Skeleton
<Skeleton className="animate-pulse" />
```

## Best Practices

1. **Use semantic colors**: Always use `bg-primary`, `text-muted-foreground`, etc.
2. **Consistent spacing**: Use the spacing scale, avoid arbitrary values
3. **Icon sizing**: Use `size-*` for equal width/height
4. **Button icons**: Use `data-icon="inline-start"` or `data-icon="inline-end"`
5. **Loading states**: Always show loading indicators for async operations
6. **Error handling**: Use Alert components for form errors
7. **Confirmation**: Use AlertDialog for destructive actions
8. **Tooltips**: Add tooltips to icon-only buttons
9. **Empty states**: Provide helpful empty states with CTAs
10. **Accessibility**: Test with keyboard navigation and screen readers

## Customization

### Extending Colors

Add custom colors to `app/globals.css`:

```css
:root {
  --custom-color: oklch(0.6 0.2 180);
}

@theme inline {
  --color-custom: var(--custom-color);
}
```

### Creating Variants

Extend component variants in the component file:

```tsx
<Button variant="custom">Custom Button</Button>
```

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [Geist Font](https://vercel.com/font)

---

**Built with care for security, accessibility, and developer experience.**
