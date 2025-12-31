import { Wallet } from "@/types/wallet";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "WALLET";

export async function loadWallet(): Promise<Wallet> {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : { coins: 0 };
}

export async function saveWallet(wallet: Wallet) {
  await AsyncStorage.setItem(KEY, JSON.stringify(wallet));
}
