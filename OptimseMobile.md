# SwasthyoKor Mobile UI Optimization Guide (`OptimseMobile.md`)

This guide defines the exact rules, responsive patterns, and spacing conventions to give UI components **comfortable breathing space** on mobile screens (320px–390px viewports) across the SwasthyoKor application.

---

## 🎯 The Core Problem Solved

On small mobile viewports, components can feel squeezed, congested, and constricted ("over-padded"):
1. **Compounded Paddings**: When an outer container has `px-4` (16px) and an inner Card has `px-6` (24px), a total of **80px** of horizontal space is lost before content even renders. On a 360px device, that leaves only 280px for forms and text.
2. **shadcn Card Defaults**: Default `Card` uses `py-(--card-spacing)` and `gap-(--card-spacing)` with `--card-spacing: 24px`. This introduces massive empty vertical bands.
3. **Oversized Thumbnails & Steppers**: A fixed 64px image next to buttons forces text to wrap into cramped multiple lines.
4. **Overly Long Button Text**: Long text like `(অনলাইন গেটওয়ে)` pushes buttons into awkward heights or truncation on mobile.

---

## 📐 Universal Responsive Spacing Tokens

| Element | Mobile (< 640px) | Desktop (sm / lg) |
| :--- | :--- | :--- |
| **Page Outer Wrapper** | `py-5 px-3` | `sm:py-8 sm:px-6 lg:px-8` |
| **Page Minimal Header** | `pb-4 mb-5` | `sm:pb-6 sm:mb-8` |
| **Section Grid Gap** | `gap-4` or `gap-5` | `sm:gap-6 lg:gap-8` |
| **Card Header Padding** | `p-4 pb-2.5 sm:pb-3` | `sm:p-6 sm:pb-4` |
| **Card Content Padding** | `p-3.5 pt-2 sm:pt-3` | `sm:p-6 sm:pt-4` |
| **Card Footer Padding** | `p-3.5 pt-2 pb-4` | `sm:p-6 sm:pt-3 sm:pb-6` |
| **Nested Banner / Box** | `p-2.5 sm:p-3` | `sm:p-3.5` |
| **Input Fields** | `h-10 text-sm px-3 rounded-lg` | `sm:h-11 sm:rounded-xl` |
| **Primary Action Button** | `h-11 text-sm rounded-lg` | `sm:h-12 sm:text-base sm:rounded-xl` |
| **Item Thumbnail** | `size-14 rounded-xl` | `sm:size-16` |
| **Drawer / Sheet Padding**| `p-3.5` | `sm:p-6` |

---

## 🧩 Component Implementation Patterns

### 1. shadcn Card Pattern (Eliminating Ghost Spacing)

**Rule:** Always add `py-0 gap-0` to `<Card>` and apply responsive padding explicitly to `<CardHeader>`, `<CardContent>`, and `<CardFooter>`.

```tsx
// ❌ BAD: Default shadcn Card wastes 48px vertical + 48px horizontal space on mobile
<Card className="border-border bg-card rounded-2xl shadow-xs">
  <CardHeader className="pb-4">
    <CardTitle>ডেলিভারির ঠিকানা ও তথ্য</CardTitle>
  </CardHeader>
  <CardContent>
    <Form />
  </CardContent>
</Card>

// ✅ GOOD: Controlled, breathable responsive padding
<Card className="border-border/80 bg-card rounded-xl sm:rounded-2xl shadow-xs py-0 gap-0">
  <CardHeader className="p-4 sm:p-6 pb-2.5 sm:pb-4 border-b border-border/50">
    <CardTitle className="text-base sm:text-lg font-bold text-foreground">
      ডেলিভারির ঠিকানা ও তথ্য
    </CardTitle>
  </CardHeader>
  <CardContent className="p-3.5 sm:p-6 pt-3 sm:pt-4">
    <Form />
  </CardContent>
</Card>
```

---

### 2. Form & Inputs Pattern

**Rule:** Keep form gaps to `space-y-3 sm:space-y-4`. Field labels should be `text-xs sm:text-sm font-semibold`. Inputs should be `h-10 text-sm px-3`.

```tsx
// ✅ Recommended Form Structure
<form action={submitAction} className="space-y-3 sm:space-y-4">
  <div className="space-y-1">
    <Label htmlFor="name" className="text-xs sm:text-sm font-semibold text-foreground/90">
      আপনার পুরো নাম
    </Label>
    <Input
      id="name"
      name="name"
      required
      placeholder="যেমন: মোঃ সাকিব হাসান"
      className="rounded-lg sm:rounded-xl h-10 text-sm px-3 bg-background"
    />
  </div>

  <div className="space-y-1">
    <Label htmlFor="phone" className="text-xs sm:text-sm font-semibold text-foreground/90">
      মোবাইল নম্বর
    </Label>
    <Input
      id="phone"
      name="phone"
      type="tel"
      required
      placeholder="যেমন: 017XXXXXXXX"
      className="rounded-lg sm:rounded-xl h-10 text-sm px-3 bg-background"
    />
  </div>
</form>
```

