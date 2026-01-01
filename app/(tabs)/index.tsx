import { getExpenses } from "@/storage/expenseStorage";
import { Expense } from "@/types/expense";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DailyChart from "components/DailyChart";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, LayoutAnimation, ScrollView, StyleSheet, Text, View } from "react-native";
import { checkDailyExpenseNotification, requestNotificationPermission, scheduleDailyReminder } from "utils/notifications";

export default function HomeScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [ownedPets, setOwnedPets] = useState<string[]>([]);
  const [activePetId, setActivePetId] = useState("1");

  const allPets = [
    { id: "1", name: "Kucing", price: 50, asset: require("../../assets/pets/cat.gif") },
    { id: "2", name: "Panda", price: 70, asset: require("../../assets/pets/panda.gif") },
    { id: "3", name: "Alpaca", price: 40, asset: require("../../assets/pets/alpaca.gif") },
    { id: "4", name: "Axolotl", price: 80, asset: require("../../assets/pets/axolotl.gif") },
    { id: "5", name: "Kepiting", price: 100, asset: require("../../assets/pets/crab.gif") },
    { id: "6", name: "Unicorn", price: 120, asset: require("../../assets/pets/unicorn.gif") },
    { id: "7", name: "Monster Lochness", price: 150, asset: require("../../assets/pets/loch-ness-monster.gif") },
  ];

  const quotes: string[][] = [
    ["Hai!", "Aku senang kamu masih ingat mencatat pengeluaranmu.", "Ayo jangan sampai lupa lagi!"],
    ["Hmm…", "kayaknya hari ini kamu bisa hemat sedikit.", "Aku pasti senang besok."],
    ["Yaaay!", "Kamu sudah mencatat semua pengeluaran hari ini.", "Kerja bagus, teruskan kebiasaan ini!"],
    ["Oops!", "Kalau lupa catat, aku bakal sedih lho.", "Tolong jangan biarkan aku menunggu terlalu lama."],
    ["Hihi…", "Aku suka kalau kamu disiplin mencatat pengeluaran.", "Biar aku bisa tetap senang dan sehat!"],
  ];

  const loadExpenses = useCallback(async () => {
    const data = await getExpenses();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpenses(data);
  }, []);

  const today = new Date();
  const isToday = (date: Date) => {
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  };

  useEffect(() => {
    scheduleDailyReminder(20, 0);
    requestNotificationPermission();
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkDailyExpenseNotification(); // langsung cek tiap fokus

      // Optional: auto cek tiap jam
      const interval = setInterval(() => {
        checkDailyExpenseNotification();
      }, 60 * 60 * 1000); // tiap 1 jam

      return () => clearInterval(interval);
    }, [])
  );

  // Ambil active pet dari AsyncStorage
  useFocusEffect(
    useCallback(() => {
      const fetchPets = async () => {
        const petsJson = await AsyncStorage.getItem("ownedPets");
        const pets: string[] = petsJson ? JSON.parse(petsJson) : ["1"];
        setOwnedPets(pets);

        const savedActivePet = await AsyncStorage.getItem("activePetId");
        const activeId = savedActivePet && pets.includes(savedActivePet) ? savedActivePet : "1";
        setActivePetId(activeId);
      };
      fetchPets();
    }, [])
  );

  // Ambil asset pet sesuai activePetId
  const activePetAsset = allPets.find((p) => p.id === activePetId)?.asset;

  // array part yang ditampilkan
  const [displayParts, setDisplayParts] = useState<string[]>([]);

  const quoteIndexRef = useRef(0);
  const partIndexRef = useRef(0);
  const charIndexRef = useRef(0);

  // pet quote typing effect
  useEffect(() => {
    const typeNextChar = () => {
      const qIdx = quoteIndexRef.current;
      const pIdx = partIndexRef.current;
      const cIdx = charIndexRef.current;

      const currentQuote = quotes[qIdx];
      if (!currentQuote) return;

      const currentPart = currentQuote[pIdx];
      if (!currentPart) return;

      // Menambahkan karakter ke part terakhir
      setDisplayParts((prev) => {
        const newParts = [...prev];
        newParts[pIdx] = (newParts[pIdx] || "") + currentPart[cIdx];
        return newParts;
      });

      charIndexRef.current += 1;

      if (charIndexRef.current < currentPart.length) {
        // Masih ada karakter di part ini
        const speed = Math.floor(Math.random() * 50) + 80; // 80-130ms
        setTimeout(typeNextChar, speed);
      } else {
        // Part selesai, tunggu sedikit sebelum part berikutnya
        const delayAfterPart = Math.floor(Math.random() * 400) + 600; // 600-1000ms
        setTimeout(() => {
          partIndexRef.current += 1;
          charIndexRef.current = 0;

          if (partIndexRef.current >= currentQuote.length) {
            // Semua part selesai → tunggu sedikit lalu lanjut quote berikutnya
            const delayBeforeNextQuote = 1000; // 1 detik jeda sebelum quote baru
            setTimeout(() => {
              quoteIndexRef.current = (quoteIndexRef.current + 1) % quotes.length;
              partIndexRef.current = 0;
              setDisplayParts([]); // reset untuk quote baru
              typeNextChar();
            }, delayBeforeNextQuote);
          } else {
            // Lanjut ke part berikutnya di quote yang sama
            typeNextChar();
          }
        }, delayAfterPart);
      }
    };

    typeNextChar();
  }, []);

  // Reload setiap tab muncul
  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses])
  );

  const totalToday = expenses
    .filter((e) => isToday(new Date(e.date))) // pastikan e.date tersimpan sebagai string / ISO
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Card Total Pengeluaran */}
      <View style={[styles.gameCard]}>
        <Text style={styles.subtitle}>Total Pengeluaran Hari Ini</Text>
        <Text style={styles.total}>{totalToday.toLocaleString()} IDR</Text>
      </View>

      {/* Grafik Pengeluaran */}
      <View style={[styles.gameCard]}>
        <Text style={styles.subtitle}>Pengeluaran Harian</Text>
        <DailyChart expenses={expenses} />
      </View>

      <View style={styles.petCard}>
        {activePetAsset && <Image source={activePetAsset} style={styles.petIcon} />}
        <Text style={styles.petQuote}>{displayParts.join(" ")}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fefce8",
  },
  gameCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "#111827",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 16,
    marginBottom: 12,
    fontWeight: "500",
  },
  total: {
    color: "#22c55e",
    fontSize: 36,
    fontWeight: "bold",
  },
  petCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "#111827",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  petIcon: { width: 48, height: 48, marginRight: 12 },
  petQuote: { flex: 1, fontSize: 16, color: "#374151" },
});
