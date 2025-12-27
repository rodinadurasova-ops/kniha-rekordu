# Design Guidelines: Swimming Records Book (iOS)

## Architecture Decisions

### Authentication
**No authentication required.** This is a single-user utility app with local data from HealthKit.

**Profile/Settings Screen Required:**
- User-customizable avatar (generate 3 swimmer-themed preset avatars: goggles icon, swim cap silhouette, pool waves)
- Display name field (default: "Swimmer")
- App preferences:
  - Preferred units (meters only for this version)
  - Show/hide Unknown style records
  - Dark/Light mode toggle

### Navigation
**Stack-Only Navigation** with persistent Settings access.

**Navigation Structure:**
- Root: Records Book (main screen)
- Modal: Settings (gear icon in top-right header)
- Stack: Record Detail → Segment Detail → Edit Style

**Screen Flow:**
1. Launch → HealthKit Permission (first time)
2. Records Book (main)
3. Tap record → Record History
4. Tap day/segment → Segment Detail
5. Edit Style → Save/Cancel returns to previous

## Screen Specifications

### 1. HealthKit Permission Screen
**Purpose:** Request read access to pool swimming workouts.

**Layout:**
- **Header:** None (full-screen modal)
- **Content:** Centered vertically
  - App icon (swim-themed)
  - Title: "Přístup ke zdravotním datům"
  - Body text explaining what data is needed
  - Privacy note
  - Primary CTA button: "Povolit přístup"
- **Safe Area:** Top: insets.top + Spacing.xl, Bottom: insets.bottom + Spacing.xl

**Components:**
- Custom illustration (swimmer silhouette + Apple Health icon)
- Large title text
- Body text (secondary color)
- Primary button (full-width, rounded)

### 2. Records Book (Main Screen)
**Purpose:** Display all swimming records organized by stroke style.

**Layout:**
- **Header:** Custom transparent header
  - Title: "Kniha rekordů"
  - Right button: Settings gear icon
  - Right button (secondary): Refresh icon (recalculate)
- **Content:** Scrollable grouped list
  - Safe area: Top: headerHeight + Spacing.xl, Bottom: insets.bottom + Spacing.xl
- **Empty State:** "Žádné rekordy" with illustration + "Synchronizovat data" button

**Section Organization (6 sections):**
1. 🔵 Kraul (Freestyle) - Blue theme
2. 🟢 Znak (Backstroke) - Green theme
3. 🔴 Prsa (Breaststroke) - Red theme
4. 🟡 Motýl (Butterfly) - Yellow theme
5. 🟣 Mix (Medley) - Purple theme
6. ⚪ Neznámý (Unknown) - Gray theme (hideable via settings)

**Row Design for each distance (50–600m):**
- Left: Distance + Style label (e.g., "Kraul 200 m")
- Center: Best time (large, bold, monospaced font)
- Right: Date (small, secondary color) + chevron
- Subtle card elevation with section-themed accent color on left edge
- Tap feedback: slight scale + opacity

### 3. Record History Screen
**Purpose:** Show all attempts for a specific distance/style, grouped by day.

**Layout:**
- **Header:** Default navigation with back button
  - Title: "{Style} {Distance}m"
  - Background: Section theme color (subtle gradient)
- **Content:** Scrollable list grouped by date
  - Safe area: Top: Spacing.xl, Bottom: insets.bottom + Spacing.xl
- **Empty State:** "Žádné záznamy pro tuto vzdálenost"

**Day Group Design:**
- Date header (bold, sticky)
- Best time badge (gold medal icon for personal best of day)
- Expandable: Tap to show all attempts for that day
- Each attempt row:
  - Time (monospaced)
  - Timestamp (small)
  - Tap → Segment Detail

### 4. Segment Detail Screen
**Purpose:** Display detailed information about a specific swimming segment.

**Layout:**
- **Header:** Default navigation
  - Title: Date + Time
  - Right button: "Upravit styl" (Edit Style)
- **Content:** Scrollable card-based layout
  - Safe area: Top: Spacing.xl, Bottom: insets.bottom + Spacing.xl

