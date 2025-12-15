# TimeTracking - Deployment Anleitung

Diese Anleitung beschreibt, wie Sie die TimeTracking Anwendung (Backend + Web + Mobile App) in einer Produktionsumgebung deployen.

## Inhaltsverzeichnis

1. [MySQL Datenbank Setup](#mysql-datenbank-setup)
2. [Backend Deployment](#backend-deployment)
3. [Web-Anwendung Deployment](#web-anwendung-deployment)
4. [React Native App Deployment](#react-native-app-deployment)

---

## MySQL Datenbank Setup

### Voraussetzungen
- MySQL 8.0 oder höher installiert
- Root-Zugriff zur MySQL Installation

### Schritt 1: MySQL installieren

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### CentOS/RHEL
```bash
sudo yum install mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

#### macOS (mit Homebrew)
```bash
brew install mysql
brew services start mysql
```

### Schritt 2: Datenbank und Benutzer erstellen

1. Melden Sie sich bei MySQL an:
```bash
mysql -u root -p
```

2. Erstellen Sie die Datenbank:
```sql
CREATE DATABASE timetracking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Erstellen Sie einen Datenbankbenutzer:
```sql
CREATE USER 'timetracking_user'@'localhost' IDENTIFIED BY 'IhrSicheresPasswort123!';
GRANT ALL PRIVILEGES ON timetracking_db.* TO 'timetracking_user'@'localhost';
FLUSH PRIVILEGES;
```

4. Für Remote-Zugriff (optional, wenn Backend auf anderem Server läuft):
```sql
CREATE USER 'timetracking_user'@'%' IDENTIFIED BY 'IhrSicheresPasswort123!';
GRANT ALL PRIVILEGES ON timetracking_db.* TO 'timetracking_user'@'%';
FLUSH PRIVILEGES;
```

5. Verlassen Sie MySQL:
```sql
EXIT;
```

### Schritt 3: MySQL für Remote-Zugriff konfigurieren (optional)

1. Bearbeiten Sie die MySQL-Konfigurationsdatei:
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

2. Ändern Sie die bind-address:
```
# bind-address = 127.0.0.1
bind-address = 0.0.0.0
```

3. Starten Sie MySQL neu:
```bash
sudo systemctl restart mysql
```

4. Öffnen Sie Port 3306 in der Firewall:
```bash
sudo ufw allow 3306/tcp
```

---

## Backend Deployment

### Voraussetzungen
- Node.js 18+ installiert
- npm oder yarn
- Zugriff zur MySQL Datenbank

### Schritt 1: Repository klonen

```bash
git clone https://github.com/Desdeney/timetracking.git
cd timetracking
```

### Schritt 2: Dependencies installieren

```bash
npm install
```

### Schritt 3: Umgebungsvariablen konfigurieren

1. Erstellen Sie eine `.env` Datei:
```bash
cp .env.example .env
```

2. Bearbeiten Sie die `.env` Datei:
```bash
nano .env
```

3. Füllen Sie die Werte aus:
```env
# Server Configuration
PORT=3000
SESSION_SECRET=GenerierenSieEinLangesZufaelligesSecretHier!

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=timetracking_user
DB_PASSWORD=IhrSicheresPasswort123!
DB_NAME=timetracking_db

# CORS Configuration
CORS_ORIGIN=*
```

**Wichtig:** Generieren Sie ein starkes SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Schritt 4: Anwendung testen

```bash
npm start
```

Die Anwendung sollte auf `http://localhost:3000` laufen. Die Datenbanktabellen werden automatisch erstellt.

### Schritt 5: Produktions-Deployment mit PM2

PM2 ist ein Production Process Manager für Node.js Anwendungen.

1. PM2 global installieren:
```bash
sudo npm install -g pm2
```

2. Anwendung mit PM2 starten:
```bash
pm2 start server.js --name timetracking
```

3. PM2 beim Systemstart automatisch starten:
```bash
pm2 startup
pm2 save
```

4. Nützliche PM2 Befehle:
```bash
pm2 status              # Status anzeigen
pm2 logs timetracking   # Logs anzeigen
pm2 restart timetracking # Neustart
pm2 stop timetracking   # Stoppen
pm2 delete timetracking # Löschen
```

### Schritt 6: Nginx als Reverse Proxy (empfohlen)

1. Nginx installieren:
```bash
sudo apt install nginx  # Ubuntu/Debian
sudo yum install nginx  # CentOS/RHEL
```

2. Nginx-Konfiguration erstellen:
```bash
sudo nano /etc/nginx/sites-available/timetracking
```

3. Folgende Konfiguration einfügen:
```nginx
server {
    listen 80;
    server_name ihr-domain.de;  # Ändern Sie dies zu Ihrer Domain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. Konfiguration aktivieren:
```bash
sudo ln -s /etc/nginx/sites-available/timetracking /etc/nginx/sites-enabled/
sudo nginx -t  # Konfiguration testen
sudo systemctl restart nginx
```

### Schritt 7: SSL mit Let's Encrypt (empfohlen)

1. Certbot installieren:
```bash
sudo apt install certbot python3-certbot-nginx  # Ubuntu/Debian
```

2. SSL-Zertifikat erstellen:
```bash
sudo certbot --nginx -d ihr-domain.de
```

3. Auto-Renewal einrichten:
```bash
sudo systemctl status certbot.timer  # Sollte aktiviert sein
```

---

## Web-Anwendung Deployment

Die Web-Anwendung ist bereits Teil des Backend-Deployments. Die EJS-Templates in `/views` werden automatisch vom Express-Server bereitgestellt.

### Zugriff zur Web-Anwendung

- Lokal: `http://localhost:3000`
- Mit Nginx: `http://ihr-domain.de`
- Mit SSL: `https://ihr-domain.de`

### Statische Dateien (optional)

Falls Sie statische Dateien (CSS, JS, Bilder) haben:

1. Erstellen Sie einen `public` Ordner (falls nicht vorhanden):
```bash
mkdir -p public
```

2. Der Express-Server stellt diese automatisch bereit (bereits in server.js konfiguriert).

---

## React Native App Deployment

### Voraussetzungen
- Expo CLI installiert: `npm install -g expo-cli`
- Expo-Account (erstellen auf https://expo.dev)
- EAS CLI für moderne Builds: `npm install -g eas-cli`

### Entwicklungs-Setup

1. Zum mobile Ordner wechseln:
```bash
cd mobile
```

2. Dependencies installieren:
```bash
npm install
```

3. API-URL konfigurieren in `src/services/api.js`:
```javascript
const API_URL = 'https://ihr-domain.de';  // Ihre Backend-URL
```

4. Development Server starten:
```bash
npm start
```

### Expo Go App (Für Entwicklung/Testing)

1. Expo Go App auf Ihrem Smartphone installieren:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. QR-Code scannen der in Terminal/Browser angezeigt wird

### Build für Produktion (Methode 1: Classic Build)

⚠️ **Hinweis:** Classic Build wird bald deprecated. EAS Build wird empfohlen.

#### iOS Build
```bash
expo build:ios
```

#### Android APK Build
```bash
expo build:android -t apk
```

#### Android App Bundle Build (für Google Play Store)
```bash
expo build:android -t app-bundle
```

### Build für Produktion (Methode 2: EAS Build - Empfohlen)

EAS (Expo Application Services) ist die moderne Lösung für Expo Builds.

#### Schritt 1: EAS CLI installieren
```bash
npm install -g eas-cli
```

#### Schritt 2: Bei EAS anmelden
```bash
eas login
```

#### Schritt 3: Projekt konfigurieren
```bash
eas build:configure
```

Dies erstellt eine `eas.json` Datei mit Build-Konfigurationen.

#### Schritt 4: Build erstellen

**iOS Build:**
```bash
eas build --platform ios
```

**Android Build:**
```bash
eas build --platform android
```

**Beide Plattformen:**
```bash
eas build --platform all
```

#### Schritt 5: Build-Profil anpassen (optional)

Bearbeiten Sie `eas.json` für unterschiedliche Umgebungen:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### App Store Deployment

#### iOS (Apple App Store)

1. Apple Developer Account benötigt ($99/Jahr)
2. Build mit EAS erstellen:
```bash
eas build --platform ios --profile production
```
3. IPA-Datei herunterladen
4. Mit App Store Connect hochladen:
   - Transporter App verwenden
   - Oder direkt über Xcode
5. App für Review einreichen

Detaillierte Anleitung: https://docs.expo.dev/submit/ios/

#### Android (Google Play Store)

1. Google Play Developer Account benötigt (einmalig $25)
2. Build mit EAS erstellen:
```bash
eas build --platform android --profile production
```
3. AAB-Datei herunterladen
4. In Google Play Console hochladen:
   - Neue Release erstellen
   - AAB hochladen
   - Release-Informationen ausfüllen
   - Für Review einreichen

Detaillierte Anleitung: https://docs.expo.dev/submit/android/

### Automatisches Deployment mit EAS Submit

```bash
# iOS
eas submit --platform ios

# Android
eas submit --platform android
```

### Over-the-Air (OTA) Updates

Mit Expo können Sie Updates pushen ohne App Store Review:

```bash
# Update veröffentlichen
expo publish

# Mit EAS Update (modern)
eas update --branch production --message "Bug fixes"
```

### Wichtige Hinweise für Produktion

1. **API-URL:** Stellen Sie sicher, dass die API_URL in `src/services/api.js` auf Ihre Produktions-URL zeigt
2. **HTTPS:** Verwenden Sie immer HTTPS für das Backend in Produktion
3. **Session-Cookies:** Konfigurieren Sie CORS richtig für mobile Clients
4. **Error Handling:** Implementieren Sie angemessenes Error-Handling und Logging
5. **App Icons:** Ersetzen Sie die Placeholder-Icons in `assets/` mit echten Icons

---

## Monitoring und Wartung

### Backend Logs überwachen

Mit PM2:
```bash
pm2 logs timetracking
```

Mit systemd (falls direkt als Service):
```bash
sudo journalctl -u timetracking -f
```

### Datenbank Backup

Erstellen Sie regelmäßige Backups:

```bash
# Backup erstellen
mysqldump -u timetracking_user -p timetracking_db > backup_$(date +%Y%m%d).sql

# Backup wiederherstellen
mysql -u timetracking_user -p timetracking_db < backup_20241215.sql
```

Automatisieren Sie Backups mit Cron:
```bash
crontab -e
# Fügen Sie hinzu (täglich um 2 Uhr):
0 2 * * * mysqldump -u timetracking_user -p'IhrPasswort' timetracking_db > /backups/timetracking_$(date +\%Y\%m\%d).sql
```

### System-Updates

Halten Sie Ihr System aktuell:

```bash
# Backend Dependencies aktualisieren
npm update

# System-Pakete aktualisieren
sudo apt update && sudo apt upgrade  # Ubuntu/Debian
```

---

## Troubleshooting

### Backend startet nicht
- Überprüfen Sie MySQL-Verbindung: `mysql -u timetracking_user -p`
- Prüfen Sie .env Datei auf Fehler
- Schauen Sie PM2 Logs an: `pm2 logs timetracking`

### Mobile App kann nicht mit Backend verbinden
- Stellen Sie sicher, Backend läuft und ist erreichbar
- Überprüfen Sie API_URL in `src/services/api.js`
- Bei HTTPS: Stellen Sie sicher, dass SSL-Zertifikat gültig ist
- Prüfen Sie CORS-Einstellungen im Backend

### Datenbank-Verbindungsfehler
- Prüfen Sie MySQL-Service: `sudo systemctl status mysql`
- Testen Sie Verbindung: `mysql -u timetracking_user -p -h localhost timetracking_db`
- Überprüfen Sie Firewall-Regeln bei Remote-Verbindung

---

## Support und Weitere Informationen

- GitHub Repository: https://github.com/Desdeney/timetracking
- Expo Dokumentation: https://docs.expo.dev/
- MySQL Dokumentation: https://dev.mysql.com/doc/
- PM2 Dokumentation: https://pm2.keymetrics.io/

---

## Sicherheitshinweise

1. **Ändern Sie alle Default-Passwörter**
2. **Verwenden Sie starke SESSION_SECRET**
3. **Aktivieren Sie SSL/HTTPS für Produktion**
4. **Halten Sie Dependencies aktuell**
5. **Implementieren Sie Rate Limiting** (z.B. mit express-rate-limit)
6. **Verwenden Sie Firewall** (ufw, iptables)
7. **Regelmäßige Backups**
8. **Überwachen Sie Logs auf verdächtige Aktivitäten**

---

**Viel Erfolg mit Ihrem TimeTracking Deployment! 🚀**
