import AsyncStorage from "@react-native-async-storage/async-storage";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import AppHeader from "components/AppHeader";
import * as Notifications from "expo-notifications";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export const unstable_settings = { anchor: "(tabs)" };

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const type = notification.request.content.data?.type;
    const today = new Date().toISOString().slice(0, 10);

    if (!type) {
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      };
    }

    const key = `last_notif_${type}`;
    const lastDate = await AsyncStorage.getItem(key);

    if (lastDate === today) {
      // ⛔ suppress duplicate
      return {
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false,
      };
    }

    await AsyncStorage.setItem(key, today);

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

async function registerForNotifications() {
  const { status } = await Notifications.getPermissionsAsync();

  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== "granted") return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

export default function RootLayout() {
  const theme = DefaultTheme;
  const pathname = usePathname();
  const showHeader = pathname !== "/pengaturan/settings";

  useEffect(() => {
    registerForNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme}>
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          {showHeader && <AppHeader />}
          <View style={styles.container}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="modal" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </View>
          <StatusBar style="dark" />
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  container: { flex: 1 },
});
