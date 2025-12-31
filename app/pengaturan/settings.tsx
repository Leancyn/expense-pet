import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function SettingsScreen() {
  const router = useRouter();

  const resetData = async () => {
    Alert.alert("Reset Data", "Apakah kamu yakin ingin menghapus semua data?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Ya, hapus",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          Alert.alert("Data berhasil direset!");
          router.push("/"); // kembali ke home
        },
      },
    ]);
  };

  const sendFeedback = () => {
    const email = "ridhombrk889@gmail.com";
    const subject = encodeURIComponent("Masukan / Bug Expense Pet");
    const body = encodeURIComponent("Halo, saya ingin memberikan masukan atau melaporkan bug:\n\n");
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Settings</Text>

      {/* Card Aplikasi */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Aplikasi</Text>
        <Pressable style={[styles.button, styles.dangerButton]} onPress={resetData}>
          <Text style={styles.buttonText}>Reset Semua Data</Text>
        </Pressable>
      </View>

      {/* Card Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Info</Text>
        <Text style={styles.infoText}>Versi: 1.0.0</Text>
        <Text style={styles.infoText}>Expense Pet © 2025</Text>
        <Text style={styles.infoText}>Created by: Leancyn</Text>
      </View>

      {/* Feedback di bawah */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Masukan & Bug</Text>
        <Pressable style={[styles.button, styles.primaryButton]} onPress={sendFeedback}>
          <Text style={styles.buttonText}>Kirim Masukan / Laporkan Bug</Text>
        </Pressable>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Pressable onPress={() => router.back()} style={[styles.button, { backgroundColor: "#3b82f6" }]}>
          <Text style={styles.buttonText}>Kembali</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fefce8", // background cerah
    flexGrow: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6b7280",
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 4,
    borderColor: "#000",
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 8,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: "#000",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: "#22c55e",
  },
  dangerButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
