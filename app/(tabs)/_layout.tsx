import { HapticTab } from "components/haptic-tab";
import { Tabs } from "expo-router";
import { Heart, History, House, ShoppingCart } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const theme = {
  background: "#ffffff",
  tint: "#2f95dc",
  tabIconDefault: "#9ca3af",
  border: "#e2e2e2",
};

function AnimatedIcon({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  const scale = useRef(new Animated.Value(focused ? 1.1 : 1)).current;
  useEffect(() => {
    Animated.timing(scale, {
      toValue: focused ? 1.1 : 1,
      duration: 150,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [focused]);
  return <Animated.View style={[styles.iconWrapper, focused && { backgroundColor: theme.tint }, { transform: [{ scale }] }]}>{children}</Animated.View>;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          height: 60 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
          paddingTop: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon focused={focused}>
              <House size={26} color={focused ? "#fff" : color} />
            </AnimatedIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="pet"
        options={{
          title: "Pet",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon focused={focused}>
              <Heart size={26} color={focused ? "#fff" : color} />
            </AnimatedIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon focused={focused}>
              <History size={26} color={focused ? "#fff" : color} />
            </AnimatedIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon focused={focused}>
              <ShoppingCart size={26} color={focused ? "#fff" : color} />
            </AnimatedIcon>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 31,
    height: 31,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    marginBottom: 8,
  },
});
