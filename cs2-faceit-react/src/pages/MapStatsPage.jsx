import { useState } from "react";
import { fetchAllPlayerData } from "../Api.js";
import {
  formatMapName,
  formatNumber,
  formatPercent,
  getFallbackAvatar,
} from "../utils.js";

const SORT_OPTIONS = [
  { value: "matches", label: "Meciuri" },
  { value: "winRate", label: "Win rate" },
  { value: "kdRatio", label: "K/D" },
  { value: "headshotPercent", label: "Headshot %" },
];

// Hărțile cu prea puține meciuri nu sunt luate în calcul pentru cea mai bună / slabă hartă
const MIN_MATCHES_FOR_HIGHLIGHT = 3;

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : -Infinity;
}

function MapStatsPage({ playerData, onPlayerLoaded }) {
  const [nickname, setNickname] = useState(playerData?.player?.nickname || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("matches");

  async function handleSearch(event) {
    event.preventDefault();

    const cleanNickname = nickname.trim();
    if (!cleanNickname) return;

    setLoading(true);
    setError("");

    try {
      const data = await fetchAllPlayerData(cleanNickname);
      onPlayerLoaded(data);
    } catch {
      setError("Jucătorul nu a fost găsit. Verifică nickname-ul sau conexiunea!");
    } finally {
      setLoading(false);
    }
  }

  const maps = playerData?.maps || [];
  const sortedMaps = [...maps].sort(
    (a, b) => toNumber(b[sortBy]) - toNumber(a[sortBy])
  );

  const eligible = maps.filter(
    (map) => toNumber(map.matches) >= MIN_MATCHES_FOR_HIGHLIGHT
  );
  const byWinRate = [...eligible].sort(
    (a, b) => toNumber(b.winRate) - toNumber(a.winRate)
  );
  const bestMap = byWinRate[0]?.name;
  const worstMap = byWinRate.length > 1 ? byWinRate.at(-1).name : null;

  const player = playerData?.player;

  return (
    <section className="dashboard">
      <section className="search-section" aria-label="Statistici pe hărți">
        <form className="cyber-form page-form" onSubmit={handleSearch}>
          <label htmlFor="maps-nickname" className="search-label">
            STATISTICI PE HĂRȚI
          </label>

          <div className="input-wrapper">
            <span className="search-icon" aria-hidden="true">
              ⌕
            </span>
            <input
              id="maps-nickname"
              type="text"
              placeholder="INTRODU NICKNAME..."
              autoComplete="off"
              required
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
            />
          </div>

          <button type="submit" className="cyber-button" disabled={loading}>
            <span>{loading ? "SE CAUTĂ..." : "CAUTĂ"}</span>
          </button>
        </form>
      </section>

      {loading && (
        <section className="state-card loading-card" role="status" aria-live="polite">
          <div className="cyber-spinner" aria-hidden="true"></div>
          <p>Se încarcă statisticile pe hărți...</p>
        </section>
      )}

      {error && (
        <section className="state-card error-card" role="alert">
          <span className="state-icon" aria-hidden="true">!</span>
          <p>{error}</p>
        </section>
      )}

      {!loading && !error && !player && (
        <section className="state-card">
          <p>Caută un jucător pentru a vedea performanța lui pe fiecare hartă.</p>
        </section>
      )}

      {!loading && player && (
        <section className="dashboard-section">
          <div className="section-heading maps-heading">
            <div className="maps-player">
              <img
                className="modal-avatar"
                src={player.avatar || getFallbackAvatar(player.nickname)}
                alt=""
                onError={(event) => {
                  event.currentTarget.src = getFallbackAvatar(player.nickname);
                }}
              />
              <h2>HĂRȚI // {player.nickname}</h2>
            </div>

            <label className="sort-control">
              <span>SORTEAZĂ DUPĂ</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {sortedMaps.length > 0 ? (
            <div className="maps-grid">
              {sortedMaps.map((map) => {
                const tag =
                  map.name === bestMap ? "best" : map.name === worstMap ? "worst" : "";

                return (
                  <article className={`map-card ${tag}`} key={map.name}>
                    <div
                      className="map-banner"
                      style={
                        map.image ? { backgroundImage: `url("${map.image}")` } : undefined
                      }
                    >
                      <h3>{formatMapName(map.name)}</h3>
                      {tag && (
                        <span className={`map-tag ${tag}`}>
                          {tag === "best" ? "CEA MAI BUNĂ" : "CEA MAI SLABĂ"}
                        </span>
                      )}
                    </div>

                    <dl className="map-stats">
                      <div>
                        <dt>MECIURI</dt>
                        <dd>{formatNumber(map.matches)}</dd>
                      </div>
                      <div>
                        <dt>WIN RATE</dt>
                        <dd>{formatPercent(map.winRate)}</dd>
                      </div>
                      <div>
                        <dt>K/D</dt>
                        <dd>{formatNumber(map.kdRatio, 2)}</dd>
                      </div>
                      <div>
                        <dt>HS %</dt>
                        <dd>{formatPercent(map.headshotPercent)}</dd>
                      </div>
                    </dl>

                    <div className="winrate-bar" aria-hidden="true">
                      <span
                        style={{
                          width: `${Math.min(100, Math.max(0, Number(map.winRate) || 0))}%`,
                        }}
                      ></span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="matches-empty">Nu există statistici pe hărți pentru acest jucător.</p>
          )}
        </section>
      )}
    </section>
  );
}

export default MapStatsPage;
