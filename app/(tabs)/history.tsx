import { getExpenses } from "@/storage/expenseStorage";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type ExpenseItem = { id: string; name: string; amount: number; date: string };

export default function WalletHistoryScreen() {
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<ExpenseItem[]>([]);
  const [filter, setFilter] = useState<"day" | "week" | "month">("day");

  const loadHistory = useCallback(async () => {
    const expenses = await getExpenses();
    // urutkan dari terbaru
    const sorted = expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setHistory(sorted);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    Object.keys(grouped).forEach((date) => {
      initial[date] = true;
    });
    setExpandedDates(initial);
  }, [filter, history.length]);

  // toggle handler
  const toggleDate = (date: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  // helper filter
  const filteredHistory = history.filter((item) => {
    const itemDate = new Date(item.date);
    const now = new Date();

    if (filter === "day") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);

      const end = new Date(now);
      end.setHours(23, 59, 59, 999);

      return itemDate >= start && itemDate <= end;
    }

    if (filter === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      return itemDate >= start && itemDate <= end;
    }

    if (filter === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      return itemDate >= start && itemDate <= end;
    }

    return true;
  });

  // grouping by day
  const groupByDate = (items: ExpenseItem[]) => {
    const map: Record<string, ExpenseItem[]> = {};
    items.forEach((item) => {
      const dateKey = new Date(item.date).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(item);
    });
    return map;
  };

  const grouped = groupByDate(filteredHistory);

  return (
    <View style={styles.container}>
      {/* HEADER (STICKY) */}
      <Text style={styles.header}>Riwayat Pengeluaran</Text>

      {/* FILTER (STICKY) */}
      <View style={styles.filterContainer}>
        {(["day", "week", "month"] as const).map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterButton, filter === f && styles.filterButtonActive]}>
            <Text style={[styles.filterButtonText, filter === f && styles.filterButtonTextActive]}>{f === "day" ? "Hari Ini" : f === "week" ? "Minggu Ini" : "Bulan Ini"}</Text>
          </Pressable>
        ))}
      </View>

      {/* SCROLL AREA */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} scrollEventThrottle={16}>
        {filteredHistory.length === 0 ? (
          <Text style={styles.subtitle}>Belum ada transaksi</Text>
        ) : (
          Object.entries(grouped).map(([date, items]) => {
            const expanded = expandedDates[date] ?? true;
            const totalPerDay = items.reduce((s, i) => s + i.amount, 0);

            return (
              <View key={date} style={styles.dateCard}>
                <Pressable style={styles.dateHeaderRow} onPress={() => toggleDate(date)}>
                  <Text style={styles.dateHeader}>{date}</Text>
                  <Text style={styles.dateTotal}>{totalPerDay.toLocaleString()} IDR</Text>
                </Pressable>

                {expanded &&
                  items.map((item) => (
                    <View key={item.id} style={styles.historyItem}>
                      <Text style={styles.historyText}>{item.name}</Text>
                      <Text style={styles.historyAmount}>{item.amount.toLocaleString()} IDR</Text>
                    </View>
                  ))}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fefce8",
  },
  // cerah & game-like
  header: { color: "#6b7280", fontSize: 24, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  filterContainer: { flexDirection: "row", marginBottom: 16, justifyContent: "center", overflow: "visible" },
  filterButton: {
    marginHorizontal: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#000",
    backgroundColor: "#fff",
    overflow: "hidden",
    // shadow untuk iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    // shadow untuk Android
    elevation: 3,
  },
  filterButtonActive: { backgroundColor: "#22c55e" },
  filterButtonText: { fontWeight: "600" },
  filterButtonTextActive: { color: "#fff" },
  dateCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#000",
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dateHeader: { fontSize: 18, fontWeight: "700", color: "#374151", marginBottom: 8 },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fef3c7",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  historyText: { color: "#6b7280", fontSize: 16 },
  historyAmount: { color: "#f59e0b", fontSize: 16, fontWeight: "bold" },
  subtitle: { color: "#9ca3af", fontSize: 14, textAlign: "center", marginTop: 16 },
  dateHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  dateTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#16a34a",
  },
  scrollArea: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 32,
  },
});
