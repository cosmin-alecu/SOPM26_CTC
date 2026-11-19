import { useEffect, useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { fetchAllPlayerData } from "../../api";
import { usePlayer } from "../../PlayerContext";
import { colors, fonts } from "../../theme";
import { formatMapName, formatNumber, formatPercent } from "../../utils";
import {
  Avatar,
  ErrorCard,
  InfoCard,
  Loading,
  Screen,
  SearchBar,
} from "../../components/ui";

const SORT_OPTIONS = [
  { value: "matches", label: "Meciuri" },
  { value: "winRate", label: "Win rate" },
  { value: "kdRatio", label: "K/D" },
  { value: "headshotPercent", label: "HS %" },
];

// Hărțile cu prea puține meciuri nu sunt luate în calcul pentru cea mai bună / slabă hartă
const MIN_MATCHES_FOR_HIGHLIGHT = 3;

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : -Infinity;
}

function MapCard({ map, tag }) {
  const stats = [
    ["MECIURI", formatNumber(map.matches)],
    ["WIN RATE", formatPercent(map.winRate)],
    ["K/D", formatNumber(map.kdRatio, 2)],
    ["HS %", formatPercent(map.headshotPercent)],
  ];
  const tagColors =
    tag === "best"
      ? { color: colors.winText, borderColor: colors.winBorder, backgroundColor: colors.winBg }
      : { color: colors.lossText, borderColor: colors.lossBorder, backgroundColor: colors.lossBg };

  return (
    <View
      style={[
        styles.mapCard,
        tag === "best" && { borderColor: colors.winBorder },
        tag === "worst" && { borderColor: colors.lossBorder },
      ]}
    >
      <ImageBackground
        source={map.image ? { uri: map.image } : undefined}
        style={styles.banner}
        resizeMode="cover"
      >
        <View style={styles.bannerShade} />
        <Text style={styles.mapName}>{formatMapName(map.name)}</Text>
        {tag ? (
          <Text style={[styles.tag, tagColors]}>
            {tag === "best" ? "CEA MAI BUNĂ" : "CEA MAI SLABĂ"}
          </Text>
        ) : null}
      </ImageBackground>

      <View style={styles.statsRow}>
        {stats.map(([label, value]) => (
          <View key={label} style={styles.statCell}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.bar}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.min(100, Math.max(0, Number(map.winRate) || 0))}%` },
          ]}
        />
      </View>
    </View>
  );
}

export default function MapsScreen() {
  const { playerData, setPlayerData } = usePlayer();
  const [nickname, setNickname] = useState(playerData?.player?.nickname || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("matches");

  // Dacă jucătorul a fost căutat în alt tab, completează câmpul
  useEffect(() => {
    if (playerData?.player?.nickname) setNickname(playerData.player.nickname);
  }, [playerData?.player?.nickname]);

  async function handleSearch() {
    const clean = nickname.trim();
    if (!clean || loading) return;

    setLoading(true);
    setError("");

    try {
      setPlayerData(await fetchAllPlayerData(clean));
    } catch {
      setError("Jucătorul nu a fost găsit. Verifică nickname-ul sau conexiunea!");
    } finally {
      setLoading(false);
    }
  }

  const maps = playerData?.maps || [];
  const sortedMaps = [...maps].sort((a, b) => toNumber(b[sortBy]) - toNumber(a[sortBy]));
  const byWinRate = maps
    .filter((m) => toNumber(m.matches) >= MIN_MATCHES_FOR_HIGHLIGHT)
    .sort((a, b) => toNumber(b.winRate) - toNumber(a.winRate));
  const bestMap = byWinRate[0]?.name;
  const worstMap = byWinRate.length > 1 ? byWinRate.at(-1).name : null;
  const player = playerData?.player;

  return (
    <Screen>
      <SearchBar
        label="STATISTICI PE HĂRȚI"
        value={nickname}
        onChangeText={setNickname}
        onSubmit={handleSearch}
        loading={loading}
        placeholder="INTRODU NICKNAME..."
      />

      {loading && <Loading text="Se încarcă statisticile pe hărți..." />}
      {error ? <ErrorCard text={error} /> : null}
      {!loading && !error && !player && (
        <InfoCard text="Caută un jucător pentru a vedea performanța lui pe fiecare hartă." />
      )}

      {!loading && player && (
        <View style={styles.gap}>
          <View style={styles.playerRow}>
            <Avatar uri={player.avatar} nickname={player.nickname} size={40} />
            <Text style={styles.heading} numberOfLines={1}>
              HĂRȚI // {player.nickname}
            </Text>
          </View>

          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>SORTEAZĂ:</Text>
            {SORT_OPTIONS.map((option) => {
              const active = sortBy === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setSortBy(option.value)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {sortedMaps.length > 0 ? (
            sortedMaps.map((map) => (
              <MapCard
                key={map.name}
                map={map}
                tag={map.name === bestMap ? "best" : map.name === worstMap ? "worst" : ""}
              />
            ))
          ) : (
            <InfoCard text="Nu există statistici pe hărți pentru acest jucător." />
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 14 },
  playerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  heading: { flex: 1, color: colors.text, fontFamily: fonts.title, fontSize: 15, letterSpacing: 1 },
  sortRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
  sortLabel: { color: colors.muted, fontFamily: fonts.title, fontSize: 10, marginRight: 2 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.pinkSoft,
    borderRadius: 14,
    backgroundColor: colors.panel,
  },
  chipActive: { backgroundColor: colors.pink, borderColor: colors.pink },
  chipText: { color: colors.text, fontFamily: fonts.textBold, fontSize: 13 },
  chipTextActive: { color: "#fff" },
  mapCard: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: 9,
    backgroundColor: colors.panel,
  },
  banner: {
    height: 84,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#1a1220",
  },
  bannerShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  mapName: { color: "#fff", fontFamily: fonts.titleBlack, fontSize: 17, letterSpacing: 1 },
  tag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 4,
    fontFamily: fonts.title,
    fontSize: 9,
    overflow: "hidden",
  },
  statsRow: { flexDirection: "row", paddingVertical: 10 },
  statCell: { flex: 1, alignItems: "center", gap: 2 },
  statLabel: { color: colors.muted, fontFamily: fonts.title, fontSize: 9 },
  statValue: { color: colors.text, fontFamily: fonts.textBold, fontSize: 17 },
  bar: { height: 4, backgroundColor: "rgba(255,255,255,0.08)" },
  barFill: { height: "100%", backgroundColor: colors.pink },
});
