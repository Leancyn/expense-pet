import { addExpense } from "@/storage/expenseStorage";
import { getPet, Pet, savePet, updatePetByExpense } from "@/storage/petStorage";
import { loadWallet, saveWallet } from "@/storage/walletStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, LayoutAnimation, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { handleCriticalPetReminder } from "utils/notifications";

// health constants
export const CRITICAL_HEALTH = 10;
const HAPPY_HEALTH = 60;
const HEALTH_DECAY_PER_HOUR = 10;
const MIN_HEALTH = 0;
const MAX_HEALTH = 100;
const DAILY_MIN_HEALTH = CRITICAL_HEALTH;

// health decay
const LAST_DECAY_KEY = "pet_last_decay";
const LAST_HEALTH_UPDATE_KEY = "lastHealthUpdate";

// modal & reminder keys
export const CRITICAL_MODAL_KEY = "criticalPetModalShown";
export const CRITICAL_REMINDER_KEY = "criticalPetReminderScheduled";

export const allPets = [
  { id: "1", name: "Kucing", price: 50, asset: require("../../assets/pets/cat.gif") },
  { id: "2", name: "Panda", price: 70, asset: require("../../assets/pets/panda.gif") },
  { id: "3", name: "Alpaca", price: 40, asset: require("../../assets/pets/alpaca.gif") },
  { id: "4", name: "Axolotl", price: 80, asset: require("../../assets/pets/axolotl.gif") },
  { id: "5", name: "Kepiting", price: 100, asset: require("../../assets/pets/crab.gif") },
  { id: "6", name: "Unicorn", price: 120, asset: require("../../assets/pets/unicorn.gif") },
  { id: "7", name: "Lochness", price: 150, asset: require("../../assets/pets/loch-ness-monster.gif") },
];

