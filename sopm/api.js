const API_KEY = "634fa904-25a7-4987-9413-609b234a1159";
const BASE_URL = "https://open.faceit.com/data/v4";

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  Accept: "application/json"
};

export async function fetchAllPlayerData(nickname) {
  const encodedNickname = encodeURIComponent(nickname);

  try {
    const playerResponse = await fetch(
      `${BASE_URL}/players?nickname=${encodedNickname}&game=cs2`,
      { method: "GET", headers }
    );

    if (!playerResponse.ok) {
      throw new Error("Jucătorul nu a fost găsit.");
    }

    const playerData = await playerResponse.json();
    const playerId = playerData.player_id;
    const cs2Data = playerData.games?.cs2 ?? {};

    if (!playerId) {
      throw new Error("Profilul nu conține un player_id.");
    }

    const [statsResponse, recentResponse, historyResponse] = await Promise.all([
      fetch(`${BASE_URL}/players/${playerId}/stats/cs2`, {
        method: "GET",
        headers
      }),
      fetch(`${BASE_URL}/players/${playerId}/games/cs2/stats?offset=0&limit=5`, {
        method: "GET",
        headers
      }),
      fetch(`${BASE_URL}/players/${playerId}/history?game=cs2&offset=0&limit=30`, {
        method: "GET",
        headers
      })
    ]);

    const statsData = statsResponse.ok
      ? await statsResponse.json()
      : { lifetime: {} };

    const recentData = recentResponse.ok
      ? await recentResponse.json()
      : { items: [] };

    const historyData = historyResponse.ok
      ? await historyResponse.json()
      : { items: [] };

    const lifetime = statsData.lifetime ?? {};
    const matchTimestamps = {};

    for (const match of historyData.items ?? []) {
      if (match.match_id) {
        matchTimestamps[match.match_id] =
          match.finished_at ?? match.started_at ?? null;
      }
    }

    const matchesMapped = (recentData.items ?? []).map((item) => {
      const itemStats = item.stats ?? {};
      const matchId = itemStats["Match Id"];

      return {
        matchId,
        map: itemStats["Map"] ?? null,
        result: itemStats["Result"] === "1" ? "win" : "loss",
        date:
          matchTimestamps[matchId] ??
          item.created_at ??
          item.updated_at ??
          null,
        score: itemStats["Score"] ?? null,
        kills: itemStats["Kills"] ?? null,
        deaths: itemStats["Deaths"] ?? null,
        assists: itemStats["Assists"] ?? null
      };
    });

    return {
      player: {
        nickname: playerData.nickname,
        avatar: playerData.avatar ?? null,
        level: cs2Data.skill_level ?? null,
        elo: cs2Data.faceit_elo ?? null
      },
      stats: {
        elo: cs2Data.faceit_elo ?? null,
        kdRatio: lifetime["Average K/D Ratio"] ?? null,
        winRate: lifetime["Win Rate %"] ?? null,
        totalMatches: lifetime["Matches"] ?? null,
        headshotPercent: lifetime["Average Headshots %"] ?? null,
        winStreak: lifetime["Current Win Streak"] ?? null
      },
      matches: matchesMapped
    };
  } catch (error) {
    console.error("[API] Eroare:", error.message);
    throw error;
  }
}

// Funcție care combină statisticile cu profilurile jucătorilor (Poze + Level)
export async function fetchMatchDetails(matchId) {
  try {
    const [statsResponse, detailsResponse] = await Promise.all([
      fetch(`${BASE_URL}/matches/${matchId}/stats`, { method: "GET", headers }),
      fetch(`${BASE_URL}/matches/${matchId}`, { method: "GET", headers })
    ]);
    
    if (!statsResponse.ok || !detailsResponse.ok) {
      throw new Error("Datele meciului nu au putut fi încărcate.");
    }
    
    const statsData = await statsResponse.json();
    const detailsData = await detailsResponse.json();

    const playersInfo = {};
    const factions = detailsData.teams || {};
    
    for (const factionKey in factions) {
      const roster = factions[factionKey].roster || [];
      roster.forEach(player => {
        playersInfo[player.player_id] = {
          avatar: player.avatar || null,
          level: player.game_skill_level || "-"
        };
      });
    }
    
    return {
        stats: statsData,
        info: playersInfo
    };
  } catch (error) {
    console.error("[API] Eroare detalii meci:", error.message);
    throw error;
  }
}