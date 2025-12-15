# TimeTracking Mobile App

React Native mobile application for time tracking using Expo.

## Voraussetzungen

- Node.js (v18 oder höher)
- npm oder yarn
- Expo CLI
- iOS Simulator (für iOS Entwicklung) oder Android Emulator (für Android Entwicklung)
- Oder die Expo Go App auf Ihrem Smartphone

## Installation

1. Navigieren Sie zum mobile Ordner:
```bash
cd mobile
```

2. Installieren Sie die Abhängigkeiten:
```bash
npm install
```

3. Konfigurieren Sie die Backend-URL:
Öffnen Sie `src/services/api.js` und ändern Sie die `API_URL` zu Ihrer Backend-URL:
```javascript
const API_URL = 'http://your-server-ip:3000';
```

**Hinweis:** 
- Für iOS Simulator: `http://localhost:3000` funktioniert
- Für Android Emulator: verwenden Sie `http://10.0.2.2:3000`
- Für echte Geräte: verwenden Sie die IP-Adresse Ihres Computers im lokalen Netzwerk (z.B., `http://192.168.1.100:3000`)

## App starten

### Entwicklungsmodus

```bash
npm start
```

Dies öffnet Expo Dev Tools in Ihrem Browser. Von dort können Sie:
- Die App auf dem iOS Simulator öffnen (drücken Sie `i`)
- Die App auf dem Android Emulator öffnen (drücken Sie `a`)
- Einen QR-Code scannen mit der Expo Go App auf Ihrem Smartphone

### Direkt auf iOS starten

```bash
npm run ios
```

### Direkt auf Android starten

```bash
npm run android
```

## Features

- ✅ Benutzer-Registrierung und Login
- ✅ Aufgaben mit Zeiterfassung erstellen
- ✅ Kundenname für jede Aufgabe
- ✅ Beschreibung hinzufügen
- ✅ Alle Einträge anzeigen
- ✅ ToDo-Listen verwalten
- ✅ Feierabend-Funktion (zeigt alle heutigen Aufgaben)
- ✅ Geteilte MySQL Datenbank mit der Web-Anwendung

## Projektstruktur

```
mobile/
├── App.js                      # Haupt-App mit Navigation
├── app.json                    # Expo Konfiguration
├── package.json                # Dependencies
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js      # Login Bildschirm
│   │   ├── RegisterScreen.js   # Registrierungs Bildschirm
│   │   ├── DashboardScreen.js  # Dashboard mit Aufgaben erstellen
│   │   ├── AllEntriesScreen.js # Alle Einträge anzeigen
│   │   └── TodoScreen.js       # ToDo-Listen Verwaltung
│   ├── services/
│   │   └── api.js              # API Service für Backend-Kommunikation
│   └── utils/
│       └── AuthContext.js      # Authentifizierungs Context
└── assets/                     # App Icons und Splash Screen

```

## Build für Produktion

### iOS

```bash
expo build:ios
```

### Android

```bash
expo build:android
```

Oder verwenden Sie EAS Build für moderne Builds:

```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

## Troubleshooting

### "Network request failed"
- Stellen Sie sicher, dass das Backend läuft
- Überprüfen Sie die API_URL in `src/services/api.js`
- Stellen Sie sicher, dass Ihr Gerät/Emulator das Backend erreichen kann

### "Unable to connect to development server"
- Stellen Sie sicher, dass Sie im gleichen Netzwerk sind (bei echten Geräten)
- Versuchen Sie, den Expo Server neu zu starten

## Weitere Informationen

- [Expo Dokumentation](https://docs.expo.dev/)
- [React Native Dokumentation](https://reactnative.dev/)
- [React Navigation Dokumentation](https://reactnavigation.org/)
