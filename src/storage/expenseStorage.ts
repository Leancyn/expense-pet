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
