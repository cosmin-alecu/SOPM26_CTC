require("dotenv").config();

const express = require("express");

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.FACEIT_API_KEY;
const FACEIT_URL = "https://open.faceit.com/data/v4";

// Trimite o cerere GET către FACEIT și verifică răspunsul
async function faceitGet(path) {
  if (!API_KEY) {
    const error = new Error("Lipsește FACEIT_API_KEY din server/.env");
    error.status = 500;
    throw error;
  }

  const response = await fetch(`${FACEIT_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || `FACEIT API a răspuns cu HTTP ${response.status}`
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

// Trimite erorile API către interfață
function sendApiError(res, error) {
  console.error("[FACEIT API]", error.message);

  res.status(error.status || 500).json({
    error: error.message || "A apărut o eroare la comunicarea cu FACEIT.",
  });
}

// Verifică dacă serverul este pornit
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Caută jucătorul și încarcă profilul, statisticile și ultimele 5 meciuri
app.get("/api/player", async (req, res) => {
  const nickname = String(req.query.nickname || "").trim();

  if (!nickname) {
    return res.status(400).json({ error: "Introdu un nickname." });
  }

  try {
    if (!API_KEY) {
      const error = new Error("Lipsește FACEIT_API_KEY din server/.env");
      error.status = 500;
      throw error;
    }

    const playerUrl = new URL(`${FACEIT_URL}/players`);
    playerUrl.searchParams.set("nickname", nickname);
    playerUrl.searchParams.set("game", "cs2");

    const playerResponse = await fetch(playerUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
      },
    });

    const playerData = await playerResponse.json().catch(() => ({}));

    if (!playerResponse.ok) {
      const error = new Error(
        playerData.message || "Jucătorul nu a fost găsit."
      );
      error.status = playerResponse.status;
      throw error;
    }

    const playerId = playerData.player_id;

    if (!playerId) {
      return res.status(404).json({ error: "Profilul nu are player_id." });
    }

    const encodedId = encodeURIComponent(playerId);

    const [statsData, recentData, historyData] = await Promise.all([
      faceitGet(`/players/${encodedId}/stats/cs2`),
      faceitGet(`/players/${encodedId}/games/cs2/stats?offset=0&limit=5`),
      faceitGet(`/players/${encodedId}/history?game=cs2&offset=0&limit=30`),
    ]);

    const lifetime = statsData.lifetime || {};
    const cs2 = playerData.games?.cs2 || {};
    const matchDates = {};

    for (const match of historyData.items || []) {
      if (match.match_id) {
        matchDates[match.match_id] =
          match.finished_at || match.started_at || null;
      }
    }

    const matches = (recentData.items || []).map((item) => {
      const matchStats = item.stats || {};
      const matchId = matchStats["Match Id"];

      return {
        matchId,
        map: matchStats["Map"] || null,
        result: matchStats["Result"] === "1" ? "win" : "loss",
        date:
          matchDates[matchId] ||
          item.created_at ||
          item.updated_at ||
          null,
        score: matchStats["Score"] || null,
        kills: matchStats["Kills"] || null,
        deaths: matchStats["Deaths"] || null,
        assists: matchStats["Assists"] || null,
      };
    });

    res.json({
      player: {
        id: playerId,
        nickname: playerData.nickname,
        avatar: playerData.avatar || null,
        level: cs2.skill_level ?? null,
        elo: cs2.faceit_elo ?? null,
      },
      stats: {
        elo: cs2.faceit_elo ?? null,
        kdRatio: lifetime["Average K/D Ratio"] ?? null,
        winRate: lifetime["Win Rate %"] ?? null,
        totalMatches: lifetime["Matches"] ?? null,
        headshotPercent: lifetime["Average Headshots %"] ?? null,
        winStreak: lifetime["Current Win Streak"] ?? null,
      },
      matches,
    });
  } catch (error) {
    sendApiError(res, error);
  }
});

// Încarcă primele 3 poziții din clasamentul EU sau NA
app.get("/api/leaderboard/:region", async (req, res) => {
  const region = String(req.params.region).toUpperCase();

  if (!["EU", "NA"].includes(region)) {
    return res.status(400).json({ error: "Regiune invalidă." });
  }

  try {
    const data = await faceitGet(
      `/rankings/games/cs2/regions/${region}?limit=3`
    );

    res.json(data.items || []);
  } catch (error) {
    sendApiError(res, error);
  }
});

// Încarcă statisticile, numele echipelor și jucătorii unui meci
app.get("/api/matches/:matchId", async (req, res) => {
  const matchId = String(req.params.matchId || "").trim();

  if (!matchId) {
    return res.status(400).json({ error: "ID-ul meciului lipsește." });
  }

  try {
    const encodedMatchId = encodeURIComponent(matchId);

    // FACEIT returnează separat statisticile și detaliile meciului
    const [stats, details] = await Promise.all([
      faceitGet(`/matches/${encodedMatchId}/stats`),
      faceitGet(`/matches/${encodedMatchId}`),
    ]);

    const players = {};
    const teamNames = {};

    const detailTeams = Object.entries(details.teams || {}).map(
      ([teamKey, team]) => ({ teamKey, team })
    );

    // Păstrează avatarul și nivelul jucătorilor din loturi
    for (const { team } of detailTeams) {
      for (const player of team.roster || []) {
        if (player.player_id) {
          players[player.player_id] = {
            avatar: player.avatar || null,
            level: player.game_skill_level ?? null,
          };
        }
      }
    }

    const rawStatsTeams = stats?.rounds?.[0]?.teams || [];
    const statsTeams = Array.isArray(rawStatsTeams)
      ? rawStatsTeams
      : Object.values(rawStatsTeams);

    for (const [index, statsTeam] of statsTeams.entries()) {
      const statsTeamId = String(statsTeam.team_id || "");

      // Încearcă să asocieze echipele după ID
      let matchingTeam = detailTeams.find(({ team }) => {
        const factionId = String(team.faction_id || "");
        return factionId && factionId === statsTeamId;
      });

      // Dacă ID-urile diferă, compară jucătorii din cele două loturi
      if (!matchingTeam) {
        const statsPlayerIds = new Set(
          (statsTeam.players || [])
            .map((player) => player.player_id)
            .filter(Boolean)
        );

        matchingTeam = detailTeams.find(({ team }) =>
          (team.roster || []).some((player) =>
            statsPlayerIds.has(player.player_id)
          )
        );
      }

      // Ultima variantă: asociază echipele în ordinea primită de la FACEIT
      if (!matchingTeam) {
        matchingTeam = detailTeams[index];
      }

      const teamName = matchingTeam?.team?.name;

      if (statsTeamId && teamName) {
        teamNames[statsTeamId] = teamName;
        teamNames[statsTeamId.toLowerCase()] = teamName;
      }
    }

    res.json({
      stats,
      players,
      teamNames,
    });
  } catch (error) {
    sendApiError(res, error);
  }
});

// Pornește serverul
app.listen(PORT, () => {
  console.log(`Serverul FACEIT rulează pe http://localhost:${PORT}`);
});