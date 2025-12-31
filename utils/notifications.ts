import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getDailyExpenses } from "../src/storage/expenseStorage";

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

  const dailyExpenses = await getDailyExpenses();
  const totalToday = dailyExpenses.reduce((sum, e) => sum + e.amount, 0);

  const today = new Date().toDateString();
  const lastNotif = await AsyncStorage.getItem("lastHighExpenseNotif");

  // Cuma notif kalau total > 200rb dan belum notif hari ini
  if (totalToday > 200000 && lastNotif !== today) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Pengeluaran Harian Tinggi!",
        body: `Total pengeluaran hari ini Rp${totalToday.toLocaleString()}`,
        sound: true,
      },
      trigger: null,
    });

    await AsyncStorage.setItem("lastHighExpenseNotif", today);
  }
};
