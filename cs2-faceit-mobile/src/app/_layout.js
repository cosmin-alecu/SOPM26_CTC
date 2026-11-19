import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { Orbitron_700Bold, Orbitron_900Black } from "@expo-google-fonts/orbitron";
import {
  Rajdhani_500Medium,
  Rajdhani_600SemiBold,
  Rajdhani_700Bold,
} from "@expo-google-fonts/rajdhani";
import { useFonts } from "expo-font";
import { PlayerProvider } from "../PlayerContext";
import { colors, fonts } from "../theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Orbitron_700Bold,
    Orbitron_900Black,
    Rajdhani_500Medium,
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <PlayerProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.bg },
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.pink,
          headerTitleStyle: { fontFamily: fonts.title, color: colors.text },
          headerTransparent: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="match/[id]"
          options={{ presentation: "modal", title: "DETALII MECI" }}
        />
      </Stack>
    </PlayerProvider>
  );
}
