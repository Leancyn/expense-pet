// app/modal.tsx
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from "react-native";

interface ModalScreenProps {
  activePetAsset?: any; // bisa require('../../assets/pets/cat.gif') atau uri
}

// default asset kucing
const defaultCatAsset = require("../assets/pets/cat.gif");

export default function ModalScreen({ activePetAsset = defaultCatAsset }: ModalScreenProps) {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (router.canGoBack()) router.back();
      else router.replace("/");
    });
  };

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.modal, { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}>
        <Text style={styles.title}>Selamat datang kembali!</Text>
        {activePetAsset && <Image source={activePetAsset} style={styles.petIcon} />}
        <Pressable style={styles.button} onPress={closeModal}>
          <Text style={styles.buttonText}>Tutup</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center" },
  modal: {
    width: "85%",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    borderWidth: 4,
    borderColor: "#111827",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#374151", marginBottom: 12, textAlign: "center" },
  petIcon: { width: 80, height: 80, marginBottom: 24, borderRadius: 8, resizeMode: "contain" },
  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 4,
    borderBottomWidth: 6,
    borderColor: "#16a34a",
  },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
});
