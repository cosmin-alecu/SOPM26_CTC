const API_KEY = '634fa904-25a7-4987-9413-609b234a1159'; 
const BASE_URL = 'https://open.faceit.com/data/v4';

export async function fetchAllPlayerData(nickname) {
    try {
        const playerResponse = await fetch(`${BASE_URL}/players?nickname=${nickname}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' }
        });
        if (!playerResponse.ok) throw new Error(`Status: ${playerResponse.status}`);
        const playerData = await playerResponse.json();
        const playerId = playerData.player_id; 

        const statsResponse = await fetch(`${BASE_URL}/players/${playerId}/stats/cs2`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' }
        });
        if (!statsResponse.ok) throw new Error(`Status: ${statsResponse.status}`);
        const statsData = await statsResponse.json();

        // NOU: Preluăm ultimele 30 de meciuri cu date detaliate (Hartă, K/D pe meci, Rezultat)
        const recentResponse = await fetch(`${BASE_URL}/players/${playerId}/games/cs2/stats?offset=0&limit=30`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' }
        });
        if (!recentResponse.ok) throw new Error(`Status: ${recentResponse.status}`);
        const recentData = await recentResponse.json();

        return {
            info: playerData,
            stats: statsData.lifetime, 
            recentMatches: recentData.items // Aici avem hărțile și scorurile
        };

    } catch (error) {
        console.error("[API] Eroare:", error.message);
        return null;
    }
}