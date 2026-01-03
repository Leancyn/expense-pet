import { saveWallet } from "@/storage/walletStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CRITICAL_HEALTH } from "app/(tabs)/pet";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"warning" | "success" | "error">("warning");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const showModal = (type: "warning" | "success" | "error", title: string, message: string, autoClose = false) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);

    if (autoClose) {
      setTimeout(() => setModalVisible(false), 700); // hilang sendiri
    }
  };

  // ================== RESET DATA ==================
  const resetData = () => {
    showModal("warning", "Reset Data", "Apakah kamu yakin ingin menghapus semua data?");
  };

  const confirmReset = async () => {
    await AsyncStorage.clear();

    // DEFAULT SETUP
    await AsyncStorage.setItem("ownedPets", JSON.stringify(["1"]));
    await AsyncStorage.setItem("activePetId", "1");
    await AsyncStorage.setItem(
      "pet",
      JSON.stringify({
        health: CRITICAL_HEALTH,
        level: 1,
        exp: 0,
      })
    );
    await saveWallet({ coins: 0 });

    showModal("success", "Berhasil", "Data berhasil direset!", true);
  };

  // ================== FEEDBACK ==================
  const sendFeedback = async () => {
    const email = "ridhombrk889@gmail.com";
    const subject = encodeURIComponent("Masukan / Bug Expense Pet");
    const body = encodeURIComponent("Halo, saya ingin memberikan masukan atau melaporkan bug:\n\n");
    const url = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        showModal("warning", "Tidak Bisa Membuka Email", `Silakan kirim email ke:\n${email}`);
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      console.log("sendFeedback error:", error);
      showModal("warning", "Terjadi Kesalahan", `Tidak bisa membuka aplikasi email. Silakan kirim email ke:\n${email}`);
    }
  };

  // ================== MODAL ICON ==================
  const modalIcon = () => {
    if (modalType === "success") return require("../../assets/modal-icons/success.gif");
    return require("../../assets/modal-icons/warning.gif");
  };

  return (
    <View style={styles.container}>
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
        <Text style={styles.infoText}>Versi: {Constants.expoConfig?.version}</Text>
        <Text style={styles.infoText}>Build: Production</Text>
        <Text style={styles.infoText}>Platform: {Platform.OS}</Text>

        <View style={styles.divider} />

        <Text style={styles.infoText}>Expense Pet © 2025</Text>
        <Text style={styles.infoText}>Created by: Leancyn</Text>
        <Text style={styles.tagline}>Catat pengeluaran, selamatkan pet kamu</Text>
      </View>

      {/* Card Feedback */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Masukan & Bug</Text>
        <Pressable style={[styles.button, styles.primaryButton]} onPress={sendFeedback}>
          <Text style={styles.buttonText}>Kirim Masukan / Laporkan Bug</Text>
        </Pressable>
      </View>

      {/* Tombol Kembali */}
      <Pressable onPress={() => router.back()} style={[styles.button, { backgroundColor: "#3b82f6" }]}>
        <Text style={styles.buttonText}>Kembali</Text>
      </Pressable>

      {/* Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Image source={modalIcon()} style={styles.modalIcon} />
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalText}>{modalMessage}</Text>

            {/* RESET DATA CONFIRM */}
            {modalType === "warning" && modalTitle === "Reset Data" && (
              <View style={styles.modalButtonRow}>
                <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalButtonText}>Batal</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, styles.dangerButton]} onPress={confirmReset}>
                  <Text style={styles.modalButtonText}>Ya, Hapus</Text>
                </Pressable>
              </View>
            )}

            {/* GENERAL CLOSE BUTTON */}
            {modalType !== "success" && modalTitle !== "Reset Data" && (
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Tutup</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fefce8", flex: 1, justifyContent: "center" },
  header: { fontSize: 28, fontWeight: "bold", color: "#6b7280", marginBottom: 14, marginTop: -30, textAlign: "center" },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 4,
    borderColor: "#000",
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTitle: { fontSize: 20, fontWeight: "700", color: "#374151", marginBottom: 12 },
  infoText: { fontSize: 16, color: "#6b7280", marginBottom: 8 },
  tagline: { marginTop: 6, fontSize: 12, color: "#9ca3af", textAlign: "center" },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 10, width: "100%" },
  button: {
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: "#000",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    marginVertical: 8,
  },
  primaryButton: { backgroundColor: "#22c55e" },
  dangerButton: { backgroundColor: "#ef4444" },
  successButton: { backgroundColor: "#22c55e" },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    borderWidth: 4,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    alignItems: "center",
  },
  modalIcon: { width: 48, height: 48, marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#374151", textAlign: "center" },
  modalText: { fontSize: 16, color: "#6b7280", textAlign: "center", marginBottom: 12 },
  modalButtonRow: { flexDirection: "row", justifyContent: "center", width: "100%" },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: "#000",
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  cancelButton: { backgroundColor: "#9ca3af" },
  modalButtonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
});
