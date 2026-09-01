# Landing Page Design System Implementation Guide

## ✅ What's Been Done

### 1. PNG Logo Integration
- ✅ Copied brand-approved PNG logos to `/public/`
- ✅ Updated `brand.ts` to use PNG instead of SVG
- ✅ Ready for WebP optimization for performance

### 2. Complete Design System Created

**Files Created:**
1. **`design-tokens.ts`** (320 lines) - Central design tokens
2. **`landing-ui.tsx`** (284 lines) - Reusable UI components
3. **`styles.css`** (181 new lines) - Utility classes

---

## 🎨 How to Use the New Components

### Replace Inconsistent Buttons

**Before** (inconsistent styling):
```tsx
<button className="bg-[#2563EB] text-white px-4 py-2 rounded...">
  Get Started
</button>
```

**After** (standardized):
```tsx
import { Button } from '@/components/landing-ui';

<Button variant="primary" size="lg">
  Get Started
</Button>
```

**Button Variants:**
- `primary` - Blue gradient with shadow
- `secondary` - White with border
- `ghost` - Transparent background

### Replace Inconsistent Cards

**Before**:
```tsx
<div className="bg-white p-6 rounded-xl border...">
  <h3>Title</h3>
  <p>Description</p>
</div>
```

**After**:
```tsx
import { FeatureCard } from '@/components/landing-ui';
import { Users } from 'lucide-react';

<FeatureCard
  icon={<Users className="h-6 w-6" />}
  title="Gestion des clients"
  description="Centralisez toutes vos informations clients."
  iconColor="#2563EB"
/>
```

### Section Structure

**Before**:
```tsx
<section className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-4">
    <h2>Title</h2>
    {/* content */}
  </div>
</section>
```

**After**:
```tsx
import { Section, SectionHeader } from '@/components/landing-ui';

<Section background="mist">
  <SectionHeader
    badge="Features"
    title="Everything your school needs"
    description="Manage students, staff, and operations in one place"
    centered
  />
  {/* content */}
</Section>
```

---

## 🔧 Quick Fixes for Common Issues

### Issue 1: Inconsistent Background Colors

**Find and replace:**
- ❌ `bg-[#F8FAFC]` or `bg-[#F7F9FC]`
- ✅ Use: `landing-section-mist` or `<Section background="mist">`

### Issue 2: Hardcoded Button Styles

**Find and replace:**
- ❌ `bg-[#2563EB] text-white px-8 py-4 rounded-full...`
- ✅ Use: `<Button variant="primary">` or `landing-btn-primary`

### Issue 3: Card Shadow Inconsistency

**Find and replace:**
- ❌ `shadow-[0_10px...]` (various values)
- ✅ Use: `landing-card` class or `<FeatureCard>`

### Issue 4: Text Color Variations

**Find and replace:**
- ❌ `text-[#0B1220]/70`, `text-[#0B1220]/60`, etc.
- ✅ Use CSS variables: `text-ink` or `text-ink/70`

---

## 📋 Landing Page Section Checklist

### Hero Section
- [ ] Replace custom button with `<Button variant="primary">`
- [ ] Use `landing-section-white` background
- [ ] Ensure heading uses `landing-section-title` class
- [ ] Replace hardcoded colors with CSS variables

### Features Section
- [ ] Wrap in `<Section background="mist">`
- [ ] Use `<SectionHeader>` for title/description
- [ ] Replace feature cards with `<FeatureCard>`
- [ ] Ensure consistent spacing

### Dark Section (Stats/CTA)
- [ ] Use `landing-dark-section` class
- [ ] Replace cards with `<StatCard>` component
- [ ] Update button to use standardized styles

### Testimonials
- [ ] Replace with `<TestimonialCard>` component
- [ ] Use consistent card styling
- [ ] Ensure proper spacing

### Pricing Section
- [ ] Use `landing-card` class for pricing cards
- [ ] Standardize button styles
- [ ] Consistent border-radius (1.5rem/24px)

### Contact Form
- [ ] Use `<Section background="white">`
- [ ] `<Button variant="primary">` for submit
- [ ] Consistent input styling

---

## 💻 CSS Utility Classes Reference

### Backgrounds
```css
.landing-section-white     /* Pure white */
.landing-section-mist      /* Light blue-gray (#F7F9FC) */
.landing-section-gradient  /* White → Mist → White gradient */
.landing-dark-section      /* Dark navy gradient */
```

### Cards
```css
.landing-card              /* Standard white card with shadow */
.landing-card:hover        /* Hover effect (lift + shadow) */
```

### Buttons
```css
.landing-btn-primary       /* Blue gradient button */
.landing-btn-secondary     /* White button with border */
```

### Typography
```css
.landing-section-badge     /* Small blue badge */
.landing-section-title     /* Large heading (responsive) */
.landing-section-description /* Body text */
```

### Stats
```css
.landing-stat-card         /* Stat display container */
.landing-stat-value        /* Large number */
.landing-stat-label        /* Small label */
```

---

## 🎯 Example: Before & After

