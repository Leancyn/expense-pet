import { Expense } from "../src/types/expense";
import { Text, View } from "react-native";

type Props = {
  expense: Expense;
};

export default function ExpenseItem({ expense }: Props) {
  return (
    <View
      style={{
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#1f2937",
        marginBottom: 10,
      }}
    >
      <Text style={{ color: "white", fontWeight: "bold" }}>{expense.title}</Text>
      <Text style={{ color: "#9ca3af" }}>Rp {expense.amount.toLocaleString("id-ID")}</Text>
    </View>
  );
}
