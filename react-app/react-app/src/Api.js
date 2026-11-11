async function request(url) {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Nu s-au putut încărca datele.");
  }

  return data;
}

export function fetchAllPlayerData(nickname) {
  const encodedNickname = encodeURIComponent(nickname);
  return request(`/api/player?nickname=${encodedNickname}`);
}

export function fetchLeaderboard(region) {
  return request(`/api/leaderboard/${encodeURIComponent(region)}`);
}

export function fetchMatchDetails(matchId) {
  const encodedMatchId = encodeURIComponent(matchId);
  return request(`/api/matches/${encodedMatchId}`);
}