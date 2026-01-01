import { getExpenses } from "@/storage/expenseStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// const EXPENSE_KEY = "EXPENSES";

// const getDailyExpenses = async (): Promise<{ amount: number; date: string }[]> => {
//   const json = await AsyncStorage.getItem(EXPENSE_KEY);
//   const allExpenses = json ? JSON.parse(json) : [];
//   const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
//   return allExpenses.filter((e: any) => e.date.slice(0, 10) === today);
// };

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

export async function scheduleCriticalPetReminder() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Pet kamu sekarat",
      body: "Catat pengeluaran sekarang untuk menyelamatkan pet kamu",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60, // tiap 1 jam
      repeats: true,
    },
  });
}

export async function cancelAllPetNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function triggerCriticalPetNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Pet kamu sekarat",
      body: "Catat pengeluaran sekarang untuk menyelamatkan pet kamu",
      sound: true,
    },
    trigger: null, // langsung muncul
  });
}

/** Cek pengeluaran harian dan notif sekali per hari */
export const checkDailyExpenseNotification = async () => {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  const allExpenses = await getExpenses();
  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyExpenses = allExpenses.filter((e: any) => e.date.slice(0, 10) === todayStr);
  const totalToday = dailyExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);

  if (totalToday <= 200000) return;

  const slot = getCurrentSlot();
  if (!slot) return;

  const lastNotif = await AsyncStorage.getItem(SLOT_KEYS[slot]);
  if (lastNotif === todayStr) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Pengeluaran Mu Tinggi Banget!",
      body: `Total pengeluaran hari ini Rp${totalToday.toLocaleString()}`,
      sound: true,
    },
    trigger: null,
  });

  await AsyncStorage.setItem(SLOT_KEYS[slot], todayStr);
};
