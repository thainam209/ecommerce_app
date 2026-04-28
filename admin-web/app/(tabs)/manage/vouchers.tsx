import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import API_BASE_URL from "../../../config/api";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { BackToDashboardButton } from "@/components/BackToDashboardButton";

type Voucher = {
  id: number;
  name: string;
  discount: number;
  userId: number;
  user?: {
    id: number;
    name?: string;
    email?: string;
  };
};

export default function ManageVouchersScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme] as any;

  const { token, loading: authLoading, isAdmin } = useAdminAuth();

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [discount, setDiscount] = useState("");
  const [userIdsInput, setUserIdsInput] = useState("");

  useEffect(() => {
    if (authLoading || !token || !isAdmin) return;
    fetchVouchers();
  }, [authLoading, token, isAdmin]);


  async function fetchVouchers() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/vouchers/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();

      const data: Voucher[] = json.vouchers ?? json.data ?? [];
      setVouchers(data);
    } catch (err: any) {
      console.error("Fetch vouchers error:", err?.message);
      Alert.alert("Lỗi", "Không tải được danh sách voucher");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName("");
    setDiscount("");
    setUserIdsInput("");
  }

  async function handleAssign() {
    if (!token) {
      Alert.alert("Phiên hết hạn", "Vui lòng đăng nhập lại.");
      return;
    }
    if (!name.trim()) {
      Alert.alert("Lỗi", "Tên voucher không được để trống");
      return;
    }

    const discountNumber = Number(discount);
    if (!Number.isInteger(discountNumber) || discountNumber <= 0) {
      Alert.alert("Lỗi", "Discount phải là số nguyên dương");
      return;
    }

    // Parse userIds từ input: "1, 5,7" -> [1,5,7]
    const userIds = String(userIdsInput)
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => Number(s))
      .filter((n) => Number.isInteger(n) && n > 0);

    if (userIds.length === 0) {
      Alert.alert(
        "Lỗi",
        "Vui lòng nhập ít nhất một userId (dạng: 1,3,5)"
      );
      return;
    }

    const payload = {
      name: name.trim(),
      discount: discountNumber,
      userIds,
    };

    try {
      setSaving(true);

      console.log("➡️ Assign vouchers:", payload);

      const res = await fetch(`${API_BASE_URL}/vouchers/admin/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("⬅️ Assign vouchers response:", res.status, text);

      if (!res.ok) {
        Alert.alert(
          "Lỗi",
          `Không tạo được voucher.\n\n${text || "Server error"}`
        );
        return;
      }

      Alert.alert("Thành công", "Đã phân phát voucher cho user");
      await fetchVouchers();
      resetForm();
    } catch (err: any) {
      console.error("Assign vouchers exception:", err?.message);
      Alert.alert("Lỗi", "Có lỗi khi gọi API phân phát voucher");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(voucher: Voucher) {
    Alert.alert(
      "Xoá voucher",
      `Bạn có chắc chắn muốn xoá voucher "${voucher.name}" cho userId ${voucher.userId}?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            try {
              const url = `${API_BASE_URL}/vouchers/admin/${voucher.id}`;
              console.log("➡️ Delete voucher:", url);

              const res = await fetch(url, { 
                method: "DELETE", 
                headers: { 
                  Authorization: `Bearer ${token}` 
                }
              }
              );
              const text = await res.text();
              console.log("⬅️ Delete voucher response:", res.status, text);

              if (!res.ok) {
                Alert.alert(
                  "Lỗi",
                  `Không xoá được voucher.\n\n${text || "Server error"}`
                );
                return;
              }

              setVouchers((prev) =>
                prev.filter((v) => v.id !== voucher.id)
              );
            } catch (err: any) {
              console.error("Delete voucher exception:", err?.message);
              Alert.alert("Lỗi", "Có lỗi khi xoá voucher");
            }
          },
        },
      ]
    );
  }

  const bgColor =
    theme.background ?? (colorScheme === "dark" ? "#020617" : "#f9fafb");

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <BackToDashboardButton />
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: theme.text ?? "#e5e7eb" }]}>
              Quản lý voucher
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.muted ?? "#9ca3af" }]}
            >
              Tạo voucher và phân phát cho người dùng
            </Text>
          </View>
        </View>

        <View style={styles.contentRow}>
          {/* Left: list */}
          <View style={styles.leftPane}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text ?? "#e5e7eb" },
              ]}
            >
              Danh sách voucher
            </Text>

            {loading ? (
              <View style={styles.center}>
                <ActivityIndicator />
                <Text
                  style={{
                    marginTop: 8,
                    color: theme.muted ?? "#9ca3af",
                  }}
                >
                  Đang tải voucher...
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.list}
                contentContainerStyle={{ paddingBottom: 16 }}
              >
                {vouchers.map((v) => (
                  <View key={v.id} style={[styles.card, styles.shadow]}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.voucherName,
                          { color: theme.text ?? "#e5e7eb" },
                        ]}
                        numberOfLines={1}
                      >
                        #{v.id} – {v.name}
                      </Text>

                      <Text style={styles.voucherDiscount}>
                        Giảm: {v.discount.toLocaleString("vi-VN")} đ
                      </Text>

                      <Text style={styles.voucherUser}>
                        User ID: {v.userId}
                        {v.user?.email
                          ? ` • ${v.user.email}`
                          : v.user?.name
                          ? ` • ${v.user.name}`
                          : ""}
                      </Text>
                    </View>

                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.dangerButton}
                        onPress={() => handleDelete(v)}
                      >
                        <Text style={styles.dangerButtonText}>Xoá</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {vouchers.length === 0 && !loading && (
                  <Text
                    style={{
                      color: theme.muted ?? "#9ca3af",
                      fontStyle: "italic",
                    }}
                  >
                    Chưa có voucher nào.
                  </Text>
                )}
              </ScrollView>
            )}
          </View>

          {/* Right: form */}
          <View style={styles.rightPane}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text ?? "#e5e7eb" },
              ]}
            >
              Tạo & phân phát voucher
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>Tên voucher</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="VD: Giảm 50K cho đơn từ 300K"
                placeholderTextColor="#6b7280"
                style={[styles.input, { color: theme.text ?? "#e5e7eb" }]}
              />

              <Text style={styles.label}>
                Discount (số tiền giảm, ví dụ: 50000)
              </Text>
              <TextInput
                value={discount}
                onChangeText={setDiscount}
                placeholder="Nhập số tiền giảm"
                keyboardType="numeric"
                placeholderTextColor="#6b7280"
                style={[styles.input, { color: theme.text ?? "#e5e7eb" }]}
              />

              <Text style={styles.label}>
                User IDs (phân phát cho các user, dạng: 1,3,5)
              </Text>
              <TextInput
                value={userIdsInput}
                onChangeText={setUserIdsInput}
                placeholder="Ví dụ: 1, 5, 7"
                placeholderTextColor="#6b7280"
                style={[
                  styles.input,
                  styles.inputMultiline,
                  { color: theme.text ?? "#e5e7eb" },
                ]}
                multiline
                numberOfLines={2}
              />

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={[styles.secondaryButton, { flex: 1 }]}
                  onPress={resetForm}
                >
                  <Text style={styles.secondaryButtonText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1 }]}
                  onPress={handleAssign}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      Phân phát voucher
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "800" },
  subtitle: { fontSize: 13, marginTop: 4 },
  contentRow: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  leftPane: { flex: 1.2 },
  rightPane: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#020617",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  list: { marginTop: 4 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    padding: 10,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "#020617",
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  voucherName: { fontSize: 14, fontWeight: "600" },
  voucherDiscount: { fontSize: 12, color: "#22c55e", marginTop: 2 },
  voucherUser: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  cardActions: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  primaryButton: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  primaryButtonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  secondaryButtonText: { color: "#e5e7eb", fontSize: 12, fontWeight: "500" },
  dangerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#b91c1c",
  },
  dangerButtonText: { color: "#fee2e2", fontSize: 12, fontWeight: "500" },
  form: { marginTop: 4, gap: 8 },
  label: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: "#020617",
  },
  inputMultiline: { minHeight: 60, textAlignVertical: "top" },
  formActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  center: { marginTop: 16, alignItems: "center" },
});
