import { useRouter } from "expo-router";
import { Settings } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function AppHeader() {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Text style={styles.appName}>Expense Pet</Text>
      <Pressable style={styles.iconButton} onPress={() => router.push("/pengaturan/settings")}>
        <View>
          <Settings color="#2f95dc" size={24} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff", // header putih
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb", // abu-abu terang
  },
  appName: {
    color: "#6b7280", // teks abu-abu
    fontSize: 24,
    fontWeight: "bold",
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6", // tombol abu-abu terang
  },
});
