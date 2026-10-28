# CS2 FACEIT STATS TRACKER
## Membrii echipei
- Camelia Boghici
- Tudor Batrineanu
- Cosmin Alecu
## Descriere
CS2 FACEIT Stats Tracker este o aplicație web care permite căutarea unui jucător FACEIT după nickname și afișarea profilului și a statisticilor sale pentru Counter-Strike 2.
## Template selectat
Aplicația folosește o interfață personalizată, construită cu HTML și CSS, fără un template predefinit.
## API selectat
- Nume API:FACEIT API
- Furnizor:https://developers.faceit.com/
- Documentație:https://docs.faceit.com/docs/
- Endpoint propus:GET /players?nickname={nickname}&game=cs2 (cauta profilul)
- Metodă HTTP:GET
- Necesită autentificare: Da
- Metoda de autentificare (fără valoarea secretă):: API key transmis în header-ul Authorization folosind formatul Bearer
- Cheie solicitată de la furnizor: Da
## Exemplu de request
GET https://open.faceit.com/data/v4/players?nickname={nickname}&game=cs2
Authorization: Bearer <API_KEY>
Accept: application/json
## Date utilizate din răspuns
- Din profil: player_id, nickname, avatar, games.cs2.skill_level și games.cs2.faceit_elo
- Din statisticile generale: lifetime["Average K/D Ratio"], lifetime["Win Rate %"], lifetime["Matches"], lifetime["Average Headshots %"] și lifetime["Current Win Streak"]
- Din statisticile meciurilor: Map, Result, Score, Kills, Deaths, Assists, Match Id și data meciului.
## Rezultatul testării request-ului
- Data testării:
- Cod HTTP sau mesajul de eroare:
- Observații, fără chei sau tokenuri:
## Funcționalități
- Căutarea unui jucător FACEIT după nickname.
- Afișarea nickname-ului și a avatarului.
- Afișarea statisticilor generale: K/D Ratio, Win Rate, număr de meciuri, procentaj headshot-uri și win streak.
- Afișarea meciurilor recente cu harta, rezultatul, data, scorul și statisticile K/D/A.
- Deschiderea unei ferestre cu echipele și statisticile jucătorilor atunci când utilizatorul selectează un meci.
- Afișarea clasamentelor regionale cu primii trei jucători din EU și NA.
- Revenirea la pagina principală prin apăsarea logo-ului sau a titlului.
## Gestionarea stărilor
- Loading:Se afișează un spinner și mesajul „Se accesează profilul jucătorului...” în timp ce se încarcă datele.
- Success:Se afișează profilul jucătorului, nivelul, Elo-ul, statisticile și istoricul meciurilor.
- Empty:Înainte de căutare, se afișează mesajul introductiv și previzualizarea statisticilor.
- Error:Se afișează un mesaj dacă jucătorul nu este găsit sau apare o problemă de conexiune.
## Responsabilități
- Camelia: Design UI/UX, structură HTML, CSS și pregătirea vizuală a stărilor aplicației.
- Tudor: Configurarea apelurilor HTTP cu fetch(), gestionarea header-elor de autentificare cu API key, prelucrarea datelor JSON și afișarea jucătorilor și statisticilor când utilizatorul selectează un meci.
- Cosmin:Manipularea DOM-ului cu Vanilla JavaScript, generarea cardurilor de statistici, afișarea istoricului meciurilor și realizarea clasamentului regional (leaderboard).
## Instrucțiuni de configurare și rulare
În acest laborator, documentați pașii necesari pentru testarea request-ului. Pașii
de configurare și rulare a aplicației se completează în etapa de implementare.
