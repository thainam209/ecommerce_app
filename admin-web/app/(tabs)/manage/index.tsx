import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";


export default function ManageScreen() {
  const router = useRouter();
  const { loading, token, isAdmin } = useAdminAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Đang kiểm tra đăng nhập...</Text>
      </View>
    );
  }
  if (!token || !isAdmin) {
    // hook sẽ tự redirect, ở đây chỉ show tạm
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Bạn cần đăng nhập admin.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
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
