# Schnellstart-Anleitung

Diese Anleitung hilft Ihnen, die TimeTracking Anwendung schnell zum Laufen zu bringen.

## Schritt 1: MySQL Datenbank einrichten (5 Minuten)

1. MySQL installieren (falls noch nicht installiert):
```bash
# Ubuntu/Debian
sudo apt install mysql-server

# macOS (mit Homebrew)
brew install mysql
brew services start mysql
```

2. MySQL öffnen:
```bash
mysql -u root -p
```

3. Datenbank und Benutzer erstellen:
```sql
CREATE DATABASE timetracking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'timetracking_user'@'localhost' IDENTIFIED BY 'MeinSicheresPasswort123!';
GRANT ALL PRIVILEGES ON timetracking_db.* TO 'timetracking_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Schritt 2: Backend konfigurieren (3 Minuten)

1. Repository klonen:
```bash
git clone https://github.com/Desdeney/timetracking.git
cd timetracking
```

2. Dependencies installieren:
```bash
npm install
```

3. Umgebungsvariablen einrichten:
```bash
cp .env.example .env
```

4. `.env` Datei bearbeiten:
```bash
nano .env
# oder
code .env  # wenn Sie VS Code verwenden
```

Mindestens diese Werte ändern:
```env
SESSION_SECRET=IhrSicheresRandomSecret
DB_PASSWORD=MeinSicheresPasswort123!
```

5. Backend starten:
```bash
npm start
```

✅ Backend läuft jetzt auf http://localhost:3000

## Schritt 3: Web-Anwendung testen (2 Minuten)

1. Browser öffnen: http://localhost:3000
2. Klicken Sie auf "Registrieren"
3. Erstellen Sie einen Testbenutzer
4. Melden Sie sich an
5. Erstellen Sie eine Test-Aufgabe

✅ Web-Anwendung funktioniert!

## Schritt 4: Mobile App einrichten (Optional, 5 Minuten)

1. Neues Terminal öffnen und zum mobile Ordner wechseln:
```bash
cd mobile
```

2. Dependencies installieren:
```bash
npm install
```

3. Expo CLI global installieren (falls noch nicht installiert):
```bash
npm install -g expo-cli
```

4. API-URL konfigurieren:
Öffnen Sie `src/services/api.js` und ändern Sie:
```javascript
const API_URL = 'http://localhost:3000';
```

**Wichtig für echte Geräte:**
- iOS Simulator: `http://localhost:3000` ✓
- Android Emulator: `http://10.0.2.2:3000`
- Echtes Gerät: `http://192.168.X.X:3000` (Ihre Computer-IP im lokalen Netzwerk)

So finden Sie Ihre IP:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

5. Mobile App starten:
```bash
npm start
```

6. App testen:
- Drücken Sie `i` für iOS Simulator
- Drücken Sie `a` für Android Emulator
- Oder scannen Sie den QR-Code mit Expo Go App auf Ihrem Smartphone

✅ Mobile App läuft!

## Häufige Probleme und Lösungen

### Problem: "Can't connect to MySQL server"
**Lösung:**
```bash
# Überprüfen Sie, ob MySQL läuft:
sudo systemctl status mysql  # Linux
brew services list           # macOS

# MySQL starten:
sudo systemctl start mysql   # Linux
brew services start mysql    # macOS
```

### Problem: "ER_ACCESS_DENIED_ERROR"
**Lösung:** Überprüfen Sie Benutzername und Passwort in `.env`:
```bash
mysql -u timetracking_user -p
# Geben Sie das Passwort aus .env ein
```

### Problem: Mobile App kann Backend nicht erreichen
**Lösung:**
1. Stellen Sie sicher, Backend läuft: http://localhost:3000
2. Überprüfen Sie API_URL in `mobile/src/services/api.js`
3. Bei echten Geräten: Verwenden Sie Ihre lokale IP, nicht localhost
4. Firewall prüfen: Port 3000 muss offen sein

### Problem: "Expo command not found"
**Lösung:**
```bash
npm install -g expo-cli
```

### Problem: Port 3000 bereits in Verwendung
**Lösung:**
```bash
# Prozess auf Port 3000 finden und beenden:
lsof -ti:3000 | xargs kill -9  # macOS/Linux
```

Oder ändern Sie den Port in `.env`:
```env
PORT=3001
```

## Nächste Schritte

### Für Entwicklung:
1. Lesen Sie [README.md](README.md) für detaillierte Funktionsbeschreibungen
2. Erkunden Sie die API-Endpoints
3. Passen Sie das Design an Ihre Bedürfnisse an

### Für Produktion:
1. Lesen Sie [DEPLOYMENT.md](DEPLOYMENT.md) für vollständige Deployment-Anweisungen
2. Konfigurieren Sie SSL/HTTPS
3. Setzen Sie starke Passwörter und Secrets
4. Richten Sie automatische Backups ein
5. Verwenden Sie PM2 für Process Management

## Hilfe benötigt?

- **Backend/API Probleme:** Schauen Sie in die Backend-Logs
- **Mobile App Probleme:** Schauen Sie in die Expo-Konsole
- **Datenbank Probleme:** Überprüfen Sie MySQL-Logs

Viel Erfolg! 🚀
