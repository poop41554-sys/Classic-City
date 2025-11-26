# Design Guidelines: MTA:SA Gaming Shop Platform

## Design Approach

**Reference-Based Approach**: Drawing inspiration from gaming platforms (Steam, Epic Games, Discord) and GTA:SA's urban/street aesthetic. This is a gaming e-commerce platform requiring strong visual identity and immersive experience.

**Key Design Principles**:
- Bold, energetic gaming aesthetic with urban edge
- Dark-dominant theme reflecting gaming platforms
- Clear hierarchy for coin economy and shop items
- Arabic RTL support throughout
- Security-first (minimal exposed functionality)

---

## Typography

**Arabic Font Stack**:
- Headings: 'Cairo', sans-serif (bold, 700-900 weight)
- Body: 'Tajawal', sans-serif (regular 400, medium 500)
- Accents/Numbers: 'Roboto Mono' for coins/stats

**Hierarchy**:
- Hero/Section Titles: text-4xl to text-6xl, font-bold
- Product Names: text-2xl, font-semibold
- Descriptions: text-base to text-lg
- UI Labels: text-sm, font-medium
- Coin Values: text-xl to text-3xl, font-mono

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-20
- Card gaps: gap-6 to gap-8
- Button padding: px-6 py-3

**Grid Structure**:
- Shop items: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Features: grid-cols-1 lg:grid-cols-2
- Max container: max-w-7xl mx-auto

---

## Core Sections & Components

### 1. Navigation Bar (Top, RTL)
- Logo (right side, gaming-style emblem)
- Discord avatar + username (left side, circular avatar)
- Coin balance (prominent, icon + number)
- Navigation: الرئيسية | السيارات | المميزات | الأونرات | لوحة التحكم
- Sticky positioning

### 2. Hero Section (No Large Hero Image)
- Bold Arabic headline: "متجر [اسم السيرفر]"
- Subheading with server stats
- Dual CTA buttons: "تسجيل بالكود" + "تسجيل بالديسكورد"
- Animated coin counter or server player count
- Background: Subtle geometric pattern or gradient

### 3. Shop Sections (3 Main Categories)

**Category Headers**:
- Icon + Arabic title (السيارات / المميزات / الأونرات)
- Filter/sort controls

**Product Cards** (per category):
- Product image (vehicle/feature icon)
- Arabic name
- Description (2-3 lines)
- Coin price (large, bold, with coin icon)
- "شراء" button (disabled if insufficient coins)
- Hover effect: subtle scale + glow
- Grid layout: 3 columns desktop, 2 tablet, 1 mobile

### 4. User Profile Sidebar (Toggleable)
- Discord avatar (large)
- Username + discriminator
- Coin balance (prominent display)
- Purchase history (scrollable list)
- Logout button

### 5. Admin Panel (Separate Section)
- User search/select
- Coin management: +/- buttons
- Transaction log
- Product management interface
- Dark, dashboard-style layout

### 6. Login Modal
- Two tabs: "كود اللعبة" | "ديسكورد"
- Code input: Large text field, auto-focus
- Discord button: Brand-colored, with icon
- Clean, centered design

---

## Component Library

**Buttons**:
- Primary (Purchase): Bold, coin-gold accent, shadow
- Secondary (Discord): Discord brand color (#5865F2)
- Danger (Admin actions): Red accent
- All buttons: rounded-lg, px-6 py-3, font-medium

**Cards**:
- Product cards: Rounded corners (rounded-xl), shadow-lg
- Stat cards: Glass-morphism effect
- Border: subtle glow on hover

**Inputs**:
- Large, rounded (rounded-lg)
- Arabic placeholder text
- Focus state: border glow
- Monospace for code input

**Icons**:
- Use Font Awesome (via CDN) for coins, vehicles, features
- Discord icon from Font Awesome brands
- Lock icons for security indicators

**Badges**:
- "جديد" (New), "مميز" (Featured), "نفذ" (Sold Out)
- Small, rounded-full, positioned top-right on cards

---

## Images

**Product Images**:
- Vehicle thumbnails: 400x300px, centered
- Feature icons: 200x200px, illustrated style
- Server ownership badges: 300x300px
- All images: rounded corners, shadow

**Placement**:
- Each shop item card has thumbnail
- Category headers have decorative icons
- No large hero background image (pattern instead)

---

## Security UI Elements

- Disable right-click with visual feedback
- No dev tools indicator (subtle overlay when detected)
- Session timeout warning modal
- CSRF token hidden fields (no visual)
- "Secure Connection" badge in footer

---

## RTL Considerations

- All layouts mirror for Arabic (flex-row-reverse)
- Text alignment: text-right for Arabic
- Margins/padding swap: mr becomes ml
- Navigation flows right-to-left
- Number formatting: Arabic-Indic numerals option

---

## Animations (Minimal)

- Coin counter: Smooth increment animation on purchase
- Card hover: Scale 1.02, transition-all duration-200
- Button: Subtle pulse on primary CTA
- Page transitions: Fade only
- No scroll-triggered animations (performance/security)

---

## Accessibility

- High contrast text on dark backgrounds
- Focus indicators on all interactive elements
- Alt text for all product images (Arabic)
- Keyboard navigation support
- Screen reader labels (Arabic ARIA)

---

**Overall Vibe**: Dark, sleek gaming platform with GTA:SA urban energy, gold coin accents, and bold Arabic typography. Security-conscious without looking locked-down. Professional yet exciting for players.