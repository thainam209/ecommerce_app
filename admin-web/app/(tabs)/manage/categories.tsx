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
import { BackToManageButton } from "@/components/BackToManageButton";

type Category = {
  id: number;
  name: string;
  description?: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

export default function ManageCategoriesScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme] as any;

  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const getToken = async () => {
    try {
      return await localStorage.getItem("admin_token");
    } catch (error) {
      console.error('Lỗi lấy token:', error);
      return null;
    }
  };

  const token = getToken();

  useEffect(() => {
    fetchCategories();
}, []);

  async function fetchCategories(page: number = 1, limit: number = 20) {
    try {
      const token = await getToken();

      if (!token) return;
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/categories?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const json = await res.json();

      const data: Category[] = json.data ?? json.categories ?? json;
      const pag: Pagination =
        json.pagination ?? json.meta ?? {
          page,
          limit,
          total: data?.length ?? 0,
          totalPages: 1,
          hasMore: false,
        };

      setCategories(data || []);
      setPagination(pag);
    } catch (err: any) {
      console.error("Fetch categories error:", err?.message);
      Alert.alert("Lỗi", "Không tải được danh sách danh mục");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName("");
    setDescription("");
    setEditingCategory(null);
  }

  function openCreateForm() {
    resetForm();
  }

  function openEditForm(cat: Category) {
    setEditingCategory(cat);
    setName(cat.name ?? "");
    setDescription(cat.description ?? "");
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Tên danh mục không được để trống");
      return;
    }

    const payload: any = {
      name: name.trim(),
      description: description.trim() || null,
    };

    const isEdit = Boolean(editingCategory?.id);
    const url = isEdit
      ? `${API_BASE_URL}/categories/${editingCategory!.id}`
      : `${API_BASE_URL}/categories`;
    const method = isEdit ? "PUT" : "POST";

    try {
      setSaving(true);
      const token = await getToken();

      console.log("➡️ Saving category:", { method, url, payload });

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("⬅️ Save category response:", res.status, text);

      if (!res.ok) {
        alert("Lỗi"+ `Không lưu được danh mục.\n\n${text}`);
        return;
      }

      alert(
        "Thành công"+
        isEdit ? "Đã lưu thay đổi danh mục" : "Đã thêm danh mục mới"
      );

      await fetchCategories();
      resetForm();
    } catch (err: any) {
      console.error("Save category exception:", err?.message);
      alert("Lỗi"+ "Có lỗi khi gọi API categories");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat: Category) {

    const token = await getToken();
    if (!token) {
          alert("Phiên hết hạn"+ "Vui lòng đăng nhập lại.");
          return;
    }

    const result = confirm("Xoá danh mục"+`Bạn có chắc chắn muốn xoá danh mục ?`);

    if(result) {
      try {
        const url = `${API_BASE_URL}/categories/${cat.id}`;
        console.log("➡️ Deleting category:", url);

        const res = await fetch(url, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            }
        );
        const text = await res.text();
        console.log("⬅️ Delete category response:", res.status, text);

        if (!res.ok) {
          alert("Lỗi" + `Không xoá được danh mục.\n\n${text}`);
          return;
        }

        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      } catch (err: any) {
        console.error("Delete category exception:", err?.message);
        Alert.alert("Lỗi", "Có lỗi khi xoá danh mục");
      }
    }
  }

  const bgColor =
    theme.background ?? (colorScheme === "dark" ? "#020617" : "#f9fafb");

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <BackToManageButton />
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color:  "#0c0c0c" }]}>
              Quản lý danh mục
            </Text>
            <Text
              style={[styles.subtitle, { color:  "#9ca3af" }]}
            >
              Thêm, chỉnh sửa, xoá các danh mục sản phẩm
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, styles.shadow]}
            onPress={openCreateForm}
          >
            <Text style={styles.primaryButtonText}>+ Thêm danh mục</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentRow}>
          {/* Left: list */}
          <View style={styles.leftPane}>
            <Text
              style={[
                styles.sectionTitle,
                { color:  "#080808" },
              ]}
            >
              Danh sách
            </Text>

            {loading ? (
              <View style={styles.center}>
                <ActivityIndicator />
                <Text
                  style={{
                    marginTop: 8,
                    color:  "#9ca3af",
                  }}
                >
                  Đang tải danh mục...
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.list}
                contentContainerStyle={{ paddingBottom: 16 }}
              >
                {categories.map((cat) => (
                  <View key={cat.id} style={[styles.card, styles.shadow]}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.categoryName,
                          { color:  "#e5e7eb" },
                        ]}
                        numberOfLines={1}
                      >
                        {cat.name}
                      </Text>
                      {cat.description ? (
                        <Text
                          style={styles.categoryDescription}
                          numberOfLines={2}
                        >
                          {cat.description}
                        </Text>
                      ) : null}
                    </View>

                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => openEditForm(cat)}
                      >
                        <Text style={styles.secondaryButtonText}>Sửa</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.dangerButton}
                        onPress={() => handleDelete(cat)}
                      >
                        <Text style={styles.dangerButtonText}>Xoá</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {categories.length === 0 && !loading && (
                  <Text
                    style={{
                      color: theme.muted ?? "#9ca3af",
                      fontStyle: "italic",
                    }}
                  >
                    Chưa có danh mục nào.
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
                { color:  "#e5e7eb" },
              ]}
            >
              {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>Tên danh mục</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nhập tên danh mục"
                placeholderTextColor="#6b7280"
                style={[styles.input, { color:  "#e5e7eb" }]}
              />

              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Mô tả ngắn cho danh mục"
                placeholderTextColor="#6b7280"
                style={[
                  styles.input,
                  styles.inputMultiline,
                  { color:  "#e5e7eb" },
                ]}
                multiline
                numberOfLines={3}
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
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {editingCategory ? "Lưu thay đổi" : "Thêm danh mục"}
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
  categoryName: { fontSize: 14, fontWeight: "600" },
  categoryDescription: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  cardActions: {
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 6,
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
  inputMultiline: { minHeight: 70, textAlignVertical: "top" },
  formActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  center: { marginTop: 16, alignItems: "center" },
});
