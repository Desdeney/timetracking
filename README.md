# Time Tracking App

Eine Full-Stack Zeiterfassungs-Anwendung mit Web-Interface und React Native Mobile App, die eine gemeinsame MySQL-Datenbank verwenden.

## Features

### Web & Mobile
- ✅ Benutzer-Registrierung und Login System
- ✅ Sichere Passwort-Verschlüsselung mit bcrypt
- ✅ Zeiterfassung mit Eingabe von Stunden und Minuten
- ✅ Aufgabenname und Kundenname für jede Aufgabe
- ✅ Automatische Berechnung von Start- und Endzeit (Format: dd.mm.YYYY hh:mm)
- ✅ "Feierabend" Funktion zeigt alle Aufgaben des aktuellen Tages
- ✅ Aufgabenzusammenfassung mit Gesamtarbeitszeit
- ✅ Session-basierte Authentifizierung
- ✅ ToDo-Listen Verwaltung
- ✅ Alle Einträge anzeigen und bearbeiten

### Technologie
- ✅ **Backend:** Node.js + Express
- ✅ **Datenbank:** MySQL (geteilt zwischen Web und Mobile)
- ✅ **Web-Frontend:** EJS Templates
- ✅ **Mobile App:** React Native mit Expo
- ✅ **API:** RESTful API für Mobile-App Integration

## Voraussetzungen

### Backend
- Node.js (v18 oder höher empfohlen)
- npm oder yarn
- MySQL 8.0 oder höher
- Wenn Sie nodenv oder nvm verwenden, spezifiziert die `.node-version` Datei Node.js 22

### Mobile App
- Node.js (v18 oder höher)
- Expo CLI
- iOS Simulator oder Android Emulator (oder Expo Go App auf dem Smartphone)

## Installation

### Backend Setup

1. Repository klonen:
```bash
git clone https://github.com/Desdeney/timetracking.git
cd timetracking
```

2. Dependencies installieren:
```bash
npm install
```

3. MySQL Datenbank einrichten:
```sql
CREATE DATABASE timetracking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'timetracking_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON timetracking_db.* TO 'timetracking_user'@'localhost';
FLUSH PRIVILEGES;
```

4. Umgebungsvariablen konfigurieren:
```bash
cp .env.example .env
```

Bearbeiten Sie `.env` und füllen Sie die Werte aus:
```env
PORT=3000
SESSION_SECRET=your-secure-random-secret-here
DB_HOST=localhost
DB_PORT=3306
DB_USER=timetracking_user
DB_PASSWORD=your_password
DB_NAME=timetracking_db
CORS_ORIGIN=*
```

### Mobile App Setup

1. Zum mobile Ordner wechseln:
```bash
cd mobile
```

2. Dependencies installieren:
```bash
npm install
```

3. Backend-URL konfigurieren in `src/services/api.js`:
```javascript
const API_URL = 'http://localhost:3000'; // Oder Ihre Server-IP
```

## Verwendung

### Backend starten

1. Anwendung starten:
```bash
npm start
```

2. Browser öffnen und navigieren zu:
```
http://localhost:3000
```

3. Neues Konto registrieren oder mit bestehenden Zugangsdaten anmelden

### Mobile App starten

1. Im mobile Ordner:
```bash
npm start
```

2. Wählen Sie eine Option:
   - Drücken Sie `i` für iOS Simulator
   - Drücken Sie `a` für Android Emulator
   - Scannen Sie den QR-Code mit Expo Go App

### Funktionen nutzen

#### Aufgaben erfassen
- Aufgabenname eingeben
- Kundenname eingeben
- Optionale Beschreibung hinzufügen
- Dauer in Stunden und Minuten angeben
- "Aufgabe hinzufügen" klicken

#### Feierabend
- Klicken Sie auf "Feierabend" Button
- Sehen Sie alle heutigen Aufgaben mit:
  - Aufgabennamen und Beschreibungen
  - Dauer in Stunden und Minuten
  - Start- und Endzeiten
  - Gesamtarbeitszeit

#### ToDo-Listen
- Erstellen Sie neue ToDos
- Markieren Sie ToDos als erledigt
- Löschen Sie ToDos

## Projektstruktur

