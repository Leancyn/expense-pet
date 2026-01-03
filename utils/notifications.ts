import { getExpenses } from "@/storage/expenseStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CRITICAL_HEALTH, CRITICAL_REMINDER_KEY } from "app/(tabs)/pet";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// const EXPENSE_KEY = "EXPENSES";

// const getDailyExpenses = async (): Promise<{ amount: number; date: string }[]> => {
//   const json = await AsyncStorage.getItem(EXPENSE_KEY);
//   const allExpenses = json ? JSON.parse(json) : [];
//   const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
//   return allExpenses.filter((e: any) => e.date.slice(0, 10) === today);
// };

/**
 * Request permission + Android channel
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== "granted") return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }

  return true;
}

/**
 * Success notification (instant)
 */
export async function triggerSuccessNotification(message: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Berhasil",
      body: message,
    },
    trigger: null,
  });
}

/**
 * Daily reminder (calendar trigger)
 */
export async function scheduleDailyReminder(hour: number, minute: number) {
  await Notifications.scheduleNotificationAsync({
    identifier: "daily-reminder",
    content: {
      title: "Jangan lupa catat pengeluaran",
      body: "Biar pet kamu tetap sehat",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export const handleCriticalPetReminder = async (health: number) => {
  if (!(await requestNotificationPermission())) return;

  const now = Date.now();
  const COOLDOWN = __DEV__ ? 60_000 : 6 * 60 * 60 * 1000; // 1 menit dev, 6 jam prod

  if (health <= CRITICAL_HEALTH) {
    const lastSent = await AsyncStorage.getItem(CRITICAL_REMINDER_KEY);

    if (lastSent && now - Number(lastSent) < COOLDOWN) {
      return; // masih cooldown
    }

    await Notifications.scheduleNotificationAsync({
      identifier: "critical-pet-reminder",
      content: {
        title: "🐾 Pet Kamu Sekarat",
        body: "Segera rawat pet kamu agar tidak mati.",
        sound: true,
        data: { type: "critical_pet" },
      },
      trigger: null, // INSTANT, BUKAN INTERVAL
    });

    await AsyncStorage.setItem(CRITICAL_REMINDER_KEY, now.toString());
  } else {
    await AsyncStorage.removeItem(CRITICAL_REMINDER_KEY);
  }
};

export async function cancelAllPetNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** Cek pengeluaran harian dan notif sekali per hari */
export const checkDailyExpenseNotification = async () => {
  if (!(await requestNotificationPermission())) return;

  const expenses = await getExpenses();
  const today = new Date().toISOString().slice(0, 10);

  const total = expenses.filter((e) => e.date.slice(0, 10) === today).reduce((s, e) => s + e.amount, 0);

  if (total <= 200_000) return;

  const sent = await AsyncStorage.getItem("dailyExpenseNotifSent");
  if (sent === today) return;

  const triggerDate = new Date();
  triggerDate.setMinutes(triggerDate.getMinutes() + 30);

  await Notifications.scheduleNotificationAsync({
    identifier: "daily-expense-reminder",
    content: {
      title: "💸 Pengeluaranmu Sudah Tinggi",
      body: `Hari ini sudah Rp${total.toLocaleString()}`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });

  await AsyncStorage.setItem("dailyExpenseNotifSent", today);
};
