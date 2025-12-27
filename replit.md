# Kniha Rekordů (Swimming Records Book)

## Overview

Kniha Rekordů is a React Native/Expo mobile application for tracking swimming pool records. The app reads swimming workout data (designed for Apple HealthKit integration) and creates a "Book of Records" for various swimming distances (50m-600m) organized by stroke style (freestyle, backstroke, breaststroke, butterfly, medley, unknown). 

The app focuses on 50-meter pool swimming and calculates records based on contiguous lap boundaries. It displays best times, allows users to view record history grouped by day, and provides detailed segment/lap breakdowns.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript with strict mode enabled
- **Navigation**: React Navigation with native stack navigator (stack-only navigation pattern)
- **State Management**: TanStack React Query for server state, React's useState for local state
- **Animations**: React Native Reanimated for smooth micro-interactions
- **UI Approach**: Custom themed components (ThemedText, ThemedView, Card, Button) with iOS-style design patterns
- **Styling**: StyleSheet API with centralized theme constants (colors, spacing, typography, border radius)

### Project Structure
```
client/           # React Native app code
├── components/   # Reusable UI components
├── screens/      # Screen components
├── navigation/   # Navigation configuration
├── hooks/        # Custom React hooks
├── lib/          # Utilities, types, storage, mock data
├── constants/    # Theme and design tokens
server/           # Express backend
shared/           # Shared types and schema (Drizzle)
```

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Purpose**: API server for potential data sync (currently minimal implementation)
- **Database**: PostgreSQL via Drizzle ORM (schema defined but using in-memory storage currently)
- **Build Tool**: esbuild for server bundling, tsx for development

### Data Storage
- **Primary Storage**: AsyncStorage for local persistence on device
- **Mock Data**: Generated mock swimming data for development/demo purposes
- **Data Model**: Workouts → Segments → Laps hierarchy with Records calculated from segments
- **Database Schema**: Users table defined in Drizzle (for future auth if needed)

### Key Design Decisions

1. **No Authentication**: Single-user utility app design - data is local to device
2. **Stack Navigation Only**: No tabs, modal settings access via header button
3. **Contiguous Lap Boundaries**: Records calculated only from exact 50m lap boundaries (critical business rule)
4. **Stroke-Based Organization**: Main screen organized by stroke style sections
5. **Dark/Light Mode**: Automatic theme switching based on system preference
6. **Haptic Feedback**: Used throughout for better user experience on supported devices

### Swimming Domain Logic
- Distances tracked: 50, 100, 200, 300, 400, 500, 600 meters
- Stroke styles: Freestyle (Kraul), Backstroke (Znak), Breaststroke (Prsa), Butterfly (Motýl), Medley (Mix), Unknown (Neznámý)
- Pool length: 50 meters only
- Records are best times per distance/stroke combination

## External Dependencies

### Core Libraries
- **Expo**: ~54.0.23 - React Native development platform
- **React Navigation**: ^7.x - Navigation framework
- **TanStack React Query**: ^5.90.7 - Server state management
- **React Native Reanimated**: ~4.1.1 - Animation library
- **React Native Gesture Handler**: ~2.28.0 - Touch handling

### Storage & Data
- **AsyncStorage**: ^2.2.0 - Local key-value storage
- **Drizzle ORM**: ^0.39.3 - TypeScript ORM (PostgreSQL)
- **Zod**: ^3.24.2 - Schema validation

### UI/UX
- **Expo Vector Icons**: ^15.0.2 - Icon library (Feather icons used)
- **Expo Haptics**: ~15.0.7 - Haptic feedback
- **Expo Image**: ~3.0.10 - Optimized image component
- **Expo Blur/Glass Effect**: Visual effects

### Backend
- **Express**: ^4.21.2 - HTTP server
- **pg**: ^8.16.3 - PostgreSQL driver

### Development
- **TypeScript**: Strict mode enabled
- **ESLint**: Expo config with Prettier integration
- **Babel**: Module resolver for path aliases (@/, @shared/)

## HealthKit Integration (Future)

The app is prepared for Apple HealthKit integration but requires a native build to access HealthKit data. Currently uses mock data in Expo Go.

### Requirements for HealthKit
1. **Apple Developer Account** ($99/year) - Required for native iOS builds
2. **Development Build via EAS** - Cannot use Expo Go for HealthKit
3. **HealthKit Entitlements** - Must be configured in app.json

### Implementation Status
- `client/lib/healthkit.ts` - HealthKit service module with:
  - Status detection (available/authorized)
  - Stroke type mapping (HKSwimmingStrokeStyle)
  - Contiguous lap boundary calculations
  - Native build instructions

### To Enable HealthKit
1. Register for Apple Developer Program
2. Add entitlements to app.json:
   ```json
   {
     "expo": {
       "ios": {
         "entitlements": {
           "com.apple.developer.healthkit": true
         },
         "infoPlist": {
           "NSHealthShareUsageDescription": "Kniha rekordů potřebuje přístup k vašim plaveckým datům."
         }
       }
     }
   }
   ```
3. Install react-native-health: `npx expo install react-native-health`
4. Build with EAS: `npx eas build --profile development --platform ios`
5. Implement fetchSwimmingWorkouts() in healthkit.ts