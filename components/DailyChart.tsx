import { Expense } from "@/types/expense";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

interface DailyChartProps {
  expenses: Expense[];
}

export default function DailyChart({ expenses }: DailyChartProps) {
  const { width } = useWindowDimensions();
  const cardPadding = 40; // sesuai padding card di HomeScreen
  const chartWidth = width - cardPadding - 32; // 32 = content padding ScrollView

  const groupedData: Record<string, number> = {};
  expenses.forEach((expense) => {
    const date = new Date(expense.date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
    });
    groupedData[date] = (groupedData[date] || 0) + expense.amount;
  });

  const labels = Object.keys(groupedData);
  const dataValues = Object.values(groupedData);

  if (labels.length === 0) {
    return <Text style={styles.emptyText}>Belum ada data pengeluaran</Text>;
  }

  const chartData = {
    labels,
    datasets: [{ data: dataValues }],
  };

  return (
    <View style={{ alignItems: "center" }}>
      <BarChart
        data={chartData}
        width={chartWidth}
        height={220}
        fromZero
        showValuesOnTopOfBars
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: "#fefce8",
          backgroundGradientFrom: "#fefce8",
          backgroundGradientTo: "#fefce8", // flat tanpa gradient
          decimalPlaces: 0,
          color: () => "#3b82f6",
          labelColor: () => "#1f2937",
          style: { borderRadius: 0 }, // no rounded gradient
          propsForBackgroundLines: {
            strokeWidth: 1,
            stroke: "#d1d5db",
            strokeDasharray: "2", // putus-putus ala grid game
          },
        }}
        style={{ borderRadius: 16 }}
        verticalLabelRotation={-45}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 16,
    paddingVertical: 20,
  },
});