export default function ExpensePetScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [pet, setPet] = useState<Pet>({ health: MAX_HEALTH, level: 1, exp: 0 });
  const [petLoaded, setPetLoaded] = useState(false);
  const [ownedPets, setOwnedPets] = useState<string[]>(["1"]);
  const [activePetId, setActivePetId] = useState("1");
  const [wallet, setWallet] = useState({ coins: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "warning" | "danger">("success");
  const [criticalModalVisible, setCriticalModalVisible] = useState(false);

  // HELPER FUNCTIONS
  const showModal = (type: "success" | "warning" | "danger", title: string, message: string, autoClose = false) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);

    if (autoClose) {
      setTimeout(() => {
        setModalVisible(false);
      }, 1500);
    }
  };

  const modalIcon = () => {
    if (modalType === "success") return require("../../assets/modal-icons/success.gif");
    if (modalType === "warning") return require("../../assets/modal-icons/warning.gif");
    return require("../../assets/modal-icons/warning.gif");
  };

  const healthAnim = useRef(new Animated.Value(pet.health)).current;

  const loadPetData = useCallback(async () => {
    let petData: Pet | null = await getPet();

    // jika first install / petData kosong
    if (!petData) {
      petData = {
        health: MAX_HEALTH, // langsung sekarat
        level: 1, // level awal
        exp: 0, // experience awal
      };
      await AsyncStorage.setItem("pet", JSON.stringify(petData));
    }

    setPet(petData);

    // ambil owned pets
    const petsJson = await AsyncStorage.getItem("ownedPets");
    const pets: string[] = petsJson ? JSON.parse(petsJson) : ["1"];
    setOwnedPets(pets);

    // ambil active pet
    const savedActivePet = await AsyncStorage.getItem("activePetId");
    const activeId = savedActivePet && pets.includes(savedActivePet) ? savedActivePet : "1";
    setActivePetId(activeId);

    setPetLoaded(true);
  }, []);

  const loadWalletData = useCallback(async () => {
    const w = await loadWallet();
    setWallet(w);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPetData();
      loadWalletData();
    }, [loadPetData, loadWalletData])
  );

  useEffect(() => {
    if (!petLoaded) return;

    if (pet.health <= CRITICAL_HEALTH) {
      setModalType("danger");
      setModalTitle("Pet Sekarat");
      setModalMessage("Pet kamu dalam kondisi kritis. Segera rawat agar tidak mati.");
      setModalVisible(true);
    }
  }, [pet.health, petLoaded]);

  // notif critical pet reminder
  useEffect(() => {
    if (!petLoaded) return;
    handleCriticalPetReminder(pet.health);
  }, [pet.health, petLoaded]);

  useEffect(() => {
    Animated.timing(healthAnim, {
      toValue: pet.health,
      duration: 800,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [pet.health]);

  const submitExpense = async () => {
    if (!name || !amount) {
      showModal("warning", "Data belum lengkap", "Isi semua field terlebih dahulu");
      return;
    }

    const expenseAmount = parseInt(amount);

    await addExpense({
      id: Date.now().toString(),
      name,
      title: name,
      amount: expenseAmount,
      date: new Date().toISOString(),
    });

    const newPet = await updatePetByExpense(expenseAmount);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPet(newPet);

    const coinsEarned = Math.floor(expenseAmount / 10000);
    const newWallet = { coins: wallet.coins + coinsEarned };
    await saveWallet(newWallet);
    setWallet(newWallet);

    setName("");
    setAmount("");

    showModal("success", "Berhasil", "Pengeluaran berhasil disimpan", true);
  };

  const activePetAsset = allPets.find((p) => p.id === activePetId)?.asset;

  const healthWidth = healthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const healthColor = healthAnim.interpolate({
    inputRange: [0, CRITICAL_HEALTH, 50, 80, 100],
    outputRange: ["#ef4444", "#f97316", "#facc15", "#22c55e", "#22c55e"],
  });

  // Cek apakah sudah lewat tengah malam
  const hasPassedMidnight = (last: number, now: number) => {
    const lastDate = new Date(last);
    const nowDate = new Date(now);

    return lastDate.getFullYear() !== nowDate.getFullYear() || lastDate.getMonth() !== nowDate.getMonth() || lastDate.getDate() !== nowDate.getDate();
  };

  // Health decay setiap beberapa waktu
  const applyHealthDecay = async (pet: Pet): Promise<Pet> => {
    const now = Date.now();
    const lastUpdateStr = await AsyncStorage.getItem(LAST_HEALTH_UPDATE_KEY);

    // first run
    if (!lastUpdateStr) {
      await AsyncStorage.setItem(LAST_HEALTH_UPDATE_KEY, now.toString());
      return pet;
    }

    const lastUpdate = Number(lastUpdateStr);
    let updatedPet = { ...pet };

    // hourly decay
    const hoursPassed = Math.floor((now - lastUpdate) / (1000 * 60 * 60));
    if (hoursPassed > 0) {
      updatedPet.health = Math.max(updatedPet.health - hoursPassed * HEALTH_DECAY_PER_HOUR, MIN_HEALTH);
    }

    // midnight rule (once per day)
    if (hasPassedMidnight(lastUpdate, now)) {
      if (updatedPet.health > DAILY_MIN_HEALTH) {
        updatedPet.health = DAILY_MIN_HEALTH;
      }
    }

    // save only if changed
    if (updatedPet.health !== pet.health) {
      await savePet(updatedPet);
    }

    await AsyncStorage.setItem(LAST_HEALTH_UPDATE_KEY, now.toString());
    return updatedPet;
  };

  useEffect(() => {
    if (!petLoaded || !pet) return;

    const run = async () => {
      const updatedPet = await applyHealthDecay(pet);
      setPet(updatedPet);
    };

    run();
  }, [petLoaded]);

  // REF animasi coin bertambah
  const coinAddAnim = useRef(new Animated.Value(0)).current;

  // Trigger animasi setiap wallet bertambah
  const firstLoad = useRef(true);

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return; // skip animasi pertama kali
    }

    coinAddAnim.setValue(0);
    Animated.timing(coinAddAnim, {
      toValue: 1,
      duration: 2200, // diperlambat
      useNativeDriver: true,
    }).start();
  }, [wallet.coins]);

  // Style animasi coin bertambah
  const coinAddAnimStyle = {
    transform: [
      { translateY: coinAddAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -30] }) },
      { translateX: coinAddAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 30] }) }, // geser ke kanan
    ],
    opacity: coinAddAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] }),
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#d9f0ff" }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16, paddingHorizontal: 16, flexGrow: 1 }}
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      keyboardOpeningTime={0}
      scrollEnabled={false}
      extraScrollHeight={Platform.OS === "ios" ? 80 : 20}
    >
      {/* Pet Card */}
      {/* Pet Card */}
      <View style={styles.petCard}>
        {/* Nama pet */}
        <View style={styles.petNameWrapper}>
          <Text style={styles.petNameText}>{allPets.find((p) => p.id === activePetId)?.name}</Text>
          <Text style={styles.petLevelText}>
            Lv {pet.level} {/* ambil dari state pet */}
          </Text>
        </View>

        {/* Status pet */}
        <View style={styles.petStatusWrapper}>
          <Text style={styles.petStatusText}>{pet.health > HAPPY_HEALTH ? "😊 Happy" : pet.health > CRITICAL_HEALTH ? "😐 Lesu" : "😢 Sekarat"}</Text>
        </View>

        {/* Pet image */}
        {activePetAsset && <Image source={activePetAsset} style={styles.petImage} />}

        {/* Animated coin */}
        <Animated.Image source={require("../../assets/images/coin.gif")} style={[styles.coinAddImage, coinAddAnimStyle]} />

        {/* Health & Exp bars */}
        <View style={styles.statsWrapper}>
          {/* Labels */}
          <View style={styles.labelsColumn}>
            <Text style={styles.statLabel}>Health</Text>
            <Text style={styles.statLabel}>Exp</Text>
          </View>

          {/* Bars */}
          <View style={styles.barsColumn}>
            {/* Health bar */}
            <View style={styles.healthBarBackground}>
              <Animated.View style={[styles.healthBarFill, { width: healthWidth, backgroundColor: healthColor }]} />
              <Text style={styles.healthText}>{pet.health}%</Text>
            </View>

            {/* Exp bar */}
            <View style={styles.expBarBackground}>
              <Animated.View style={[styles.expBarFill, { width: `${pet.exp}%`, backgroundColor: "#3b82f6" }]} />
              <Text style={styles.expText}>{pet.exp}%</Text>
            </View>
          </View>
        </View>

        {/* Coin wallet di bawah */}
        <View style={styles.coinRow}>
          <Image source={require("../../assets/images/coin.gif")} style={styles.coinImage} />
          <Text style={styles.walletText}>{wallet.coins}</Text>
        </View>
      </View>

      {/* Expense Card */}
      <View style={styles.expenseCard}>
        <Text style={styles.label}>Nama Pengeluaran</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Contoh: Makan Siang" placeholderTextColor="#9ca3af" style={styles.input} />
        <Text style={styles.label}>Jumlah (IDR)</Text>
        <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Contoh: 50000" placeholderTextColor="#9ca3af" style={styles.input} />
        <Pressable onPress={submitExpense} style={styles.submitButton}>
          <Text style={styles.buttonText}>Simpan Pengeluaran</Text>
        </Pressable>
      </View>
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Image source={modalIcon()} style={styles.modalIcon} />

            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalText}>{modalMessage}</Text>

            {modalType !== "success" && (
              <Pressable style={[styles.modalButton, modalType === "warning" && styles.warningButton, modalType === "danger" && styles.dangerButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>OK</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  coinRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    zIndex: 2,
  },
  coinImage: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
  walletText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
  },

  coinAddImage: {
    width: 24,
    height: 24,
    position: "absolute",
    top: 80, // sesuaikan vertikal supaya sejajar pet image
    left: 220, // kanan pet image
  },

  coinRowWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    position: "relative", // supaya animasi coin bisa absolute
  },

  petCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "#111827",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 1,
    marginTop: -15,
    position: "relative", // penting supaya nama/status bisa absolute
  },

  petLevelText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },

  petNameWrapper: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  petNameText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  petStatusWrapper: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  petStatusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  statsWrapper: {
    flexDirection: "row",
    width: "80%",
    marginTop: 12,
    alignItems: "center",
  },
  labelsColumn: {
    width: 50,
    justifyContent: "space-between",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  barsColumn: {
    flex: 1,
    justifyContent: "space-between",
  },
  expBarBackground: {
    height: 12,
    backgroundColor: "#e5e7eb",
    width: "80%",
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "center",
    marginTop: 6,
  },
  expBarFill: {
    height: "100%",
    position: "absolute",
    left: 0,
  },
  expText: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
    zIndex: 2,
  },

  petImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },

  healthBarWrapper: {
    width: "100%",
    alignItems: "center",
    marginTop: 12,
  },

  healthBarBackground: {
    width: "80%",
    height: 20,
    backgroundColor: "#f3f3f3",
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#000",
    overflow: "hidden",
    justifyContent: "center",
  },

  healthBarFill: {
    height: "100%",
    position: "absolute",
    left: 0,
  },

  healthText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#111827",
    zIndex: 2,
  },
  expenseCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 4,
    borderColor: "#111827",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    marginTop: 2,
  },
  label: { fontSize: 16, color: "#6b7280", marginBottom: 8 },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "#111827",
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    color: "#111827",
  },
  submitButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 4,
    borderBottomWidth: 6,
    borderColor: "#16a34a",
    alignItems: "center",
  },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#111827",
  },

  modalIcon: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
  },

  modalText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 16,
  },

  modalButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },

  warningButton: {
    backgroundColor: "#f59e0b",
  },

  dangerButton: {
    backgroundColor: "#ef4444",
  },

  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
