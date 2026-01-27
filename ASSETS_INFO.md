# Assets Required

The following image assets need to be created and placed in the `assets/` directory:

## Required Files

1. **icon.png** (1024x1024px)
   - App icon for both iOS and Android
   - Should feature the Airnote logo/branding
   - Background: Use theme color #C9E7E4 or #86CAC3

2. **adaptive-icon.png** (1024x1024px, Android only)
   - Foreground image for Android adaptive icon
   - Should be the logo/icon part only (background will be #C9E7E4)

3. **splash.png** (1284x2778px or similar)
   - Splash screen shown while app loads
   - Background: #FBFAFB (matches app background)
   - Centered Airnote logo

4. **favicon.png** (48x48px)
   - Web favicon for PWA/web version
   - Simple version of the logo

## Creating Placeholder Assets

If you need to test the app immediately without proper assets, you can create simple placeholder images:

### Using ImageMagick (if installed):

```bash
# Create assets directory
mkdir -p assets

# Create icon (1024x1024)
convert -size 1024x1024 xc:"#86CAC3" assets/icon.png

# Create adaptive icon (1024x1024)
convert -size 1024x1024 xc:"#86CAC3" assets/adaptive-icon.png

# Create splash (1284x2778)
convert -size 1284x2778 xc:"#FBFAFB" assets/splash.png

# Create favicon (48x48)
convert -size 48x48 xc:"#86CAC3" assets/favicon.png
```

### Manual Creation:

1. Use any image editor (Photoshop, Figma, Sketch, or online tools)
2. Create images with the dimensions above
3. Use the app's color palette for consistency
4. Save as PNG with the exact filenames listed above
5. Place in the `assets/` directory

## Note

The app will still run without these assets, but Expo will show warnings. For production, you should create proper branded assets based on the logo provided in the workspace.
