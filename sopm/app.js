import { fetchAllPlayerData } from './api.js';

const inputElement = document.getElementById('inputNume');
const butonElement = document.getElementById('butonCauta');

const containerDate = document.getElementById('dateJucator');
const mesajLoading = document.getElementById('loadingMesaj');
const mesajEroare = document.getElementById('errorMesaj');

butonElement.addEventListener('click', async () => {
    const nickname = inputElement.value.trim();
    if (nickname === '') return; 

    // Ascundem datele/erorile și pornim loading-ul
    containerDate.classList.add('hidden');
    mesajEroare.classList.add('hidden');
    mesajLoading.classList.remove('hidden');

    const rezultat = await fetchAllPlayerData(nickname);

    // Oprim loading-ul
    mesajLoading.classList.add('hidden');

    if (rezultat) {
        // Populăm datele de bază
        document.getElementById('numeAfisat').textContent = rezultat.info.nickname;
        document.getElementById('nivelAfisat').textContent = rezultat.info.games.cs2.skill_level;
        document.getElementById('eloAfisat').textContent = rezultat.info.games.cs2.faceit_elo;

        // Calculăm K/D și Win Rate pentru ultimele 30 de meciuri
        let totalKills = 0, totalDeaths = 0, wins = 0;
        
        rezultat.recentMatches.forEach(meci => {
            totalKills += parseInt(meci.stats.Kills);
            totalDeaths += parseInt(meci.stats.Deaths);
            if (meci.stats.Result === "1") wins++; // "1" = victorie
        });

        // Prevenim împărțirea la zero în cazuri extreme
        const recentKD = totalDeaths === 0 ? totalKills : (totalKills / totalDeaths).toFixed(2);
        const recentWinRate = rezultat.recentMatches.length === 0 ? 0 : ((wins / rezultat.recentMatches.length) * 100).toFixed(0);

        // Afișăm statisticile
        document.getElementById('kdAfisat').textContent = `${recentKD} (Ultimele 30 meciuri)`;
        document.getElementById('winrateAfisat').textContent = `${recentWinRate}% (Ultimele 30 meciuri)`;

        // Afișăm panoul complet
        containerDate.classList.remove('hidden');
    } else {
        mesajEroare.classList.remove('hidden');
    }
});