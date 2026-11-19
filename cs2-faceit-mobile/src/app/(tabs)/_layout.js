import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, fonts } from "../../theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.pink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.panelBorder,
        },
        tabBarLabelStyle: { fontFamily: fonts.title, fontSize: 10, letterSpacing: 0.8 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "CĂUTARE",
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="maps"
        options={{
          title: "HĂRȚI",
          tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: "COMPARĂ",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="git-compare" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