**Information Cards:**
1. **Performance Card** (large, featured):
   - Distance + Style
   - Time (hero size, monospaced)
   - Pace per 50m (secondary metric)
2. **Workout Context Card**:
   - Workout date/time
   - Total workout duration
   - Total distance
   - Pool type (50m badge)
3. **Lap Breakdown Card** (collapsible):
   - Table of individual 50m laps with times
   - Color-coded by style consistency

### 5. Edit Style Modal
**Purpose:** Change stroke style classification for a segment.

**Layout:**
- **Header:** Modal with Cancel (left) and Save (right, primary color)
- **Content:** Form with radio buttons
  - Safe area: Top: Spacing.xl, Bottom: insets.bottom + Spacing.xl

**Form Elements:**
- Radio button list for styles:
  - Kraul, Znak, Prsa, Motýl, Mix, Neznámý
  - Each with icon + color accent
- Warning text: "Změní všechny rekordy pro tento úsek"
- Primary CTA: Save button (enabled when selection changes)

### 6. Settings Screen
**Purpose:** Configure app preferences and user profile.

**Layout:**
- **Header:** Modal with Done button (right)
- **Content:** Scrollable grouped form
  - Safe area: Top: Spacing.xl, Bottom: insets.bottom + Spacing.xl

**Settings Groups:**
1. **Profile**:
   - Avatar picker (3 preset options)
   - Name text field
2. **Display**:
   - Theme toggle (Light/Dark/System)
   - Show Unknown Records (toggle)
3. **Data**:
   - Last sync timestamp
   - Recalculate Records button (destructive style)
4. **About**:
   - Version number
   - HealthKit status indicator

## Design System

### Color Palette
**Stroke Style Theme Colors:**
- Freestyle (Kraul): `#007AFF` (iOS Blue)
- Backstroke (Znak): `#34C759` (iOS Green)
- Breaststroke (Prsa): `#FF3B30` (iOS Red)
- Butterfly (Motýl): `#FFCC00` (iOS Yellow)
- Medley (Mix): `#AF52DE` (iOS Purple)
- Unknown (Neznámý): `#8E8E93` (iOS Gray)

**UI Colors:**
- Background: System background (adaptive)
- Card background: Secondary system background
- Primary text: Label (adaptive)
- Secondary text: Secondary label
- Accent: iOS Blue `#007AFF`

### Typography
- **Hero Numbers (times):** SF Mono, 36pt, Bold
- **Large Title:** SF Pro, 34pt, Bold
- **Title:** SF Pro, 22pt, Semibold
- **Body:** SF Pro, 17pt, Regular
- **Caption:** SF Pro, 13pt, Regular
- **Monospaced times:** SF Mono for consistency

### Spacing Scale
- xs: 4pt
- sm: 8pt
- md: 16pt
- lg: 24pt
- xl: 32pt

### Visual Feedback
- **Touchable rows:** Scale to 0.97 + opacity 0.7 on press
- **Buttons:** Opacity 0.6 on press
- **Cards:** No shadow (use borders/backgrounds for depth)
- **Section headers:** Subtle left accent bar (4pt width) in theme color

### Icons
- Use SF Symbols exclusively (native iOS icons)
- Navigation: chevron.right, gear, arrow.clockwise
- Styles: Add subtle swimming-related SF Symbols where appropriate
- Sizes: 20pt for navigation, 24pt for featured actions

## Accessibility Requirements
- **VoiceOver:** Label all interactive elements with descriptive text
- **Dynamic Type:** Support all text size categories
- **Color Contrast:** WCAG AA minimum for all text
- **Tap Targets:** Minimum 44×44pt for all interactive elements
- **Reduce Motion:** Respect system setting (disable scale animations)
- **Time formatting:** Use localized date/time formats
- **Numbers:** Right-to-left friendly layouts (monospaced alignment)

## Critical Assets
**Generate 3 swimmer avatar presets:**
1. Minimalist swimmer silhouette (side profile)
2. Swimming goggles icon (front view)
3. Abstract wave/pool pattern

**App Icon:** Should feature swimming-related imagery with strong iOS design language (gradient, rounded square, no text).