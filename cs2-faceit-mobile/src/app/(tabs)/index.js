import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { fetchAllPlayerData, fetchLeaderboard } from "../../api";
import { usePlayer } from "../../PlayerContext";
import { colors, fonts } from "../../theme";
import { formatNumber } from "../../utils";
import {
  Avatar,
  ErrorCard,
  Loading,
  Screen,
  SearchBar,
  SectionTitle,
  styles as ui,
} from "../../components/ui";

const REGIONS = ["EU", "NA"];

function formatMatchDate(timestamp) {
  if (!timestamp) return "Dată indisponibilă";

  const value = String(timestamp);
  const dateValue = /^\d+$/.test(value) && value.length === 10 ? Number(value) * 1000 : value;
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

function LeaderboardCard({ region, data }) {
  return (
    <View style={ui.panel}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>TOP 3 {region}</Text>
        <Text style={styles.badge}>{region === "EU" ? "EUROPE" : "NORTH AMERICA"}</Text>
      </View>

      {data.loading && <Text style={styles.muted}>Se încarcă Top 3...</Text>}
      {!data.loading && data.error ? <Text style={styles.muted}>{data.error}</Text> : null}
      {!data.loading && !data.error && data.items.length === 0 && (
        <Text style={styles.muted}>Nu sunt disponibile date pentru acest clasament.</Text>
      )}

      {!data.loading &&
        !data.error &&
        data.items.map((item, index) => {
          const player = item.player || item;
          const nickname = player.nickname || item.nickname || "Jucător FACEIT";
          const elo = player.faceit_elo ?? item.faceit_elo ?? item.elo;
          const position = item.position ?? item.rank ?? index + 1;

          return (
            <View style={styles.leaderRow} key={item.player_id || nickname}>
              <Text style={styles.rank}>#{position}</Text>
              <Text style={styles.leaderName} numberOfLines={1}>
                {nickname}
              </Text>
              <Text style={styles.leaderElo}>{formatNumber(elo)} ELO</Text>
            </View>
          );
        })}
    </View>
  );
}

function StatCard({ title, value, description }) {
  return (
    <View style={[ui.panel, styles.statCard]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statDesc}>{description}</Text>
    </View>
  );
}

function PlayerDashboard({ data }) {
  const { player } = data;
  const stats = data.stats || {};
  const has = (v) => v !== null && v !== undefined && v !== "";

  const statCards = [
    { title: "ELO", value: formatNumber(player.elo ?? stats.elo), description: "Punctaj FACEIT" },
    { title: "MECIURI", value: formatNumber(stats.totalMatches), description: "Total meciuri jucate" },
    {
      title: "WIN RATE",
      value: has(stats.winRate) ? `${formatNumber(stats.winRate, 1)}%` : "—",
      description: "Meciuri câștigate",
    },
    { title: "WIN STREAK", value: formatNumber(stats.winStreak), description: "Victorii consecutive" },
    { title: "K/D RATIO", value: formatNumber(stats.kdRatio, 2), description: "Eliminări / decese" },
    {
      title: "HEADSHOT %",
      value: has(stats.headshotPercent) ? `${formatNumber(stats.headshotPercent)}%` : "—",
      description: "Medie headshot-uri",
    },
  ];

  return (
    <View style={styles.gap}>
      <View style={[ui.panel, styles.playerCard]}>
        <Avatar uri={player.avatar} nickname={player.nickname} size={72} />
        <View style={styles.flex}>
          <Text style={styles.playerName} numberOfLines={1}>
            {player.nickname || "Jucător FACEIT"}
          </Text>
          <Text style={styles.playerGame}>COUNTER-STRIKE 2 // FACEIT</Text>
          <View style={styles.rankRow}>
            <View style={styles.rankBox}>
              <Text style={styles.rankLabel}>NIVEL</Text>
              <Text style={styles.rankValue}>{formatNumber(player.level)}</Text>
            </View>
            <View style={styles.rankBox}>
              <Text style={styles.rankLabel}>ELO</Text>
              <Text style={styles.rankValue}>{formatNumber(player.elo ?? stats.elo)}</Text>
            </View>
          </View>
        </View>
      </View>

      <SectionTitle>STATISTICI GLOBALE</SectionTitle>
      <View style={styles.grid}>
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </View>

      <SectionTitle>ULTIMELE MECIURI</SectionTitle>
      {data.matches.length === 0 && (
        <Text style={styles.muted}>Nu există meciuri recente disponibile.</Text>
      )}
      {data.matches.map((match, index) => {
        const win = match.result === "win";

        return (
          <Pressable
            key={match.matchId || `${match.date}-${index}`}
            disabled={!match.matchId}
            onPress={() => router.push({ pathname: "/match/[id]", params: { id: match.matchId } })}
            style={({ pressed }) => [
              ui.panel,
              styles.matchCard,
              { borderColor: win ? colors.winBorder : colors.lossBorder },
              pressed && { backgroundColor: win ? colors.winBg : colors.lossBg },
            ]}
          >
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>{match.map || "Hartă necunoscută"}</Text>
              <Text
                style={[
                  styles.result,
                  win
                    ? { color: colors.winText, borderColor: colors.winBorder, backgroundColor: colors.winBg }
                    : { color: colors.lossText, borderColor: colors.lossBorder, backgroundColor: colors.lossBg },
                ]}
              >
                {win ? "Victorie" : "Înfrângere"}
              </Text>
            </View>
            <Text style={styles.matchLine}>Jucat la: {formatMatchDate(match.date)}</Text>
            <Text style={styles.matchLine}>Scor: {match.score || "Indisponibil"}</Text>
            <Text style={styles.matchLine}>
              K/D/A: {match.kills ?? "—"} / {match.deaths ?? "—"} / {match.assists ?? "—"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SearchScreen() {
  const { playerData, setPlayerData } = usePlayer();
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leaderboards, setLeaderboards] = useState({
    EU: { items: [], loading: true, error: "" },
    NA: { items: [], loading: true, error: "" },
  });

  useEffect(() => {
    let isActive = true;

    Promise.all(
      REGIONS.map((region) =>
        fetchLeaderboard(region)
          .then((items) => ({ region, items, error: "" }))
          .catch(() => ({ region, items: [], error: "Clasamentul nu a putut fi încărcat." }))
      )
    ).then((results) => {
      if (!isActive) return;
      const next = {};
      for (const r of results) next[r.region] = { items: r.items, loading: false, error: r.error };
      setLeaderboards(next);
    });

    return () => {
      isActive = false;
    };
  }, []);

  async function handleSearch() {
    const clean = nickname.trim();
    if (!clean || loading) return;

    setLoading(true);
    setError("");
    setPlayerData(null);

    try {
      setPlayerData(await fetchAllPlayerData(clean));
    } catch {
      setError("Jucătorul nu a fost găsit. Verifică nickname-ul sau conexiunea!");
    } finally {
      setLoading(false);
    }
  }

  function resetToHome() {
    setNickname("");
    setPlayerData(null);
    setError("");
  }

  const showEmpty = !loading && !error && !playerData;

  return (
    <Screen onLogoPress={resetToHome}>
      <SearchBar
        label="NICKNAME FACEIT"
        value={nickname}
        onChangeText={setNickname}
        onSubmit={handleSearch}
        loading={loading}
        placeholder="INTRODU NICKNAME..."
      />

      {loading && <Loading text="Se încarcă datele jucătorului..." />}
      {error ? <ErrorCard text={error} /> : null}

      {showEmpty && (
        <View style={styles.gap}>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>
              ANALIZEAZĂ-ȚI <Text style={ui.pink}>PERFORMANȚA</Text>
            </Text>
            <Text style={styles.heroText}>
              Introdu un nickname pentru a vedea statisticile FACEIT.
            </Text>
          </View>
          {REGIONS.map((region) => (
            <LeaderboardCard key={region} region={region} data={leaderboards[region]} />
          ))}
        </View>
      )}

      {playerData && !loading && <PlayerDashboard data={playerData} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { gap: 14 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  muted: { color: colors.muted, fontFamily: fonts.text, fontSize: 15 },
  cardTitle: { color: colors.text, fontFamily: fonts.title, fontSize: 14, letterSpacing: 1 },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.pinkSoft,
    color: colors.pink,
    fontFamily: fonts.title,
    fontSize: 9,
    overflow: "hidden",
  },
  leaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  rank: { width: 30, color: colors.pink, fontFamily: fonts.title, fontSize: 13 },
  leaderName: { flex: 1, color: colors.text, fontFamily: fonts.textBold, fontSize: 16 },
  leaderElo: { color: colors.muted, fontFamily: fonts.textSemi, fontSize: 14 },
  hero: { alignItems: "center", gap: 6, paddingVertical: 8 },
  heroTitle: { color: colors.text, fontFamily: fonts.titleBlack, fontSize: 18, textAlign: "center" },
  heroText: { color: colors.muted, fontFamily: fonts.text, fontSize: 15, textAlign: "center" },
  playerCard: { flexDirection: "row", alignItems: "center", gap: 14 },
  playerName: { color: colors.text, fontFamily: fonts.titleBlack, fontSize: 18 },
  playerGame: { color: colors.muted, fontFamily: fonts.textSemi, fontSize: 12, marginTop: 2 },
  rankRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  rankBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.pinkSoft,
    borderRadius: 6,
    backgroundColor: colors.pinkFaint,
  },
  rankLabel: { color: colors.muted, fontFamily: fonts.title, fontSize: 9 },
  rankValue: { color: colors.pink, fontFamily: fonts.titleBlack, fontSize: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { width: "48%", flexGrow: 1, gap: 4 },
  statTitle: { color: colors.muted, fontFamily: fonts.title, fontSize: 10, letterSpacing: 1 },
  statValue: { color: colors.text, fontFamily: fonts.titleBlack, fontSize: 22 },
  statDesc: { color: colors.muted, fontFamily: fonts.text, fontSize: 13 },
  matchCard: { gap: 4 },
  result: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 4,
    fontFamily: fonts.textBold,
    fontSize: 13,
    overflow: "hidden",
  },
  matchLine: { color: colors.muted, fontFamily: fonts.textSemi, fontSize: 15 },
});