### Before (Inconsistent)
```tsx
<section className="py-20 bg-[#F8FAFC]">
  <div className="max-w-7xl mx-auto px-4">
    <div className="text-center mb-12">
      <span className="inline-flex rounded-full bg-[#2563EB]/20 px-4 py-2 text-xs text-[#2563EB]">
        FEATURES
      </span>
      <h2 className="mt-4 text-4xl font-bold text-[#0B1220]">
        Everything You Need
      </h2>
    </div>
    
    <div className="grid gap-6 md:grid-cols-3">
      <div className="rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl">
        <div className="mb-4 h-12 w-12 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
          <Users className="h-6 w-6 text-[#2563EB]" />
        </div>
        <h3 className="mb-2 text-lg font-bold">Clients</h3>
        <p className="text-sm text-gray-600">Manage all your clients</p>
      </div>
      {/* More cards... */}
    </div>
  </div>
</section>
```

### After (Standardized)
```tsx
import { Section, SectionHeader, FeatureCard } from '@/components/landing-ui';
import { Users, Calendar, CreditCard } from 'lucide-react';

<Section background="mist">
  <SectionHeader
    badge="Features"
    title="Everything You Need"
    centered
  />
  
  <div className="grid gap-6 md:grid-cols-3">
    <FeatureCard
      icon={<Users className="h-6 w-6" />}
      title="Clients"
      description="Manage all your clients"
      iconColor="#2563EB"
    />
    <FeatureCard
      icon={<Calendar className="h-6 w-6" />}
      title="Planning"
      description="Schedule and organize"
      iconColor="#7C5CFF"
    />
    <FeatureCard
      icon={<CreditCard className="h-6 w-6" />}
      title="Payments"
      description="Track payments easily"
      iconColor="#22D3EE"
    />
  </div>
</Section>
```

**Result:**
- ✅ Consistent spacing
- ✅ Standardized colors from brand palette
- ✅ Reusable components
- ✅ Easier to maintain
- ✅ Responsive by default

---

## 🚀 Implementation Steps

### Step 1: Update Imports (5 minutes)
Add to the top of `index.tsx`:
```tsx
import { 
  Button, 
  FeatureCard, 
  Section, 
  SectionHeader,
  TestimonialCard,
  StatCard 
} from '@/components/landing-ui';
```

### Step 2: Replace Hero Buttons (5 minutes)
Find all hero CTAs and replace with:
```tsx
<Button variant="primary" size="lg" onClick={() => scrollToId("contact")}>
  <span>Réserver une démo</span>
  <ArrowRight className="h-4 w-4" />
</Button>
```

### Step 3: Replace Feature Cards (15 minutes)
Convert all feature card divs to `<FeatureCard>` components.

### Step 4: Update Section Backgrounds (10 minutes)
Wrap sections in `<Section>` component with appropriate `background` prop.

### Step 5: Standardize All Cards (15 minutes)
Add `landing-card` class or use component equivalents.

### Step 6: Test Responsiveness (10 minutes)
Check on mobile, tablet, and desktop.

**Total Time: ~1 hour**

---

## 📝 Color Palette Reference

### Brand Colors (Already in CSS Variables)
```css
--essor-blue: #2563EB        /* Primary brand color */
--essor-blue-dk: #1E40AF     /* Darker blue */
--essor-blue-lt: #60A5FA     /* Lighter blue */
--essor-coral: #FF6B4A       /* Accent color */
--essor-ink: #0B1220         /* Primary text */
--essor-lavender: #7C5CFF    /* Secondary accent */
--essor-sky: #22D3EE         /* Tertiary accent */
--essor-mist: #F3F5F9        /* Light background */
```

### Usage in Components
```tsx
// Direct CSS variable
<div style={{ color: 'var(--essor-blue)' }}>

// Tailwind class
<div className="text-brand">

// Design token
import { designTokens } from '@/lib/design-tokens';
<div style={{ color: designTokens.colors.brand.blue }}>
```

---

## ✨ Benefits of This Approach

1. **Consistency** - All components use the same design tokens
2. **Maintainability** - Change once, update everywhere
3. **Performance** - Reusable components = smaller bundle
4. **Accessibility** - Proper semantic HTML & ARIA labels
5. **Responsive** - Mobile-first design built-in
6. **Brand Compliance** - 100% aligned with brand book

---

## 🐛 Troubleshooting

### Issue: Components not rendering
**Solution:** Ensure imports are correct:
```tsx
import { Button } from '@/components/landing-ui';
```

### Issue: Styles not applying
**Solution:** Check Tailwind is processing the file:
```js
// tailwind.config.js
content: ['./src/**/*.{ts,tsx}']
```

### Issue: Colors look different
**Solution:** Clear build cache:
```bash
rm -rf .next && npm run dev
```

---

## 📦 Next Steps

1. **Apply to Landing Page** - Systematically update each section
2. **Test on Devices** - Mobile, tablet, desktop
3. **Run Lighthouse** - Check performance score
4. **Convert to WebP** - Run `optimize-assets.js` script
5. **A/B Test** - Compare conversion rates

---

**Ready to implement?** Start with the hero section and work your way down. Each section should take 5-10 minutes to update.
