import { Text, View, ViewStyle } from "react-native";

type Props = {
  health: number;
  level: number;
  style?: ViewStyle; // Bisa atur ukuran container
};

export default function Pet({ health, level, style }: Props) {
  return (
    <View style={[{ alignItems: "center" }, style]}>
      <Text style={{ color: "white", fontSize: 22, fontWeight: "bold" }}>Pet Level {level}</Text>
      <View
        style={{
          width: 200,
          height: 200,
          backgroundColor: "#facc15",
          borderRadius: 100,
          marginTop: 16,
        }}
      />
      <Text style={{ color: "white", marginTop: 12, fontSize: 16 }}>Health: {health}</Text>
    </View>
  );
}
