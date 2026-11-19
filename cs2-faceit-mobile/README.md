# CS2 FACEIT Tracker — aplicația mobilă (iOS + Android)

Versiunea React Native (Expo SDK 58) a site-ului din `cs2-faceit-react`.
Are aceleași pagini: **Căutare** (Top 3 EU/NA, profil, statistici, ultimele meciuri),
**Detalii meci**, **Hărți** și **Compară**.

Aplicația folosește același server Express (`cs2-faceit-react/server`), deci cheia
FACEIT rămâne pe server și nu este inclusă în aplicație.

## Pornire

1. Pornește serverul:
   ```bash
   cd ../cs2-faceit-react/server
   node server.js
   ```
2. Pornește aplicația:
   ```bash
   npm install
   npx expo start
   ```
3. Instalează **Expo Go** pe telefon (App Store / Google Play) și scanează codul QR.
   Telefonul și calculatorul trebuie să fie în aceeași rețea Wi-Fi.

## Adresa serverului

În development, aplicația folosește automat IP-ul calculatorului care rulează Expo,
pe portul `3001`. Pentru altă adresă (ex. un server publicat), creează un fișier `.env`:

```
EXPO_PUBLIC_API_URL=http://192.168.1.20:3001
```

## Structură

```
src/app/_layout.js          fonturi, splash, navigare (Stack)
src/app/(tabs)/index.js     Căutare
src/app/(tabs)/maps.js      Hărți
src/app/(tabs)/compare.js   Compară
src/app/match/[id].js       Detalii meci (modal)
src/api.js                  cereri către server
src/components/ui.js        componente comune
src/theme.js                culori și fonturi
```

## Build pentru magazine

```bash
npx eas-cli@latest build --platform android
npx eas-cli@latest build --platform ios
```
