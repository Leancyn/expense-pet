// src/storage/expenseStorage.ts
import { Expense } from "@/types/expense";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EXPENSE_KEY = "EXPENSES";

// Tambahkan expense baru
export async function addExpense(expense: Expense) {
  try {
    const expensesJson = await AsyncStorage.getItem(EXPENSE_KEY);
    const expenses: Expense[] = expensesJson ? JSON.parse(expensesJson) : [];
    expenses.push(expense);
    await AsyncStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error("Error adding expense:", error);
  }
}

// Ambil semua expense
export async function getExpenses(): Promise<Expense[]> {
  try {
    const expensesJson = await AsyncStorage.getItem(EXPENSE_KEY);
    return expensesJson ? JSON.parse(expensesJson) : [];
  } catch (error) {
    console.error("Error getting expenses:", error);
    return [];
  }
}

// Fungsi baru: ambil expense hari ini
export const getDailyExpenses = async (): Promise<{ amount: number; date: string }[]> => {
  const json = await AsyncStorage.getItem("expenses");
  const allExpenses = json ? JSON.parse(json) : [];
  const today = new Date().toISOString().slice(0, 10); // format YYYY-MM-DD
  return allExpenses.filter((e: any) => e.date.slice(0, 10) === today);
};
