# Airnote

A location-based ephemeral notes app built with React Native and Expo.

## Features

- **Location-based notes**: Create and discover notes near your current location
- **Ephemeral content**: Notes expire after a set duration (15m, 30m, 1h, 4h, 24h)
- **Proximity filtering**: Notes only appear within their defined radius (10m, 25m, 50m, 100m)
- **Clean iOS-inspired UI**: Minimal, airy design with custom color palette
- **Real-time updates**: Feed automatically updates to show current distances and time remaining

## Setup

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on your device:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your physical device

### Location Permissions

The app requires location permissions to function:
- **iOS**: Permission will be requested on first launch
- **Android**: Location permissions are declared in app.json

## Project Structure

```
airnote/
├── src/
│   ├── components/        # React components
│   │   ├── Header.tsx
│   │   ├── LocationChip.tsx
│   │   ├── NoteCard.tsx
│   │   ├── FloatingActionButton.tsx
│   │   └── CreateNoteModal.tsx
│   ├── hooks/             # Custom React hooks
│   │   └── useLocation.ts
│   ├── services/          # Business logic
│   │   └── notesService.ts
│   ├── theme/             # Design tokens
│   │   └── colors.ts
│   ├── types/             # TypeScript types
│   │   └── note.ts
│   └── utils/             # Helper functions
│       └── location.ts
├── App.tsx                # Main app component
├── app.json              # Expo configuration
└── package.json
```

## Architecture

### Data Layer

The app currently uses an in-memory mock service (`notesService.ts`) for storing notes. This abstraction makes it easy to replace with a real backend (e.g., Supabase) later:

```typescript
// Current: In-memory storage
notesService.createNote(...)
notesService.getNearbyNotes(...)

// Future: Replace with API calls
// await api.createNote(...)
// await api.getNearbyNotes(...)
```

### Key Components

- **Header**: App title and notification bell icon placeholder
- **LocationChip**: Shows current location with reverse geocoding
- **NoteCard**: Displays individual notes with distance and time remaining
- **FloatingActionButton**: Primary action for creating new notes
- **CreateNoteModal**: Bottom sheet for composing notes

### Location Service

- Uses `expo-location` for accessing device location
- Requests permissions on launch
- Reverse geocodes coordinates to show neighborhood/city name
- Calculates distances using Haversine formula

### Note Filtering

Notes are filtered by:
1. **Distance**: User must be within the note's defined radius
2. **Expiration**: Notes past their expiration time are automatically purged

## Color Palette

```
#FBFAFB - Background
#C9E7E4 - Primary Light (location chip)
#86CAC3 - Primary
#77BEB7 - Primary Medium
#74B7B1 - Primary Dark (buttons, accents)
```

## Future Enhancements

- Photo attachments
- Backend integration (Supabase)
- User authentication
- Note reactions/interactions
- Push notifications
- Map view
- Note categories/tags

## Tech Stack

- **React Native**: UI framework
- **Expo SDK 52**: Development platform
- **TypeScript**: Type safety
- **expo-location**: Location services
- **react-native-safe-area-context**: Safe area handling

## License

MIT
