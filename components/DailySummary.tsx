import { Expense } from "../src/types/expense";
import { Text, View } from "react-native";

export default function DailySummary({ expenses }: { expenses: Expense[] }) {
  const today = new Date().toDateString();
  const total = expenses.filter((e) => new Date(e.date).toDateString() === today).reduce((sum, e) => sum + e.amount, 0);

  return (
    <View
      style={{
        backgroundColor: "#1f2937",
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
      }}
    >
      <Text style={{ color: "#9ca3af" }}>Pengeluaran Hari Ini</Text>
      <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>Rp {total.toLocaleString("id-ID")}</Text>
    </View>
  );
}
