import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "pet";

export type Pet = {
  health: number;
  level: number;
  exp: number; // tambah exp
};

// Dapatkan data pet
export const getPet = async (): Promise<Pet> => {
  const json = await AsyncStorage.getItem(KEY);
  return json ? JSON.parse(json) : { health: 10, level: 1, exp: 0 };
};

// Simpan data pet
export const savePet = async (pet: Pet) => {
  await AsyncStorage.setItem(KEY, JSON.stringify(pet));
};

// Update pet sesuai pengeluaran (gamelike)
export const updatePetByExpense = async (amount: number) => {
  const pet = await getPet();
  let newHealth = pet.health;
  let newExp = pet.exp ?? 0;
  let newLevel = pet.level ?? 1;

  // Health naik sesuai pengeluaran
  if (amount >= 50000) newHealth += 40; // pengeluaran besar
  else newHealth += 15; // pengeluaran kecil

  // Health max 100
  newHealth = Math.min(newHealth, 100);

  // Exp naik per 1000 IDR
  newExp += Math.floor(amount / 1000);

  // Level up tiap exp >= 100
  while (newExp >= 100) {
    newLevel += 1;
    newExp -= 100;
  }

  const newPet = { health: newHealth, level: newLevel, exp: newExp };
  await savePet(newPet);
  return newPet;
};
