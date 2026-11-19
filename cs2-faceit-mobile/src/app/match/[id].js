import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { fetchMatchDetails } from "../../api";
import { colors, fonts } from "../../theme";
import { Avatar, ErrorCard, InfoCard, Loading, styles as ui } from "../../components/ui";

const COLUMNS = [
  { key: "Kills", label: "K" },
  { key: "Assists", label: "A" },
  { key: "Deaths", label: "D" },
  { key: "K/R Ratio", label: "K/R" },
  { key: "Headshots", label: "HS" },
];

function TeamSection({ team, details }) {
  const teamStats = team.team_stats || {};
  const isWinner = teamStats["Team Win"] === "1";
  const teamId = String(team.team_id || "");
  const teamNames = details.teamNames || {};
  const teamName = teamNames[teamId] || teamNames[teamId.toLowerCase()] || "Nume echipă indisponibil";
  const status = isWinner
    ? { color: colors.winText, borderColor: colors.winBorder, backgroundColor: colors.winBg }
    : { color: colors.lossText, borderColor: colors.lossBorder, backgroundColor: colors.lossBg };

  return (
    <View style={[ui.panel, { borderColor: status.borderColor }]}>
      <View style={styles.teamHeader}>
        <Text style={styles.teamName} numberOfLines={1}>
          {teamName}
        </Text>
        <Text style={styles.score}>{teamStats["Final Score"] || "—"}</Text>
        <Text style={[styles.status, status]}>{isWinner ? "VICTORIE" : "ÎNFRÂNGERE"}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={[styles.th, styles.playerCol]}>JUCĂTOR</Text>
        {COLUMNS.map((c) => (
          <Text key={c.key} style={[styles.th, styles.numCol]}>
            {c.label}
          </Text>
        ))}
      </View>

      {(team.players || []).map((player) => {
        const info = details.players?.[player.player_id] || {};
        const stats = player.player_stats || {};

        return (
          <View style={[styles.tableRow, styles.bodyRow]} key={player.player_id || player.nickname}>
            <View style={[styles.playerCol, styles.playerCell]}>
              <Avatar uri={info.avatar} nickname={player.nickname} size={28} style={{ borderRadius: 5 }} />
              <View style={styles.flex}>
                <Text style={styles.nick} numberOfLines={1}>
                  {player.nickname}
                </Text>
                <Text style={styles.level}>LVL {info.level || "—"}</Text>
              </View>
            </View>
            {COLUMNS.map((c) => (
              <Text key={c.key} style={[styles.td, styles.numCol]}>
                {stats[c.key] ?? "—"}
              </Text>
            ))}
          </View>
        );
      })}
    </View>
  );
}

export default function MatchScreen() {
  const { id } = useLocalSearchParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let isActive = true;

    setLoading(true);
    setError("");
    fetchMatchDetails(id)
      .then((result) => isActive && setDetails(result))
      .catch(() => isActive && setError("Nu s-au putut încărca detaliile acestui meci."))
      .finally(() => isActive && setLoading(false));

    return () => {
      isActive = false;
    };
  }, [id]);

  const rawTeams = details?.stats?.rounds?.[0]?.teams || [];
  const teams = Array.isArray(rawTeams) ? rawTeams : Object.values(rawTeams);

  return (
    <ScrollView style={ui.flex} contentContainerStyle={ui.scroll}>
      {loading && <Loading text="Se încarcă detaliile meciului..." />}
      {!loading && error ? <ErrorCard text={error} /> : null}
      {!loading && !error && teams.length === 0 && (
        <InfoCard text="Nu sunt disponibile statistici pentru acest meci." />
      )}
      {!loading &&
        !error &&
        teams.map((team, index) => (
          <TeamSection key={team.team_id || index} team={team} details={details} />
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  teamHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  teamName: { flex: 1, color: colors.text, fontFamily: fonts.title, fontSize: 13 },
  score: { color: colors.text, fontFamily: fonts.titleBlack, fontSize: 15 },
  status: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 4,
    fontFamily: fonts.title,
    fontSize: 9,
    overflow: "hidden",
  },
  tableRow: { flexDirection: "row", alignItems: "center" },
  bodyRow: { paddingVertical: 6, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  playerCol: { flex: 1, minWidth: 0 },
  numCol: { width: 36, textAlign: "center" },
  th: { color: colors.muted, fontFamily: fonts.title, fontSize: 9 },
  td: { color: colors.text, fontFamily: fonts.textBold, fontSize: 15 },
  playerCell: { flexDirection: "row", alignItems: "center", gap: 6 },
  nick: { color: colors.text, fontFamily: fonts.textBold, fontSize: 14 },
  level: { color: colors.pink, fontFamily: fonts.textSemi, fontSize: 11 },
});
