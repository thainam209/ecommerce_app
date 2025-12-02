import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import API_BASE_URL from "@/config/api";
import { BackToDashboardButton } from "@/components/BackToDashboardButton";

// Khai báo kiểu Order theo backend
type Order = {
  id: number;
  userId: number;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  note?: string | null;
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
};

export default function OrdersScreen() {
  const { token, loading: authLoading, isAdmin } = useAdminAuth();

  // ✅ Gán generic <Order[]> để không bị never[]
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      if (!token) return;
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/orders/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!Array.isArray(data)) {
        Alert.alert("Lỗi", "Bạn không có quyền admin hoặc dữ liệu không hợp lệ");
        return;
      }

      // ✅ data được coi là Order[]
      setOrders(data as Order[]);
    } catch (err) {
      console.error("Fetch orders error:", err);
      Alert.alert("Lỗi", "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!token || !isAdmin) return;
    fetchOrders();
  }, [authLoading, token, isAdmin]);

  // Hàm đổi trạng thái đơn hàng
  const updateStatus = async (orderId: number, status: string) => {
    try {
      if (!token) {
        Alert.alert("Phiên hết hạn", "Vui lòng đăng nhập lại.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Lỗi", data?.error || "Không thể đổi trạng thái");
        return;
      }

      Alert.alert("Thành công", "Đổi trạng thái đơn hàng thành công");
      fetchOrders(); // Reload orders
    } catch (error) {
      console.error("Update status error:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái");
    }
  };

  // ✅ Gán kiểu cho item: { item }: { item: Order }
  const renderItem = ({ item }: { item: Order }) => (
    <View
      style={{
        padding: 14,
        borderWidth: 1,
        borderColor: "#1f2937",
        borderRadius: 10,
        marginBottom: 12,
        backgroundColor: "#020617",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700", color: "#e5e7eb" }}>
        Đơn #{item.id}
      </Text>
      <Text style={{ color: "#e5e7eb" }}>Người nhận: {item.recipientName}</Text>
      <Text style={{ color: "#e5e7eb" }}>SĐT: {item.recipientPhone}</Text>
      <Text style={{ color: "#e5e7eb" }}>
        Địa chỉ: {item.shippingAddress}
      </Text>
      {item.note ? (
        <Text style={{ color: "#9ca3af" }}>Ghi chú: {item.note}</Text>
      ) : null}
      <Text style={{ color: "#e5e7eb", marginTop: 4 }}>
        Tổng tiền: {item.total.toLocaleString("vi-VN")} đ
      </Text>
      <Text style={{ color: "#9ca3af" }}>Trạng thái: {item.status}</Text>

      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <TouchableOpacity
          onPress={() => updateStatus(item.id, "canceled")}
          style={{
            backgroundColor: "#ef4444",
            padding: 10,
            borderRadius: 6,
            marginRight: 10,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Hủy đơn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => updateStatus(item.id, "completed")}
          style={{
            backgroundColor: "#22c55e",
            padding: 10,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Hoàn thành</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (authLoading) {
    return (
      <View
        style={{
          flex: 1,
          padding: 16,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#020617",
        }}
      >
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: "#9ca3af" }}>
          Đang kiểm tra đăng nhập...
        </Text>
      </View>
    );
  }

  if (!token || !isAdmin) {
    return (
      <View
        style={{
          flex: 1,
          padding: 16,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#020617",
        }}
      >
        <Text style={{ color: "#e5e7eb" }}>
          Bạn cần đăng nhập bằng tài khoản admin để quản lý đơn hàng.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <BackToDashboardButton />
      <View style={{ flex: 1, padding: 16, backgroundColor: "#020617" }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "700",
            marginBottom: 12,
            color: "#e5e7eb",
          }}
        >
          Quản lý đơn hàng
        </Text>

        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
        )}
      </View>
    </View>
  );
}
