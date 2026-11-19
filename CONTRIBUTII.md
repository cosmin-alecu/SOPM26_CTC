# Contribuțiile membrilor echipei

**Proiect:** CS2 FACEIT Stats Tracker

**Echipa:** Boghici Camelia-Ioana, Alecu Cosmin, Batrineanu Tudor-Mihai

Proiectul a fost realizat în două etape:

1. **Prima parte:** aplicația web în HTML, CSS și Vanilla JavaScript (folderul `sopm/`).
2. **A doua parte:** aplicația a fost mutată în React, cu un server Express care face legătura cu FACEIT API (folderul `cs2-faceit-react/`).

---

## Boghici Camelia-Ioana

### Prima parte: HTML și CSS
- A realizat structura HTML a aplicației (`sopm/index.html`): antetul, formularul de căutare, zona de profil, cardurile de statistici, lista de meciuri și clasamentele regionale.
- A realizat designul aplicației în CSS (`sopm/style.css`): tema neon cu roz, imaginea de fundal, fonturile, animațiile și aspectul pe telefon.
- A pregătit aspectul stărilor aplicației: încărcare (spinner), eroare, ecranul inițial și rezultatele căutării.

### A doua parte: trecerea la React
- A transformat structura HTML în componente React (`App.jsx`): `PlayerDashboard`, `StatCard`, `LeaderboardCard`, `PreviewStat` și `MatchModal`.
- A adaptat stilurile CSS pentru React (`style.css`) și a păstrat același aspect vizual ca în prima parte.
- A înlocuit lucrul direct cu DOM-ul cu starea componentelor (`useState`, `useEffect`) pentru căutare, încărcare, erori și fereastra cu detaliile meciului.

---

## Alecu Cosmin

### Prima parte: logica aplicației (`app.js`)
- A scris logica aplicației în Vanilla JavaScript (`sopm/app.js`).
- A generat dinamic cardurile de statistici (ELO, K/D, Win Rate, Headshot %, Win Streak, numărul de meciuri).
- A afișat istoricul meciurilor recente: harta, rezultatul, data, scorul și K/D/A.
- A realizat clasamentul regional (leaderboard) cu primii jucători din EU și NA.
- A tratat evenimentele din interfață: trimiterea formularului, click pe un meci și revenirea la pagina principală.

### A doua parte: pagina „Compară jucători”
- A creat pagina nouă **Compară** (`src/pages/ComparePage.jsx`).
- Utilizatorul introduce doi jucători, iar profilurile lor se încarcă în paralel (`Promise.allSettled`).
- Statisticile sunt afișate una lângă alta: nivel, ELO, meciuri, win rate, K/D, headshot % și win streak.
- Valoarea mai bună de pe fiecare rând este evidențiată, iar sus apare un scor general (de exemplu 5 – 2).
- Pagina tratează erorile: jucător negăsit, același jucător introdus de două ori și starea de încărcare.
- A adăugat meniul de navigare din antet (Căutare / Hărți / Compară).

---

## Batrineanu Tudor-Mihai

### Prima parte: conexiunea cu API-ul (`api.js`)
- A scris funcțiile pentru comunicarea cu FACEIT API (`sopm/api.js`), folosind `fetch()`.
- A configurat autentificarea cu cheia API, trimisă în header-ul `Authorization: Bearer`.
- A apelat endpoint-urile pentru profilul jucătorului, statisticile generale, meciurile recente, istoricul meciurilor, detaliile unui meci și clasamente.
- A prelucrat răspunsurile JSON și a tratat erorile HTTP (de exemplu, jucătorul nu există).

### A doua parte: pagina „Statistici pe hărți”
- A extins serverul (`server/server.js`): ruta `/api/player` returnează acum și statisticile pentru fiecare hartă. Datele vin din câmpul `segments` al endpoint-ului `/players/{id}/stats/cs2`.
- A creat pagina nouă **Hărți** (`src/pages/MapStatsPage.jsx`): un card pentru fiecare hartă (Mirage, Inferno, Nuke etc.), cu imaginea hărții, numărul de meciuri, win rate, K/D și headshot %.
- Hărțile pot fi sortate după meciuri, win rate, K/D sau headshot %.
- Cea mai bună și cea mai slabă hartă (după win rate, cu minimum 3 meciuri jucate) sunt evidențiate automat.
- A mutat funcțiile comune de formatare în `src/utils.js`, ca să poată fi folosite de toate paginile.

---

## Rezumat

| Membru | Prima parte | A doua parte |
|---|---|---|
| Boghici Camelia-Ioana | HTML și CSS | Trecerea HTML/CSS în React |
| Alecu Cosmin | `app.js` (logica aplicației și afișarea în DOM) | Pagina „Compară jucători” și meniul de navigare |
| Batrineanu Tudor-Mihai | `api.js` (conexiunea cu FACEIT API) | Pagina „Statistici pe hărți” și extinderea serverului |
