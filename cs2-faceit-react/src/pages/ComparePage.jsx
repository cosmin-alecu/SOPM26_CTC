import { useState } from "react";
import { fetchAllPlayerData } from "../Api.js";
import { formatNumber, formatPercent, getFallbackAvatar } from "../utils.js";

// Toate valorile comparate sunt de tipul "mai mare = mai bine"
const METRICS = [
  { key: "level", label: "NIVEL", get: (d) => d.player.level, format: (v) => formatNumber(v) },
  { key: "elo", label: "ELO", get: (d) => d.player.elo ?? d.stats.elo, format: (v) => formatNumber(v) },
  { key: "matches", label: "MECIURI", get: (d) => d.stats.totalMatches, format: (v) => formatNumber(v) },
  { key: "winRate", label: "WIN RATE", get: (d) => d.stats.winRate, format: (v) => formatPercent(v, 1) },
  { key: "kd", label: "K/D RATIO", get: (d) => d.stats.kdRatio, format: (v) => formatNumber(v, 2) },
  { key: "hs", label: "HEADSHOT %", get: (d) => d.stats.headshotPercent, format: (v) => formatPercent(v) },
  { key: "streak", label: "WIN STREAK", get: (d) => d.stats.winStreak, format: (v) => formatNumber(v) },
];

function compareValues(left, right) {
  const a = Number(left);
  const b = Number(right);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a === b) return 0;
  return a > b ? -1 : 1; // -1 = câștigă stânga, 1 = câștigă dreapta
}

function PlayerHeader({ data }) {
  const { player } = data;

  return (
    <div className="compare-player">
      <div className="player-avatar cyber-avatar">
        <img
          src={player.avatar || getFallbackAvatar(player.nickname)}
          alt={`Avatarul jucătorului ${player.nickname}`}
          onError={(event) => {
            event.currentTarget.src = getFallbackAvatar(player.nickname);
          }}
        />
      </div>
      <h3>{player.nickname}</h3>
    </div>
  );
}

function ComparePage({ initialNickname = "" }) {
  const [nicknames, setNicknames] = useState([initialNickname, ""]);
  const [players, setPlayers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateNickname(index, value) {
    setNicknames((current) => current.map((item, i) => (i === index ? value : item)));
  }

  async function handleCompare(event) {
    event.preventDefault();

    const clean = nicknames.map((item) => item.trim());
    if (clean.some((item) => !item)) return;

    if (clean[0].toLowerCase() === clean[1].toLowerCase()) {
      setError("Introdu doi jucători diferiți.");
      return;
    }

    setLoading(true);
    setError("");
    setPlayers(null);

    // Ambele profiluri se încarcă în paralel
    const results = await Promise.allSettled(clean.map(fetchAllPlayerData));
    const missing = clean.filter((_, i) => results[i].status === "rejected");

    if (missing.length > 0) {
      setError(`Nu a fost găsit: ${missing.join(", ")}. Verifică nickname-ul sau conexiunea!`);
    } else {
      setPlayers(results.map((result) => result.value));
    }

    setLoading(false);
  }

  const score = [0, 0];
  if (players) {
    for (const metric of METRICS) {
      const winner = compareValues(metric.get(players[0]), metric.get(players[1]));
      if (winner === -1) score[0] += 1;
      if (winner === 1) score[1] += 1;
    }
  }

  return (
    <section className="dashboard">
      <section className="search-section" aria-label="Compară jucători">
        <form className="cyber-form page-form compare-form" onSubmit={handleCompare}>
          <label className="search-label">COMPARĂ JUCĂTORI</label>

          {[0, 1].map((index) => (
            <div className="input-wrapper" key={index}>
              <span className="search-icon" aria-hidden="true">
                {index + 1}
              </span>
              <input
                type="text"
                aria-label={`Jucătorul ${index + 1}`}
                placeholder={`JUCĂTOR ${index + 1}...`}
                autoComplete="off"
                required
                value={nicknames[index]}
                onChange={(event) => updateNickname(index, event.target.value)}
              />
            </div>
          ))}

          <button type="submit" className="cyber-button" disabled={loading}>
            <span>{loading ? "SE COMPARĂ..." : "COMPARĂ"}</span>
          </button>
        </form>
      </section>

      {loading && (
        <section className="state-card loading-card" role="status" aria-live="polite">
          <div className="cyber-spinner" aria-hidden="true"></div>
          <p>Se încarcă cei doi jucători...</p>
        </section>
      )}

      {error && (
        <section className="state-card error-card" role="alert">
          <span className="state-icon" aria-hidden="true">!</span>
          <p>{error}</p>
        </section>
      )}

      {!loading && !error && !players && (
        <section className="state-card">
          <p>Introdu doi jucători pentru a le compara statisticile FACEIT.</p>
        </section>
      )}

      {players && (
        <section className="dashboard-section">
          <div className="compare-header">
            <PlayerHeader data={players[0]} />
            <div className="compare-score">
              <span className={score[0] > score[1] ? "leading" : ""}>{score[0]}</span>
              <small>VS</small>
              <span className={score[1] > score[0] ? "leading" : ""}>{score[1]}</span>
            </div>
            <PlayerHeader data={players[1]} />
          </div>

          <div className="compare-rows">
            {METRICS.map((metric) => {
              const left = metric.get(players[0]);
              const right = metric.get(players[1]);
              const winner = compareValues(left, right);

              return (
                <div className="compare-row" key={metric.key}>
                  <strong className={winner === -1 ? "better" : ""}>{metric.format(left)}</strong>
                  <span>{metric.label}</span>
                  <strong className={winner === 1 ? "better" : ""}>{metric.format(right)}</strong>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </section>
  );
}

export default ComparePage;