---

### 3. Nested Info / Payment / Coupon Banners

**Rule:** Nested boxes inside a form or card must not have `p-4` or `p-6`. Use `p-2.5 sm:p-3.5` with rounded-lg/xl borders.

```tsx
// ✅ Compact Nested Box for Mobile
<div className="rounded-lg sm:rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2.5 sm:p-3 space-y-1">
  <div className="flex items-center justify-between gap-1.5 flex-wrap">
    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
      পেমেন্ট পদ্ধতি: ১০০% অনলাইন
    </span>
    <span className="text-[10px] sm:text-[11px] font-semibold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
      অগ্রিম পরিশোধ
    </span>
  </div>
  <p className="text-[11px] sm:text-xs text-muted-foreground leading-normal">
    বিকাশ, নগদ, রকেট অথবা কার্ডের মাধ্যমে সম্পূর্ণ মূল্য পরিশোধ করুন।
  </p>
</div>
```

---

### 4. Slide-Over Drawers / Cart Modals (`SheetContent`)

**Rule:** Set `SheetContent` padding to `p-3.5 sm:p-6` so the cart list, thumbnails, quantities, and totals fit comfortably without overflowing.

```tsx
// ✅ Responsive Drawer
<SheetContent
  side="right"
  showCloseButton={false}
  className="flex h-full w-full max-w-md flex-col justify-between bg-white/95 p-3.5 sm:p-6 text-black backdrop-blur-xl dark:bg-neutral-950/95 dark:text-white"
>
  {/* Header */}
  <div className="flex items-center justify-between border-b border-border/80 pb-3 sm:pb-4">
    ...
  </div>

  {/* Item Rows */}
  <li className="py-2.5 sm:py-4">
    <div className="flex items-center gap-2.5 sm:gap-3">
      <div className="relative size-14 sm:size-16 shrink-0 rounded-xl overflow-hidden">
        ...
      </div>
    </div>
  </li>

  {/* Footer */}
  <div className="border-t border-border pt-3 sm:pt-4 text-sm">
    ...
  </div>
</SheetContent>
```

---

### 5. Sticky Bottom Bars on Mobile

**Rule:** For mobile fixed action bars, use `px-3 sm:px-4 py-2.5 sm:py-3` with `bg-background/95 backdrop-blur-xl` and ensure child buttons have `h-11` with clear, punchy copy.

```tsx
// ✅ Mobile Bottom Bar
<div className="fixed bottom-0 inset-x-0 z-30 lg:hidden">
  <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
    <div className="flex items-center gap-2">
      <Button size="lg" className="flex-1 rounded-lg sm:rounded-xl h-11 text-xs sm:text-sm font-bold">
        সরাসরি অর্ডার — ৳{totalPrice.toLocaleString("bn-BD")}
      </Button>
    </div>
  </div>
</div>
```

---

## 📋 AI Agent Instructions for Editing Other Pages

When asked to optimize another page or component for mobile:
1. **Identify the outer containers**: Ensure no static `px-6` or `py-8` is used on mobile; switch to `px-3 sm:px-6` and `py-5 sm:py-8`.
2. **Inspect all `<Card>` instances**:
   - Add `py-0 gap-0` to the `<Card className="...">`.
   - Update `<CardHeader>` to `p-4 sm:p-6 pb-2.5 sm:pb-4 border-b border-border/50`.
   - Update `<CardContent>` to `p-3.5 sm:p-6 pt-3 sm:pt-4`.
   - Update `<CardFooter>` to `p-3.5 sm:p-6 pt-2 pb-4 sm:pb-6`.
3. **Tune Form elements**: Ensure inputs are `h-10 text-sm px-3 rounded-lg sm:rounded-xl` and nested boxes use `p-2.5 sm:p-3.5`.
4. **Avoid Text Overflow**: Keep button labels short and concise (e.g. `পেমেন্ট করুন — ৳৩২০` instead of adding long descriptive tags).
5. **Verify with Biome and TypeScript**:
   ```bash
   bunx @biomejs/biome check --write --unsafe
   bunx tsc --noEmit
   ```
6. **Build verification**:
   ```bash
   bun run build
   ```