```
timetracking/
├── server.js              # Haupt-Server mit Express Routes und API
├── database.js            # MySQL Datenbank-Konfiguration
├── views/                 # EJS Templates für Web-Interface
│   ├── login.ejs         # Login Seite
│   ├── register.ejs      # Registrierungs Seite
│   ├── dashboard.ejs     # Haupt-Dashboard
│   └── allentries.ejs    # Alle Einträge Seite
├── package.json           # Backend Dependencies
├── .env.example          # Beispiel Umgebungsvariablen
├── DEPLOYMENT.md         # Detaillierte Deployment-Anleitung
└── mobile/               # React Native Mobile App
    ├── App.js           # Haupt-App mit Navigation
    ├── package.json     # Mobile App Dependencies
    ├── app.json         # Expo Konfiguration
    └── src/
        ├── screens/     # App Bildschirme
        ├── services/    # API Services
        └── utils/       # Utilities und Context
```

## Verwendete Technologien

### Backend
- **Express** - Web Framework
- **MySQL2** - MySQL Datenbank-Treiber mit Promise-Unterstützung
- **EJS** - Templating Engine für Web-Interface
- **bcrypt** - Passwort-Hashing
- **express-session** - Session Management
- **cors** - Cross-Origin Resource Sharing für API
- **dotenv** - Umgebungsvariablen Management

### Mobile App
- **React Native** - Mobile App Framework
- **Expo** - Entwicklungs- und Build-Plattform
- **React Navigation** - Navigation Library
- **Axios** - HTTP Client für API-Anfragen
- **AsyncStorage** - Lokaler Speicher

## Screenshots

### Login Page
![Login Page](https://github.com/user-attachments/assets/e7212351-e5a1-4dfc-9af5-93fd5affb52e)

### Dashboard
![Dashboard](https://github.com/user-attachments/assets/d4364095-a9f0-40b7-b3f7-b822e988d287)

### Task Added
![Task Added](https://github.com/user-attachments/assets/61effee5-2e80-40d6-a91d-31d91594ecb9)

### Feierabend - Today's Tasks
![Feierabend Table](https://github.com/user-attachments/assets/686a1e40-4761-492e-bd13-089423cccb64)

## Datenbank-Schema

### Users Tabelle
- `id` - Primary Key (AUTO_INCREMENT)
- `username` - Eindeutiger Benutzername (VARCHAR)
- `password` - Gehashtes Passwort (VARCHAR)
- `created_at` - Zeitstempel (TIMESTAMP)

### Tasks Tabelle
- `id` - Primary Key (AUTO_INCREMENT)
- `user_id` - Foreign Key zu users (INT)
- `task_name` - Name der Aufgabe (VARCHAR)
- `customer_name` - Kundenname (VARCHAR)
- `description` - Aufgabenbeschreibung (TEXT)
- `duration` - Dauer in Minuten (INT)
- `start_time` - Berechnete Startzeit (VARCHAR, Format: dd.mm.YYYY hh:mm)
- `end_time` - Berechnete Endzeit (VARCHAR, Format: dd.mm.YYYY hh:mm)
- `created_at` - Zeitstempel (TIMESTAMP)

### ToDos Tabelle
- `id` - Primary Key (AUTO_INCREMENT)
- `user_id` - Foreign Key zu users (INT)
- `title` - ToDo Titel (VARCHAR)
- `description` - ToDo Beschreibung (TEXT)
- `done` - Erledigt Status (TINYINT, 0 oder 1)
- `created_at` - Zeitstempel (TIMESTAMP)

## API Endpoints

Die folgenden REST API Endpoints sind für die Mobile App verfügbar:

### Authentifizierung
- `POST /register` - Neuen Benutzer registrieren
- `POST /login` - Benutzer anmelden
- `GET /logout` - Benutzer abmelden

### Aufgaben
- `POST /add-task` - Neue Aufgabe erstellen
- `GET /api/all-entries` - Alle Aufgaben abrufen
- `PUT /api/tasks/:id` - Aufgabe aktualisieren
- `GET /feierabend` - Heutige Aufgaben abrufen

### ToDos
- `GET /api/todos` - Alle ToDos abrufen
- `POST /api/todos` - Neues ToDo erstellen
- `PUT /api/todos/:id` - ToDo aktualisieren (erledigt/unerledigt)
- `DELETE /api/todos/:id` - ToDo löschen

## Deployment

Für detaillierte Deployment-Anweisungen, siehe [DEPLOYMENT.md](DEPLOYMENT.md).

### Schnellstart

#### Backend auf Server deployen:
```bash
# PM2 installieren
npm install -g pm2

# .env Datei konfigurieren
cp .env.example .env
nano .env

# Dependencies installieren
npm install

# Mit PM2 starten
pm2 start server.js --name timetracking
pm2 save
```

#### Mobile App für Stores bauen:
```bash
cd mobile

# EAS CLI installieren
npm install -g eas-cli

# Build erstellen
eas build --platform ios     # Für iOS
eas build --platform android # Für Android
```

Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für vollständige Anweisungen.

## License

ISC
