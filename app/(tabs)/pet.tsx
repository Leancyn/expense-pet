import { addExpense } from "@/storage/expenseStorage";
import { getPet, updatePetByExpense } from "@/storage/petStorage";
import { loadWallet, saveWallet } from "@/storage/walletStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, LayoutAnimation, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const allPets = [
  { id: "1", name: "Kucing", price: 50, asset: require("../../assets/pets/cat.gif") },
  { id: "2", name: "Panda", price: 70, asset: require("../../assets/pets/panda.gif") },
  { id: "3", name: "Alpaca", price: 40, asset: require("../../assets/pets/alpaca.gif") },
  { id: "4", name: "Axolotl", price: 80, asset: require("../../assets/pets/axolotl.gif") },
  { id: "5", name: "Kepiting", price: 100, asset: require("../../assets/pets/crab.gif") },
  { id: "6", name: "Unicorn", price: 120, asset: require("../../assets/pets/unicorn.gif") },
  { id: "7", name: "Monster Lochness", price: 150, asset: require("../../assets/pets/loch-ness-monster.gif") },
];

export default function ExpensePetScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [pet, setPet] = useState({ health: 100 });
  const [ownedPets, setOwnedPets] = useState<string[]>(["1"]);
  const [activePetId, setActivePetId] = useState("1");
  const [wallet, setWallet] = useState({ coins: 0 });

  const healthAnim = useRef(new Animated.Value(pet.health)).current;

  const loadPetData = useCallback(async () => {
    const petData = await getPet();
    setPet(petData);

    const petsJson = await AsyncStorage.getItem("ownedPets");
    const pets: string[] = petsJson ? JSON.parse(petsJson) : ["1"];
    setOwnedPets(pets);

    if (!pets.includes(activePetId)) setActivePetId("1");
  }, [activePetId]);

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
    Animated.timing(healthAnim, {
      toValue: pet.health,
      duration: 800,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [pet.health]);

  const submitExpense = async () => {
    if (!name || !amount) return alert("Isi semua field");

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
  };

  const activePetAsset = allPets.find((p) => p.id === activePetId)?.asset;

  const healthWidth = healthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const healthColor = healthAnim.interpolate({
    inputRange: [0, 20, 50, 80, 100],
    outputRange: ["#ef4444", "#f97316", "#facc15", "#22c55e", "#22c55e"],
  });

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
      <View style={styles.petCard}>
        {activePetAsset && <Image source={activePetAsset} style={styles.petImage} />}
        <View style={styles.healthBarWrapper}>
          <View style={styles.healthBarBackground}>
            <Animated.View style={[styles.healthBarFill, { width: healthWidth, backgroundColor: healthColor }]} />
            <Text style={styles.healthText}>{pet.health}%</Text>
          </View>
        </View>
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
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  coinRow: { flexDirection: "row", alignItems: "center", marginTop: 12, zIndex: 2 },
  coinImage: { width: 24, height: 24, marginRight: 6 },
  walletText: { fontSize: 16, fontWeight: "bold", color: "#f59e0b" },

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
    marginTop: -15, // pastikan di atas background
  },
  petImage: { width: 100, height: 100, borderRadius: 12 },
  healthBarWrapper: { width: "100%", alignItems: "center", marginTop: 12 },
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
  healthBarFill: { height: "100%", position: "absolute", left: 0 },
  healthText: { textAlign: "center", fontWeight: "bold", color: "#111827", zIndex: 2 },
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
});
