import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme";
import { getFallbackAvatar } from "../utils";

// Fundalul FACEIT cu un strat întunecat, comun tuturor ecranelor
export function Screen({ children, onLogoPress }) {
  return (
    <ImageBackground
      source={require("../../assets/faceit-bg.png")}
      style={styles.flex}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.flex} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Header onLogoPress={onLogoPress} />
          {children}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

function Header({ onLogoPress }) {
  return (
    <Pressable
      style={styles.header}
      onPress={onLogoPress}
      disabled={!onLogoPress}
      accessibilityRole="button"
      accessibilityLabel="Înapoi la pagina principală"
    >
      <Image source={require("../../assets/logo.png")} style={styles.logo} />
      <Text style={styles.brand}>
        CS2 FACEIT <Text style={styles.pink}>TRACKER</Text>
      </Text>
    </Pressable>
  );
}

// Câmp de căutare + buton, folosit pe toate paginile
export function SearchBar({ label, value, onChangeText, onSubmit, loading, placeholder, buttonText }) {
  return (
    <View style={styles.panel}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <SearchInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        icon="⌕"
      />
      <CyberButton
        title={loading ? "SE CAUTĂ..." : buttonText || "CAUTĂ"}
        onPress={onSubmit}
        disabled={loading}
      />
    </View>
  );
}

export function SearchInput({ icon, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.inputWrapper, focused && styles.inputFocused]}>
      <Text style={styles.inputIcon}>{icon}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
    </View>
  );
}

export function CyberButton({ title, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

export function Loading({ text }) {
  return (
    <View style={[styles.panel, styles.stateCard]}>
      <ActivityIndicator size="large" color={colors.pink} />
      <Text style={styles.stateText}>{text}</Text>
    </View>
  );
}

export function ErrorCard({ text }) {
  return (
    <View style={[styles.panel, styles.stateCard, styles.errorCard]}>
      <Text style={styles.errorIcon}>!</Text>
      <Text style={styles.stateText}>{text}</Text>
    </View>
  );
}

export function InfoCard({ text }) {
  return (
    <View style={[styles.panel, styles.stateCard]}>
      <Text style={styles.stateText}>{text}</Text>
    </View>
  );
}

export function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

// Avatar cu imagine de rezervă dacă cea de la FACEIT nu se încarcă
export function Avatar({ uri, nickname, size = 64, style }) {
  const [failed, setFailed] = useState(false);
  const source = !uri || failed ? getFallbackAvatar(nickname) : uri;

  return (
    <Image
      source={{ uri: source }}
      onError={() => setFailed(true)}
      style={[
        { width: size, height: size, borderRadius: 8, borderWidth: 1, borderColor: colors.pink },
        style,
      ]}
    />
  );
}

export const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(5, 4, 8, 0.72)" },
  scroll: { padding: 16, paddingBottom: 32, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  logo: { width: 52, height: 52 },
  brand: { flex: 1, color: colors.text, fontFamily: fonts.titleBlack, fontSize: 19, letterSpacing: 1.2 },
  pink: { color: colors.pink },
  panel: {
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: 9,
    backgroundColor: colors.panel,
  },
  label: { color: "#ddd5df", fontFamily: fonts.title, fontSize: 11, letterSpacing: 1 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.pinkSoft,
    borderRadius: 7,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  inputFocused: { borderColor: colors.pink },
  inputIcon: { width: 24, color: colors.pink, fontSize: 20, fontFamily: fonts.textBold },
  input: { flex: 1, height: "100%", color: colors.text, fontFamily: fonts.textSemi, fontSize: 16 },
  button: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    backgroundColor: colors.pink,
  },
  buttonPressed: { opacity: 0.8 },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { color: "#fff", fontFamily: fonts.title, fontSize: 13, letterSpacing: 1.5 },
  stateCard: { alignItems: "center", paddingVertical: 24 },
  errorCard: { borderColor: colors.lossBorder },
  errorIcon: {
    width: 34,
    height: 34,
    lineHeight: 32,
    textAlign: "center",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.lossText,
    color: colors.lossText,
    fontFamily: fonts.titleBlack,
    fontSize: 16,
  },
  stateText: { color: colors.text, fontFamily: fonts.textSemi, fontSize: 16, textAlign: "center" },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.title,
    fontSize: 15,
    letterSpacing: 1.2,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.pink,
  },
});
