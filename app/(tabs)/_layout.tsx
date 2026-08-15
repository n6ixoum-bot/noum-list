import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { BRAND } from "@/constants/brand";
import { Platform } from "react-native";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
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
          title: "الرئيسية",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons size={size} name="home-variant-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "مكتبتي",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons size={size} name="bookshelf" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "إحصائيات",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons size={size} name="chart-donut-variant" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "الإعدادات",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons size={size} name="cog-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
