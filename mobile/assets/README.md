# Assets Folder

This folder contains the app icons and splash screens for the mobile application.

## Required Assets

Replace the following placeholder files with your actual app assets:

### Icons
- `icon.png` - App icon (1024x1024 px)
- `adaptive-icon.png` - Android adaptive icon (1024x1024 px)
- `favicon.png` - Web favicon (48x48 px or larger)

### Splash Screen
- `splash.png` - Splash screen image (recommended: 1284x2778 px for iPhone 13 Pro Max)

## Generating Icons

You can use the following tools to generate icons from a single source image:

1. **App Icon Generator**: https://www.appicon.co/
2. **Expo Asset Generator**: https://github.com/byCedric/eas-asset-generator
3. **Icon Kitchen**: https://icon.kitchen/

## Icon Guidelines

### iOS
- Icon should be 1024x1024 px
- No transparency
- No rounded corners (iOS adds them automatically)

### Android
- Adaptive icon should be 1024x1024 px
- Include foreground and background layers
- Follow Material Design guidelines

### General
- Use simple, recognizable designs
- Test on different backgrounds
- Ensure text is readable at small sizes
