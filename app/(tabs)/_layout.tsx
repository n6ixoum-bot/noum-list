import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { BRAND } from "@/constants/brand";
import { Platform } from "react-native";
import { useLocale } from "@/lib/locale-provider";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useLocale();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BRAND.primary,
        tabBarInactiveTintColor: BRAND.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: BRAND.surface,
          borderTopColor: BRAND.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home"),
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons size={size} name="home-variant-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: t("library"),
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons size={size} name="bookshelf" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: t("notes"),
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons size={size} name="brain" color={color} />,
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: t("focus"),
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons size={size} name="timer-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t("stats"),
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons size={size} name="chart-donut-variant" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings"),
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons size={size} name="cog-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
