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

const triggerTime = new Date(Date.now() + 30 * 60 * 1000);
const CRITICAL_ALARM_ID = "pet_critical_alarm";

const SLOT_KEYS = {
  morning: "lastNotifMorning",
  afternoon: "lastNotifAfternoon",
  evening: "lastNotifEvening",
};

const SLOTS = [
  { key: "morning", hour: 8 },
  { key: "afternoon", hour: 12 },
  { key: "evening", hour: 18 },
];

// Helper: slot sekarang
const getCurrentSlot = () => {
  const hour = new Date().getHours();
  if (hour >= 8 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 23) return "evening";
  return null;
};

/**
 * Notification handler (SDK terbaru wajib lengkap)
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request permission + Android channel
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  let finalStatus = status;

  if (status !== "granted") {
    const { status: requestedStatus } = await Notifications.requestPermissionsAsync();
    finalStatus = requestedStatus;
  }

  if (finalStatus !== "granted") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
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
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Jangan lupa catat pengeluaran",
      body: "Biar pet kamu tetap sehat",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
}

export const handleCriticalPetReminder = async (health: number) => {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  if (health <= CRITICAL_HEALTH) {
    const scheduled = await AsyncStorage.getItem(CRITICAL_REMINDER_KEY);
    if (scheduled) return;

    await Notifications.scheduleNotificationAsync({
      identifier: "critical-pet-reminder",
      content: {
        title: "🐾 Pet Kamu Sekarat",
        body: "Segera rawat pet kamu agar tidak mati.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: __DEV__ ? 10 : 60 * 60,
      },
    });

    await AsyncStorage.setItem(CRITICAL_REMINDER_KEY, "true");
  } else {
    await Notifications.cancelScheduledNotificationAsync("critical-pet-reminder");
    await AsyncStorage.removeItem(CRITICAL_REMINDER_KEY);
  }
};

export async function cancelAllPetNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** Cek pengeluaran harian dan notif sekali per hari */
export const checkDailyExpenseNotification = async () => {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  const allExpenses = await getExpenses();
  const todayStr = new Date().toISOString().slice(0, 10);

  const totalToday = allExpenses.filter((e: any) => e.date.slice(0, 10) === todayStr).reduce((sum: number, e: any) => sum + e.amount, 0);

  if (totalToday <= 200000) return;

  const lastNotifDate = await AsyncStorage.getItem("dailyExpenseNotifSent");
  if (lastNotifDate === todayStr) return;

  // Tentukan waktu trigger berdasarkan slot sekarang
  await Notifications.scheduleNotificationAsync({
    identifier: "daily-expense-reminder",
    content: {
      title: "💸 Pengeluaranmu Sudah Tinggi",
      body: `Hari ini sudah Rp${totalToday.toLocaleString()}. Jangan kebablasan ya!`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerTime,
    },
  });

  await AsyncStorage.setItem("dailyExpenseNotifSent", todayStr);
};
