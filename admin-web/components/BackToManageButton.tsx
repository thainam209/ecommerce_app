import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export function BackToManageButton() {
  const router = useRouter();

  const handlePress = () => {
    // Luôn điều hướng tới Dashboard
    router.replace("/(tabs)/manage");
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: "#0b1120",
        paddingVertical: 9,
        paddingHorizontal: 14,
        borderRadius: 999,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#1f2937",
      }}
    >
      <Ionicons name="arrow-back" size={18} color="#e5e7eb" />
      <Text
        style={{
          color: "#e5e7eb",
          marginLeft: 8,
          fontSize: 14,
          fontWeight: "600",
        }}
      >
        Quay về Trang Quản Lý
      </Text>
    </TouchableOpacity>
  );
}
