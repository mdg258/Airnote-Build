# Quick Setup Guide

## Getting Started

### 1. Install Node.js

If you don't have Node.js installed:
- Download from [nodejs.org](https://nodejs.org/) (LTS version recommended)
- Or use a version manager like [nvm](https://github.com/nvm-sh/nvm)

### 2. Install Dependencies

```bash
cd /Users/creativnativ/Desktop/Airnote-Build
npm install
```

This will install:
- Expo SDK 52
- expo-location
- React Native and all required dependencies

### 3. Create Assets (Optional for now)

See [ASSETS_INFO.md](./ASSETS_INFO.md) for details on creating app icons and splash screens.

For quick testing, you can create simple placeholders:

```bash
mkdir -p assets
# Then create simple colored PNG files as described in ASSETS_INFO.md
```

### 4. Start the Development Server

```bash
npm start
```

This will:
- Start the Metro bundler
- Open Expo DevTools in your browser
- Show a QR code for testing on physical devices

### 5. Run the App

Choose one of these options:

#### Option A: iOS Simulator (Mac only)
```bash
npm run ios
```
Or press `i` in the terminal after running `npm start`

#### Option B: Android Emulator
```bash
npm run android
```
Or press `a` in the terminal after running `npm start`

#### Option C: Physical Device
1. Install **Expo Go** app from App Store or Google Play
2. Scan the QR code shown in terminal/browser
3. App will load on your device

### 6. Testing Location Features

#### On Simulator/Emulator:
- **iOS Simulator**: Features > Location > Custom Location (set coordinates)
- **Android Emulator**: Use the Extended Controls (3 dots) > Location

#### On Physical Device:
- Grant location permissions when prompted
- The app works best outdoors or near windows for accurate GPS

## Troubleshooting

### "expo: command not found"
Install Expo CLI globally:
```bash
npm install -g expo-cli
```

### Location permissions denied
- **iOS**: Settings > Privacy > Location Services > Expo Go
- **Android**: Settings > Apps > Expo Go > Permissions > Location

### Metro bundler issues
Clear cache and restart:
```bash
npx expo start --clear
```

### TypeScript errors
Ensure TypeScript is installed:
```bash
npm install --save-dev typescript
```

## Project Overview

### What's Built

- ✅ Feed screen showing nearby notes
- ✅ Location-based filtering (distance + expiry)
- ✅ Create note modal (duration, radius, text input)
- ✅ Floating action button
- ✅ Location chip with reverse geocoding
- ✅ In-memory mock data service
- ✅ Clean abstraction for future backend integration

### What's Next (Not Yet Built)

- ❌ Photo attachments (UI placeholder exists)
- ❌ Backend/database (currently in-memory only)
- ❌ User authentication
- ❌ Persistent storage
- ❌ Push notifications

### Testing the App

1. **Grant location permission** when prompted
2. **Wait for location** to load (shows in location chip)
3. **Create a note** using the floating action button
4. **Set short duration** (15m or 30m) to test expiry
5. **Set small radius** (10m or 25m) to test distance filtering
6. **Walk around** (or simulate location changes) to see filtering in action

### Mock Data

The app starts with an empty feed. Create some test notes to see the UI in action:
- Try different durations to see time countdown
- Try different radii to test proximity filtering
- Create multiple notes to test the feed layout

## Architecture Notes

The project is structured to make backend integration easy:

```typescript
// Current (in-memory):
notesService.createNote({ text, location, radius, duration })

// Future (with Supabase):
await supabaseClient
  .from('notes')
  .insert({ text, location, radius, duration, user_id })
```

All data access is abstracted through the `notesService`, making it a simple swap to connect to a real backend.

## Development Tips

- **Hot reload**: Changes to code will automatically refresh the app
- **Debugging**: Shake device or Cmd+D (iOS) / Cmd+M (Android) for dev menu
- **Console logs**: Check terminal for console.log output
- **TypeScript**: The project is fully typed for better DX

## Need Help?

Check the main [README.md](./README.md) for more details on:
- Project structure
- Component documentation
- Color palette
- Future enhancements
