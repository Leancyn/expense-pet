import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "pet";

export type Pet = {
  health: number;
  level: number;
};

// Dapatkan data pet
export const getPet = async (): Promise<Pet> => {
  const json = await AsyncStorage.getItem(KEY);
  return json ? JSON.parse(json) : { health: 100, level: 1 };
};

// Simpan data pet
export const savePet = async (pet: Pet) => {
  await AsyncStorage.setItem(KEY, JSON.stringify(pet));
};

// Update pet sesuai pengeluaran (gamelike)
export const updatePetByExpense = async (amount: number) => {
  const pet = await getPet();
  let newHealth = pet.health;

  // Aturan gamelike
  if (amount >= 50000) {
    newHealth -= 10; // pengeluaran besar → health turun
  } else {
    newHealth += 5; // pengeluaran kecil → health naik
  }

  let newLevel = pet.level;

  // Level up
  if (newHealth > 100) {
    newLevel += 1;
    newHealth = newHealth - 100; // sisa health ke level baru
  }

  // Level down
  if (newHealth <= 0) {
    newLevel = Math.max(1, newLevel - 1);
    newHealth = 50; // reset health minimal
  }

  const newPet = { health: newHealth, level: newLevel };
  await savePet(newPet);
  return newPet;
};
