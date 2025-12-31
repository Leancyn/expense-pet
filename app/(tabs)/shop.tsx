import { loadWallet, saveWallet } from "@/storage/walletStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";

const petsForSale = [
  { id: "1", name: "Kucing", price: 50, asset: require("../../assets/pets/cat.gif") },
  { id: "2", name: "Panda", price: 150, asset: require("../../assets/pets/panda.gif") },
  { id: "3", name: "Alpaca", price: 300, asset: require("../../assets/pets/alpaca.gif") },
  { id: "4", name: "Axolotl", price: 420, asset: require("../../assets/pets/axolotl.gif") },
  { id: "5", name: "Kepiting", price: 570, asset: require("../../assets/pets/crab.gif") },
  { id: "6", name: "Unicorn", price: 899, asset: require("../../assets/pets/unicorn.gif") },
  { id: "7", name: "Monster Lochness", price: 1499, asset: require("../../assets/pets/loch-ness-monster.gif") },
];

export default function ShopScreen() {
  const [wallet, setWallet] = useState({ coins: 0 });
  const [ownedPets, setOwnedPets] = useState<string[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const w = await loadWallet();
        setWallet(w);
      };
      load();
    }, [])
  );

  useEffect(() => {
    const init = async () => {
      const w = await loadWallet();
      setWallet(w);

      const petsJson = await AsyncStorage.getItem("ownedPets");
      const savedPets: string[] = petsJson ? JSON.parse(petsJson) : [];
      if (!savedPets.includes("1")) savedPets.push("1");
      setOwnedPets(savedPets);
      await AsyncStorage.setItem("ownedPets", JSON.stringify(savedPets));
    };
    init();
  }, []);

  const handleBuyPet = async (pet: (typeof petsForSale)[0]) => {
    if (ownedPets.includes(pet.id)) {
      Alert.alert("Kamu sudah punya pet ini!");
      return;
    }
    if (wallet.coins >= pet.price) {
      const newCoins = wallet.coins - pet.price;
      const newOwned = [...ownedPets, pet.id];
      setWallet({ coins: newCoins });
      setOwnedPets(newOwned);
      await saveWallet({ coins: newCoins });
      await AsyncStorage.setItem("ownedPets", JSON.stringify(newOwned));
      Alert.alert(`Berhasil beli ${pet.name}!`);
    } else {
      Alert.alert("Coin tidak cukup!");
    }
  };

  const handleUsePet = async (petId: string) => {
    if (!ownedPets.includes(petId)) return;
    await AsyncStorage.setItem("activePetId", petId);
    router.push("/pet");
  };

  return (
    <View style={styles.container}>
      {/* Coin Display */}
      <View style={styles.coinRow}>
        <Image source={require("../../assets/images/coin.gif")} style={styles.coinImage} />
        <Text style={styles.walletText}>{wallet.coins}</Text>
      </View>

      <FlatList
        data={petsForSale}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isOwned = ownedPets.includes(item.id);
          return (
            <View style={styles.petCard}>
              <Image source={item.asset} style={styles.petImage} />
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{item.name}</Text>
                <Text style={styles.petPrice}>
                  {isOwned ? (
                    "Sudah dibeli"
                  ) : (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Image source={require("../../assets/images/coin.gif")} style={{ width: 16, height: 16, marginRight: 4 }} />
                      <Text>{item.price}</Text>
                    </View>
                  )}
                </Text>
              </View>
              <Pressable onPress={() => (isOwned ? handleUsePet(item.id) : handleBuyPet(item))} style={[styles.petButton, isOwned ? styles.useButton : styles.buyButton]}>
                <Text style={styles.petButtonText}>{isOwned ? "Use" : "Buy"}</Text>
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#ffffff" },
  coinRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  coinImage: { width: 28, height: 28, marginRight: 8 },
  walletText: { fontSize: 22, fontWeight: "bold", color: "#22c55e" },
  petCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#000",
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  petImage: { width: 60, height: 60, borderRadius: 12, marginRight: 12 },
  petInfo: { flex: 1 },
  petName: { fontSize: 16, fontWeight: "bold", color: "#374151" },
  petPrice: { fontSize: 14, color: "#f59e0b", marginTop: 4 },
  petButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  buyButton: { backgroundColor: "#f59e0b" },
  useButton: { backgroundColor: "#22c55e" },
  petButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
