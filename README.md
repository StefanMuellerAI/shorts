# Shorts – Video-Ideen-Manager

Mobile-first Web-App zum Erfassen, Verwalten und Archivieren von Short-Video-Ideen mit KI-gestuetzter Inhaltsanalyse.

## Setup

### 1. Dependencies installieren

```bash
npm install
```

### 2. Umgebungsvariablen

Kopiere `.env.example` nach `.env.local` und fuege deine Werte ein:

```bash
cp .env.example .env.local
```

Benoetigte Variablen:
- **POSTGRES_URL** / **POSTGRES_PRISMA_URL** – Vercel Postgres Connection Strings
- **NEXTAUTH_SECRET** – Zufaelliger String (`openssl rand -base64 32`)
- **NEXTAUTH_URL** – App-URL (lokal: `http://localhost:3000`)
- **ADMIN_EMAILS** – Komma-getrennte Liste von Admin-E-Mail-Adressen
- **ANTHROPIC_API_KEY** – Claude API Key fuer die KI-Funktion
- **BLOB_READ_WRITE_TOKEN** – Vercel Blob Token fuer Screenshot-Uploads

### 3. Datenbank einrichten

```bash
npm run db:push
npm run db:seed
```

Das Seed-Script erstellt Admin-Accounts aus `ADMIN_EMAILS` und gibt die initialen Passwoerter in der Konsole aus.

### 4. Entwicklung starten

```bash
npm run dev
```

## Deployment (Vercel)

1. Projekt mit Vercel verbinden
2. Vercel Postgres Datenbank erstellen (Env-Variablen werden automatisch gesetzt)
3. Vercel Blob Storage aktivieren
4. `NEXTAUTH_SECRET`, `ADMIN_EMAILS`, `ANTHROPIC_API_KEY` in den Vercel Environment Variables setzen
5. Nach dem ersten Deploy: `npx prisma db push && npm run db:seed` ausfuehren

## Funktionen

- **Vorrat**: Alle offenen Video-Ideen als Karten, filterbar nach Kategorie
- **Neue Idee**: Formular mit Link oder Screenshot als Quelle + KI-Magic-Button
- **Archiv**: Abgedrehte Ideen zum Nachschlagen
- **Admin**: Benutzer- und Kategorienverwaltung (nur fuer Admins)
- **KI-Ausfuellung**: Anthropic Claude analysiert die Quelle und fuellt Hook, Kernaussage, Mein Take und Kategorie automatisch aus
