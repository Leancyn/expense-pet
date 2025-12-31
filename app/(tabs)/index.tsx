import { getExpenses } from "@/storage/expenseStorage";
import { Expense } from "@/types/expense";
import DailyChart from "components/DailyChart";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { LayoutAnimation, ScrollView, StyleSheet, Text, View } from "react-native";
import { checkDailyExpenseNotification, requestNotificationPermission, scheduleDailyReminder } from "utils/notifications";

export default function HomeScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const router = useRouter();

  const loadExpenses = useCallback(async () => {
    const data = await getExpenses();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpenses(data);
  }, []);

  useEffect(() => {
    scheduleDailyReminder(20, 0);
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const init = async () => {
      const granted = await requestNotificationPermission();
      if (!granted) return;

      // Cek langsung saat buka app
      await checkDailyExpenseNotification();

      // Cek tiap 1 menit
      const interval = setInterval(async () => {
        await checkDailyExpenseNotification();
      }, 60000);

      return () => clearInterval(interval);
    };

    init();
  }, []);

  // Reload setiap tab muncul
  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses])
  );

  const totalToday = expenses.reduce((sum, e) => sum + e.amount, 0);

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
});
