# Kniha Rekordů (Swimming Records Book)

A React Native/Expo mobile application for tracking swimming pool records with Apple HealthKit integration.

## Features

- Track personal swimming records organized by stroke style (Kraul, Znak, Prsa, Motýl, Mix)
- Distance tracking: 50m, 100m, 200m, 300m, 400m, 500m, 600m
- Record history with detailed lap breakdowns
- Apple HealthKit integration for Apple Watch swimming data
- iOS-style liquid glass design with Czech localization

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS device with Expo Go (for testing)

### Installation

```bash
npm install
npm run dev
```

### Testing on iPhone

1. Install Expo Go from the App Store
2. Scan the QR code from the terminal
3. The app will load with mock data

### HealthKit Integration

HealthKit requires a native iOS build with Apple Developer account ($99/year):

1. Register for Apple Developer Program
2. Configure entitlements in app.json
3. Build with EAS: `npx eas build --profile development --platform ios`

See `replit.md` for detailed HealthKit setup instructions.

## Tech Stack

- React Native / Expo SDK 54
- TypeScript
- React Navigation
- TanStack React Query
- AsyncStorage for local persistence

## License

MIT
