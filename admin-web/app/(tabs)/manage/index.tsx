import { View, Text, Button, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { BackToDashboardButton } from "@/components/BackToDashboardButton";
import { useEffect } from "react";


export default function ManageScreen() {
  const router = useRouter();
  
  const getToken = async () => {
    try {
      return await localStorage.getItem('admin_token');
    } catch (error) {
      console.error('Lỗi lấy token:', error);
      return null;
    }
  };

  const token = getToken();

  if (!token) {
    // hook sẽ tự redirect, ở đây chỉ show tạm
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>token: {token}</Text>
        <Text>Bạn cần đăng nhập admin.</Text>
      </View>
    );
  }

  useEffect(() => {
    getToken();
  }, [token]);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text>token: {token}</Text>
      <BackToDashboardButton />
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        Quản lý hệ thống
      </Text>

      <Button
        title="Quản lý sản phẩm"
        onPress={() => router.push("/(tabs)/manage/products")}
      />
      <Button
        title="Quản lý danh mục"
        onPress={() => router.push("/(tabs)/manage/categories")}
      />
      <Button
        title="Quản lý combo"
        onPress={() => router.push("/(tabs)/manage/combos")}
      />
      <Button
        title="Quản lý voucher"
        onPress={() => router.push("/(tabs)/manage/vouchers")}
      />
    </View>
  );
}
