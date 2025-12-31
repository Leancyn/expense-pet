import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import AppHeader from "components/AppHeader";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export const unstable_settings = { anchor: "(tabs)" };

export default function RootLayout() {
  const theme = DefaultTheme;
  const pathname = usePathname();
  const showHeader = pathname !== "/pengaturan/settings";

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
