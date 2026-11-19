import Constants from "expo-constants";

// Aplicația mobilă folosește același server Express ca site-ul (cs2-faceit-react/server),
// astfel cheia FACEIT rămâne pe server și nu ajunge în aplicație.
//
// Ordinea de alegere a adresei:
// 1. EXPO_PUBLIC_API_URL din .env (ex: http://192.168.1.20:3001 sau un server publicat)
// 2. în development: IP-ul calculatorului care rulează Expo, pe portul 3001
function getBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const hostUri = Constants.expoConfig?.hostUri; // ex: "172.20.10.5:8081"
  const host = hostUri ? hostUri.split(":")[0] : "localhost";
  return `http://${host}:3001`;
}

export const BASE_URL = getBaseUrl();

async function request(path) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`);
  } catch {
    throw new Error(`Serverul nu poate fi accesat (${BASE_URL}).`);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Nu s-au putut încărca datele.");
  }

  return data;
}

export function fetchAllPlayerData(nickname) {
  return request(`/api/player?nickname=${encodeURIComponent(nickname)}`);
}

export function fetchLeaderboard(region) {
  return request(`/api/leaderboard/${encodeURIComponent(region)}`);
}

export function fetchMatchDetails(matchId) {
  return request(`/api/matches/${encodeURIComponent(matchId)}`);
}
