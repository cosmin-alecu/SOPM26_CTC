import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { fetchAllPlayerData } from "../../api";
import { usePlayer } from "../../PlayerContext";
import { colors, fonts } from "../../theme";
import { formatNumber, formatPercent } from "../../utils";
import {
  Avatar,
  CyberButton,
  ErrorCard,
  InfoCard,
  Loading,
  Screen,
  SearchInput,
  styles as ui,
} from "../../components/ui";

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
  return (
    <View style={styles.playerHeader}>
      <Avatar uri={data.player.avatar} nickname={data.player.nickname} size={60} />
      <Text style={styles.playerName} numberOfLines={1}>
        {data.player.nickname}
      </Text>
    </View>
  );
}

export default function CompareScreen() {
  const { playerData } = usePlayer();
  const [nicknames, setNicknames] = useState([playerData?.player?.nickname || "", ""]);
  const [players, setPlayers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateNickname(index, value) {
    setNicknames((current) => current.map((item, i) => (i === index ? value : item)));
  }

  async function handleCompare() {
    const clean = nicknames.map((item) => item.trim());
    if (clean.some((item) => !item) || loading) return;

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
    <Screen>
      <View style={ui.panel}>
        <Text style={ui.label}>COMPARĂ JUCĂTORI</Text>
        {[0, 1].map((index) => (
          <SearchInput
            key={index}
            icon={String(index + 1)}
            value={nicknames[index]}
            onChangeText={(value) => updateNickname(index, value)}
            onSubmitEditing={handleCompare}
            placeholder={`JUCĂTOR ${index + 1}...`}
            returnKeyType={index === 0 ? "next" : "go"}
          />
        ))}
        <CyberButton
          title={loading ? "SE COMPARĂ..." : "COMPARĂ"}
          onPress={handleCompare}
          disabled={loading}
        />
      </View>

      {loading && <Loading text="Se încarcă cei doi jucători..." />}
      {error ? <ErrorCard text={error} /> : null}
      {!loading && !error && !players && (
        <InfoCard text="Introdu doi jucători pentru a le compara statisticile FACEIT." />
      )}

      {players && (
        <View style={ui.panel}>
          <View style={styles.header}>
            <PlayerHeader data={players[0]} />
            <View style={styles.score}>
              <Text style={[styles.scoreNum, score[0] > score[1] && styles.leading]}>{score[0]}</Text>
              <Text style={styles.vs}>VS</Text>
              <Text style={[styles.scoreNum, score[1] > score[0] && styles.leading]}>{score[1]}</Text>
            </View>
            <PlayerHeader data={players[1]} />
          </View>

          {METRICS.map((metric) => {
            const left = metric.get(players[0]);
            const right = metric.get(players[1]);
            const winner = compareValues(left, right);

            return (
              <View style={styles.row} key={metric.key}>
                <Text style={[styles.value, winner === -1 && styles.better]}>{metric.format(left)}</Text>
                <Text style={styles.metric}>{metric.label}</Text>
                <Text style={[styles.value, styles.right, winner === 1 && styles.better]}>
                  {metric.format(right)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingBottom: 6 },
  playerHeader: { flex: 1, alignItems: "center", gap: 6 },
  playerName: { color: colors.text, fontFamily: fonts.title, fontSize: 12, maxWidth: "100%" },
  score: { flexDirection: "row", alignItems: "center", gap: 8 },
  scoreNum: { color: colors.text, fontFamily: fonts.titleBlack, fontSize: 26 },
  leading: { color: colors.green },
  vs: { color: colors.pink, fontFamily: fonts.title, fontSize: 11 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  value: { flex: 1, color: colors.text, fontFamily: fonts.textBold, fontSize: 17 },
  right: { textAlign: "right" },
  better: { color: colors.green },
  metric: { color: colors.muted, fontFamily: fonts.title, fontSize: 10, textAlign: "center", width: 100 },
});
