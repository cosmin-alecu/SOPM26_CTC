import { useEffect, useState } from "react";
import {
  fetchAllPlayerData,
  fetchLeaderboard,
  fetchMatchDetails,
} from "./Api.js";
import "./style.css";

const REGIONS = ["EU", "NA"];

function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined || value === "") return "—";

  const number = Number(value);
  if (!Number.isFinite(number)) return "—";

  return number.toLocaleString("ro-RO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatMatchDate(timestamp) {
  if (!timestamp) return "Dată indisponibilă";

  const value = String(timestamp);
  const dateValue =
    /^\d+$/.test(value) && value.length === 10
      ? Number(value) * 1000
      : value;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Dată indisponibilă";

  return date.toLocaleString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFallbackAvatar(nickname = "CS2") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    nickname
  )}&background=ff168b&color=fff&size=128&bold=true`;
}

function PreviewStat({ icon, label, showResults = false }) {
  return (
    <article className="preview-stat">
      <div className="preview-icon" aria-hidden="true">
        {icon}
      </div>

      <div>
        <span className="preview-label">{label}</span>
        <strong>—</strong>
      </div>

      {showResults && (
        <div className="preview-results" aria-label="Ultimele cinci rezultate">
          <span>−</span>
          <span>−</span>
          <span>−</span>
          <span>−</span>
          <span>−</span>
        </div>
      )}
    </article>
  );
}

function LeaderboardCard({ region, data }) {
  const title = region === "EU" ? "TOP 3 EU" : "TOP 3 NA";
  const badge = region === "EU" ? "EUROPE" : "NORTH AMERICA";

  return (
    <div className="leaderboard-card">
      <div className="leaderboard-header">
        <h3>{title}</h3>
        <span className="region-badge">{badge}</span>
      </div>

      <ul className="leaderboard-list">
        {data.loading && (
          <li className="leaderboard-loading">Se încarcă Top 3...</li>
        )}

        {!data.loading && data.error && (
          <li className="leaderboard-loading">{data.error}</li>
        )}

        {!data.loading && !data.error && data.items.length === 0 && (
          <li className="leaderboard-loading">
            Nu sunt disponibile date pentru acest clasament.
          </li>
        )}

        {!data.loading &&
          !data.error &&
          data.items.map((item, index) => {
            const player = item.player || item;
            const nickname =
              player.nickname || item.nickname || "Jucător FACEIT";
            const elo =
              player.faceit_elo ?? item.faceit_elo ?? item.elo ?? "—";
            const position = item.position ?? item.rank ?? index + 1;

            return (
              <li className="leaderboard-item" key={item.player_id || nickname}>
                <div className="leaderboard-player">
                  <span className="leaderboard-rank">#{position}</span>
                  <span className="leaderboard-name">{nickname}</span>
                </div>

                <span className="leaderboard-elo">
                  {formatNumber(elo)} ELO
                </span>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

function StatCard({ title, value, description }) {
  return (
    <article className="stat-card">
      <h3>{title}</h3>
      <strong className="stat-value">{value}</strong>
      <span className="stat-description">{description}</span>
    </article>
  );
}

function PlayerDashboard({ data, onSelectMatch }) {
  const player = data.player;
  const stats = data.stats || {};
  const avatar = player.avatar || getFallbackAvatar(player.nickname);

  const winRate =
    stats.winRate !== null &&
    stats.winRate !== undefined &&
    stats.winRate !== ""
      ? `${formatNumber(stats.winRate, 1)}%`
      : "—";

  const headshotRate =
    stats.headshotPercent !== null &&
    stats.headshotPercent !== undefined &&
    stats.headshotPercent !== ""
      ? `${formatNumber(stats.headshotPercent)}%`
      : "—";

  const statCards = [
    {
      title: "ELO",
      value: formatNumber(player.elo ?? stats.elo),
      description: "Punctaj FACEIT",
      
    },
    {
      title: "MECIURI",
      value: formatNumber(stats.totalMatches),
      description: "Total meciuri jucate",
      
    },
    {
      title: "WIN RATE",
      value: winRate,
      description: "Procentul meciurilor câștigate",
      
    },
    {
      title: "WIN STREAK",
      value: formatNumber(stats.winStreak),
      description: "Victorii consecutive",
      
    },
    {
      title: "K/D RATIO",
      value: formatNumber(stats.kdRatio, 2),
      description: "Eliminări raportate la decese",
      
    },
    {
      title: "HEADSHOT %",
      value: headshotRate,
      description: "Procentaj mediu de headshot-uri",
      
    },
  ];

  return (
    <section className="dashboard">
      <article className="player-card cyber-panel">
        <div className="player-avatar cyber-avatar">
          <img
            src={avatar}
            alt={`Avatarul jucătorului ${player.nickname}`}
            onError={(event) => {
              event.currentTarget.src = getFallbackAvatar(player.nickname);
            }}
          />
        </div>

        <div className="player-info">
          <p className="eyebrow">// PROFIL IDENTIFICAT</p>
          <h2 id="player-name">{player.nickname || "Jucător FACEIT"}</h2>
          <p className="player-game">COUNTER-STRIKE 2 // FACEIT</p>
        </div>

        <div className="player-rank">
          <div className="rank-box">
            <span>NIVEL</span>
            <strong>{formatNumber(player.level)}</strong>
          </div>

          <div className="rank-box">
            <span>ELO</span>
            <strong>{formatNumber(player.elo ?? stats.elo)}</strong>
          </div>
        </div>
      </article>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>STATISTICI GLOBALE</h2>
        </div>

        <div className="stats-grid">
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <section className="dashboard-section matches-section">
        <div className="section-heading">
          <h2>ULTIMELE MECIURI</h2>
        </div>

        {data.matches.length > 0 ? (
          <div className="matches-list">
            {data.matches.map((match, index) => (
              <article
                className="match-card clickable"
                key={match.matchId || `${match.date}-${index}`}
                role="button"
                tabIndex={0}
                onClick={() => match.matchId && onSelectMatch(match.matchId)}
                onKeyDown={(event) => {
                  if (
                    (event.key === "Enter" || event.key === " ") &&
                    match.matchId
                  ) {
                    onSelectMatch(match.matchId);
                  }
                }}
                style={{ cursor: match.matchId ? "pointer" : "default" }}
              >
                <h3>{match.map || "Hartă necunoscută"}</h3>

                <span
                  className={`match-result ${
                    match.result === "win" ? "win" : "loss"
                  }`}
                >
                  {match.result === "win" ? "Victorie" : "Înfrângere"}
                </span>

                <p>Jucat la: {formatMatchDate(match.date)}</p>
                <p>Scor: {match.score || "Indisponibil"}</p>
                <p>
                  K/D/A: {match.kills ?? "—"} / {match.deaths ?? "—"} /{" "}
                  {match.assists ?? "—"}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="matches-empty">Nu există meciuri recente disponibile.</p>
        )}
      </section>
    </section>
  );
}

function MatchModal({ matchId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!matchId) return;

    let isActive = true;

    async function loadDetails() {
      setLoading(true);
      setError("");
      setDetails(null);

      try {
        const result = await fetchMatchDetails(matchId);
        if (isActive) setDetails(result);
      } catch {
        if (isActive) {
          setError("Nu s-au putut încărca detaliile acestui meci.");
        }
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadDetails();

    return () => {
      isActive = false;
    };
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;

    function closeOnEscape(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [matchId, onClose]);

  if (!matchId) return null;

  const rawTeams = details?.stats?.rounds?.[0]?.teams || [];
  const teams = Array.isArray(rawTeams) ? rawTeams : Object.values(rawTeams);

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content cyber-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-modal-title"
      >
        <button
          className="close-btn"
          type="button"
          aria-label="Închide"
          onClick={onClose}
        >
          &times;
        </button>

        <div className="modal-header">
          <h2 id="match-modal-title">DETALII MECI</h2>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="state-card">
              <div className="cyber-spinner" aria-hidden="true"></div>
              <p>Se încarcă detaliile meciului...</p>
            </div>
          )}

          {!loading && error && <p className="matches-empty">{error}</p>}

          {!loading && !error && teams.length === 0 && (
            <p className="matches-empty">
              Nu sunt disponibile statistici pentru acest meci.
            </p>
          )}

          {!loading &&
            !error &&
            teams.map((team, teamIndex) => {
              const teamStats = team.team_stats || {};
              const isWinner = teamStats["Team Win"] === "1";
              const teamId = String(team.team_id || "");
              const teamNames = details?.teamNames || {};

              const teamName =
                teamNames[teamId] ||
                teamNames[teamId.toLowerCase()] ||
                "Nume echipă indisponibil";

              return (
                <section
                  className="team-section"
                  key={team.team_id || teamIndex}
                >
                  <div className="team-header">
                    <h3>{teamName}</h3>

                    <div className="team-score-info">
                      <span className="score-badge">
                        {teamStats["Final Score"] || "—"}
                      </span>
                      <span
                        className={`team-status ${isWinner ? "win" : "loss"}`}
                      >
                        {isWinner ? "VICTORIE" : "ÎNFRÂNGERE"}
                      </span>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="match-stats-table">
                      <thead>
                        <tr>
                          <th>Jucător</th>
                          <th>Kills</th>
                          <th>Assists</th>
                          <th>Deaths</th>
                          <th>K/R</th>
                          <th>Headshots</th>
                        </tr>
                      </thead>

                      <tbody>
                        {(team.players || []).map((player) => {
                          const playerInfo =
                            details.players?.[player.player_id] || {};
                          const avatar =
                            playerInfo.avatar ||
                            getFallbackAvatar(player.nickname);
                          const playerStats = player.player_stats || {};

                          return (
                            <tr key={player.player_id || player.nickname}>
                              <td>
                                <div className="player-modal-info">
                                  <img
                                    className="modal-avatar"
                                    src={avatar}
                                    alt=""
                                    onError={(event) => {
                                      event.currentTarget.src = getFallbackAvatar(
                                        player.nickname
                                      );
                                    }}
                                  />
                                  <span className="modal-level">
                                    {playerInfo.level || "—"}
                                  </span>
                                  <strong>{player.nickname}</strong>
                                </div>
                              </td>
                              <td>{playerStats["Kills"] ?? "—"}</td>
                              <td>{playerStats["Assists"] ?? "—"}</td>
                              <td>{playerStats["Deaths"] ?? "—"}</td>
                              <td>{playerStats["K/R Ratio"] ?? "—"}</td>
                              <td>{playerStats["Headshots"] ?? "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [nickname, setNickname] = useState("");
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [leaderboards, setLeaderboards] = useState({
    EU: { items: [], loading: true, error: "" },
    NA: { items: [], loading: true, error: "" },
  });

  const [selectedMatchId, setSelectedMatchId] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function loadLeaderboards() {
      const results = await Promise.all(
        REGIONS.map(async (region) => {
          try {
            const items = await fetchLeaderboard(region);
            return { region, items, error: "" };
          } catch {
            return {
              region,
              items: [],
              error: "Clasamentul nu a putut fi încărcat.",
            };
          }
        })
      );

      if (!isActive) return;

      setLeaderboards({
        EU: {
          items: results.find((item) => item.region === "EU")?.items || [],
          loading: false,
          error: results.find((item) => item.region === "EU")?.error || "",
        },
        NA: {
          items: results.find((item) => item.region === "NA")?.items || [],
          loading: false,
          error: results.find((item) => item.region === "NA")?.error || "",
        },
      });
    }

    loadLeaderboards();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleSearch(event) {
    event.preventDefault();

    const cleanNickname = nickname.trim();
    if (!cleanNickname) return;

    setLoading(true);
    setError("");
    setPlayerData(null);

    try {
      const data = await fetchAllPlayerData(cleanNickname);
      setPlayerData(data);
    } catch {
      setError(
        "Jucătorul nu a fost găsit. Verifică nickname-ul sau conexiunea!"
      );
    } finally {
      setLoading(false);
    }
  }

  function resetToHome() {
    setNickname("");
    setPlayerData(null);
    setError("");
    setLoading(false);
    setSelectedMatchId(null);
  }

  const showEmpty = !loading && !error && !playerData;

  return (
    <>
      <div className="flame-container" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <span className="flame-particle" key={index}></span>
        ))}
      </div>

      <main className="app-shell">
        <header className="site-header">
          <div
            className="brand-icon"
            aria-hidden="true"
            role="button"
            tabIndex={0}
            title="Înapoi la pagina principală"
            onClick={resetToHome}
            onKeyDown={(event) => {
              if (event.key === "Enter") resetToHome();
            }}
          >
            F
          </div>

          <div
            className="brand-content"
            role="button"
            tabIndex={0}
            title="Înapoi la pagina principală"
            onClick={resetToHome}
            onKeyDown={(event) => {
              if (event.key === "Enter") resetToHome();
            }}
          >
            <h1>
              CS2 FACEIT <span>TRACKER</span>
            </h1>
          </div>
        </header>

        <section className="search-section" aria-label="Caută un jucător">
          <form id="search-form" className="cyber-form" onSubmit={handleSearch}>
            <label htmlFor="nickname" className="search-label">
              NICKNAME FACEIT
            </label>

            <div className="input-wrapper">
              <span className="search-icon" aria-hidden="true">
                ⌕
              </span>

              <input
                id="nickname"
                name="nickname"
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
          <section
            className="state-card loading-card"
            role="status"
            aria-live="polite"
          >
            <div className="cyber-spinner" aria-hidden="true"></div>
            <p>Se încarcă datele jucătorului...</p>
          </section>
        )}

        {error && (
          <section className="state-card error-card" role="alert">
            <span className="state-icon" aria-hidden="true">
              !
            </span>
            <p>{error}</p>
          </section>
        )}

        {showEmpty && (
          <section id="empty-state" className="empty-preview">
            <div className="preview-heading">
              <span className="heading-line" aria-hidden="true"></span>

              <div>
                <h2>
                  ANALIZEAZĂ-ȚI <span>PERFORMANȚA</span>
                </h2>
                <p>Introdu un nickname pentru a vedea statisticile FACEIT.</p>
              </div>

              <span className="heading-line" aria-hidden="true"></span>
            </div>

            <div className="preview-grid">
              <PreviewStat
                label="ELO"
                icon={
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="5" />
                    <path d="m8.5 12-1 9 4.5-2.5 4.5 2.5-1-9" />
                    <path d="m12 5 1 2 2 .3-1.5 1.5.4 2.2-1.9-1-1.9 1 .4-2.2L8 7.3l2-.3 2-2Z" />
                  </svg>
                }
              />

              <PreviewStat
                label="WIN RATE"
                icon={
                  <svg viewBox="0 0 24 24">
                    <path d="M4 19h16" />
                    <path d="m6 15 4-4 3 2 5-7" />
                    <path d="M15 6h3v3" />
                  </svg>
                }
              />

              <PreviewStat
                label="K/D RATIO"
                icon={
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="7" />
                    <circle cx="12" cy="12" r="2" />
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  </svg>
                }
              />

              <PreviewStat
                label="MECIURI RECENTE"
                showResults
                icon={
                  <svg viewBox="0 0 24 24">
                    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                }
              />
            </div>

            <div className="leaderboard-container">
              {REGIONS.map((region) => (
                <LeaderboardCard
                  key={region}
                  region={region}
                  data={leaderboards[region]}
                />
              ))}
            </div>
          </section>
        )}

        {playerData && (
          <PlayerDashboard
            data={playerData}
            onSelectMatch={setSelectedMatchId}
          />
        )}

        <footer className="site-footer">
          <span>CS2 NEON TRACKER // V.4.0</span>
          <span className="footer-divider">|</span>
          <span>SECURE CONNECTION</span>
        </footer>

        <MatchModal
          matchId={selectedMatchId}
          onClose={() => setSelectedMatchId(null)}
        />
      </main>
    </>
  );
}

export default App;