const API_KEY = '634fa904-25a7-4987-9413-609b234a1159'; 
const BASE_URL = 'https://open.faceit.com/data/v4';

export async function fetchAllPlayerData(nickname) {
    try {
        const playerResponse = await fetch(`${BASE_URL}/players?nickname=${nickname}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' }
        });
        if (!playerResponse.ok) throw new Error(`Jucător negăsit`);
        const playerData = await playerResponse.json();
        const playerId = playerData.player_id; 

        const statsResponse = await fetch(`${BASE_URL}/players/${playerId}/stats/cs2`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' }
        });
        const statsData = statsResponse.ok ? await statsResponse.json() : { lifetime: {} };

        const recentResponse = await fetch(`${BASE_URL}/players/${playerId}/games/cs2/stats?offset=0&limit=30`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' }
        });
        const recentData = recentResponse.ok ? await recentResponse.json() : { items: [] };

        const historyResponse = await fetch(`${BASE_URL}/players/${playerId}/history?game=cs2&offset=0&limit=30`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' }
        });
        const historyData = historyResponse.ok ? await historyResponse.json() : { items: [] };

        const matchTimestamps = {};
        if (historyData.items && historyData.items.length > 0) {
            historyData.items.forEach(match => {
                matchTimestamps[match.match_id] = match.finished_at || match.started_at || null;
            });
        }

        const matchesMapped = recentData.items.map(item => {
            const matchId = item.stats["Match Id"];
            const matchTimestamp = matchTimestamps[matchId] || item.created_at || item.updated_at || null;

            return {
                matchId: matchId,
                map: item.stats["Map"],
                result: item.stats["Result"] === "1" ? "win" : "loss",
                date: matchTimestamp,
                score: item.stats["Score"],
                kills: item.stats["Kills"],
                deaths: item.stats["Deaths"],
                assists: item.stats["Assists"]
            };
        });

        return {
            player: {
                nickname: playerData.nickname,
                avatar: playerData.avatar || null // AM ADĂUGAT AVATARUL AICI
            },
            stats: {
                elo: playerData.games?.cs2?.faceit_elo || null,
                kdRatio: statsData.lifetime["Average K/D Ratio"] || null,
                winRate: statsData.lifetime["Win Rate %"] || null,
                totalMatches: statsData.lifetime["Matches"] || null,
                headshotPercent: statsData.lifetime["Average Headshots %"] || null,
                winStreak: statsData.lifetime["Current Win Streak"] || null
            },
            matches: matchesMapped
        };

    } catch (error) {
        console.error("[API] Eroare:", error.message);
        throw error;
    }
}