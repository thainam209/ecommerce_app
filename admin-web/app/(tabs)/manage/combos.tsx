import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import API_BASE_URL from "../../../config/api";
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { BackToDashboardButton } from "@/components/BackToDashboardButton";

type Combo = {
  id: number;
  name: string;
  description?: string;
  image?: string;
  categoryId: number;
  price: number;
  priceSale: number;
};

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  price: number;
  image?: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

export default function ManageCombosScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme] as any;

  const { token, loading: authLoading, isAdmin } = useAdminAuth();

  const [combos, setCombos] = useState<Combo[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);

  // form
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [priceSale, setPriceSale] = useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const fileInputRef = useRef<any>(null);

  useEffect(() => {
    if (authLoading || !token || !isAdmin) return;
    fetchCombos();
    fetchCategories();
    fetchAllProducts();
  }, [authLoading, token, isAdmin]);


  async function fetchCombos(page: number = 1, limit: number = 20) {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/combos?page=${page}&limit=${limit}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          },
        }
      );
      const json = await res.json();

      const data: Combo[] = json.data ?? json.combos ?? json;
      const pag: Pagination =
        json.pagination ?? json.meta ?? {
          page,
          limit,
          total: data?.length ?? 0,
          totalPages: 1,
          hasMore: false,
        };

      setCombos(data || []);
      setPagination(pag);
    } catch (e: any) {
      console.error("Fetch combos error:", e?.message);
      Alert.alert("Lỗi", "Không tải được danh sách combo");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      setLoadingCategories(true);
      const res = await fetch(`${API_BASE_URL}/categories?page=1&limit=100`,
        { 
          headers: {  
            Authorization: `Bearer ${token}` 
          },
        }
      );
      const json = await res.json();
      const data: Category[] = json.data ?? json.categories ?? json;
      setCategories(data || []);
    } catch (e: any) {
      console.error("Fetch categories error:", e?.message);
    } finally {
      setLoadingCategories(false);
    }
  }

  async function fetchAllProducts() {
    try {
      setLoadingProducts(true);
      const res = await fetch(`${API_BASE_URL}/categories?page=1&limit=100`,
        { 
          headers: {  
            Authorization: `Bearer ${token}` 
          },
        }
      );
      const json = await res.json();
      const data: Product[] = json.data ?? json.products ?? json;
      setProducts(data || []);
    } catch (e: any) {
      console.error("Fetch products error:", e?.message);
    } finally {
      setLoadingProducts(false);
    }
  }

  function resetForm() {
    setName("");
    setDescription("");
    setImageUrl("");
    setPriceSale("");
    setCategoryId(null);
    setSelectedProductIds([]);
    setEditingCombo(null);
  }

  function openCreateForm() {
    resetForm();
  }

  async function openEditForm(combo: Combo) {
    setEditingCombo(combo);
    setName(combo.name ?? "");
    setDescription(combo.description ?? "");
    setImageUrl(combo.image ?? "");
    setCategoryId(combo.categoryId ?? null);
    setPriceSale(combo.priceSale?.toString() ?? "");

    // nếu backend có api để lấy combo items, em gọi ở đây
    try {
      const res = await fetch(
        `${API_BASE_URL}/combos/comboitems/${combo.id}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          },
        }
      );
      const json = await res.json();
      // giả định json là mảng { productId, productName, price }
      const ids: number[] = (json.data ?? json).map(
        (item: any) => item.productId
      );
      setSelectedProductIds(ids || []);
    } catch (e: any) {
      console.error("Fetch combo items error:", e?.message);
      // nếu lỗi thì thôi, user tự chọn lại products
    }
  }

  async function handleDelete(combo: Combo) {
    Alert.alert(
      "Xoá combo",
      `Bạn có chắc chắn muốn xoá combo "${combo.name}"?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(
                `${API_BASE_URL}/combos/${combo.id}`,
                { method: "DELETE",
                  headers: { 
                    Authorization: `Bearer ${token}`
                  }
                }
              );
              if (!res.ok) {
                const t = await res.text();
                console.error("Delete combo error:", t);
                Alert.alert("Lỗi", "Không xoá được combo");
                return;
              }
              setCombos((prev) => prev.filter((c) => c.id !== combo.id));
            } catch (e: any) {
              console.error("Delete combo exception:", e?.message);
              Alert.alert("Lỗi", "Có lỗi khi xoá combo");
            }
          },
        },
      ]
    );
  }

  function toggleProductSelection(productId: number) {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }

  // Tính tổng giá combo = sum price sản phẩm đã chọn
  const totalPrice = selectedProductIds.reduce((sum, id) => {
    const p = products.find((x) => x.id === id);
    return sum + (p?.price || 0);
  }, 0);

  async function handleUploadImageFromFileInput(event: any) {
    const file = event?.target?.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImageToCloudinary(file);
      setImageUrl(url);
      Alert.alert("Thành công", "Đã upload ảnh combo");
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Upload ảnh thất bại");
    } finally {
      event.target.value = "";
    }
  }

  function handleOpenFilePicker() {
    if (Platform.OS === "web") {
      fileInputRef.current?.click();
    } else {
      Alert.alert(
        "Thông báo",
        "Upload ảnh trực tiếp chỉ demo cho web. Nếu chạy mobile, hãy dùng expo-image-picker."
      );
    }
  }

       async function handleSave() {
        if (!token) {
            Alert.alert("Phiên hết hạn", "Vui lòng đăng nhập lại.");
            return;
        }
        if (!name.trim()) {
            Alert.alert("Lỗi", "Tên combo không được để trống");
            return;
        }
        if (!categoryId) {
            Alert.alert("Lỗi", "Vui lòng chọn danh mục cho combo");
            return;
        }
        if (selectedProductIds.length === 0) {
            Alert.alert("Lỗi", "Combo phải có ít nhất một sản phẩm");
            return;
        }

        const numericPriceSale = Number(priceSale || 0);
        if (isNaN(numericPriceSale) || numericPriceSale < 0) {
            Alert.alert("Lỗi", "Giá sale không hợp lệ");
            return;
        }

        if (numericPriceSale > totalPrice) {
            Alert.alert(
            "Cảnh báo",
            "Giá sale đang lớn hơn tổng giá sản phẩm. Hãy kiểm tra lại."
            );
        }

        const payload: any = {
            name: name.trim(),
            description: description.trim() || null,
            categoryId,
            image: imageUrl || null,
            productIds: selectedProductIds,
            priceSale: numericPriceSale,
            price: totalPrice,
        };

        const isEdit = Boolean(editingCombo?.id);
        const url = isEdit
            ? `${API_BASE_URL}/combos/${editingCombo!.id}`
            : `${API_BASE_URL}/combos`;
        const method = isEdit ? "PUT" : "POST";

        try {
            setSaving(true);

            console.log("➡️ Saving combo:", { method, url, payload });

            const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
            });

            const text = await res.text();
            console.log("⬅️ Save combo response:", res.status, text);

            if (!res.ok) {
            Alert.alert("Lỗi", `Không lưu được combo.\n\n${text}`);
            return;
            }

            Alert.alert(
            "Thành công",
            editingCombo ? "Đã lưu thay đổi combo" : "Đã thêm combo mới"
            );

            await fetchCombos();
            resetForm();
        } catch (e: any) {
            console.error("Save combo exception:", e?.message);
            Alert.alert("Lỗi", "Có lỗi khi gọi API combo");
        } finally {
            setSaving(false);
        }
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
              Quản lý combo
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.muted ?? "#9ca3af" }]}
            >
              Thêm, chỉnh sửa, xoá combo sản phẩm
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, styles.shadow]}
            onPress={openCreateForm}
          >
            <Text style={styles.primaryButtonText}>+ Thêm combo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentRow}>
          {/* Left: danh sách combo */}
          <View style={styles.leftPane}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text ?? "#e5e7eb" },
              ]}
            >
              Danh sách combo
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
                  Đang tải combo...
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.list}
                contentContainerStyle={{ paddingBottom: 16 }}
              >
                {combos.map((c) => (
                  <View key={c.id} style={[styles.card, styles.shadow]}>
                    <View style={styles.cardLeft}>
                      {c.image ? (
                        <Image
                          source={{ uri: c.image }}
                          style={styles.comboImage}
                        />
                      ) : (
                        <View style={styles.comboImagePlaceholder}>
                          <Text style={{ color: "#6b7280", fontSize: 11 }}>
                            No image
                          </Text>
                        </View>
                      )}

                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.comboName,
                            { color: theme.text ?? "#e5e7eb" },
                          ]}
                          numberOfLines={1}
                        >
                          {c.name}
                        </Text>
                        <Text style={styles.comboPrice}>
                          Giá gốc: {formatCurrency(c.price)}
                        </Text>
                        <Text style={styles.comboPriceSale}>
                          Giá sale: {formatCurrency(c.priceSale)}
                        </Text>
                        {c.description ? (
                          <Text
                            style={styles.comboDescription}
                            numberOfLines={2}
                          >
                            {c.description}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={[styles.secondaryButton]}
                        onPress={() => openEditForm(c)}
                      >
                        <Text style={styles.secondaryButtonText}>Sửa</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.dangerButton]}
                        onPress={() => handleDelete(c)}
                      >
                        <Text style={styles.dangerButtonText}>Xoá</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {combos.length === 0 && !loading && (
                  <Text
                    style={{
                      color: theme.muted ?? "#9ca3af",
                      fontStyle: "italic",
                    }}
                  >
                    Chưa có combo nào.
                  </Text>
                )}
              </ScrollView>
            )}
          </View>

          {/* Right: form combo */}
          <View style={styles.rightPane}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text ?? "#e5e7eb" },
              ]}
            >
              {editingCombo ? "Chỉnh sửa combo" : "Thêm combo mới"}
            </Text>

            {/* input file ẩn cho web */}
            {Platform.OS === "web" && (
              // @ts-ignore
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleUploadImageFromFileInput}
              />
            )}

            <View style={styles.form}>
              <Text style={styles.label}>Tên combo</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nhập tên combo"
                placeholderTextColor="#6b7280"
                style={[styles.input, { color: theme.text ?? "#e5e7eb" }]}
              />

              <Text style={styles.label}>Danh mục</Text>
              {loadingCategories ? (
                <Text style={styles.helperText}>Đang tải danh mục...</Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginVertical: 4 }}
                >
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.chip,
                        categoryId === cat.id && styles.chipActive,
                      ]}
                      onPress={() => setCategoryId(cat.id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          categoryId === cat.id && styles.chipTextActive,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Mô tả ngắn cho combo"
                placeholderTextColor="#6b7280"
                style={[
                  styles.input,
                  styles.inputMultiline,
                  { color: theme.text ?? "#e5e7eb" },
                ]}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Ảnh combo</Text>
              {imageUrl ? (
                <View style={styles.previewRow}>
                  <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
                  <TouchableOpacity
                    onPress={() => setImageUrl("")}
                    style={styles.clearImageButton}
                  >
                    <Text style={styles.clearImageText}>Xoá ảnh</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.helperText}>
                  Chưa có ảnh. Hãy upload ảnh combo.
                </Text>
              )}

              <TouchableOpacity
                style={[styles.outlineButton]}
                onPress={handleOpenFilePicker}
              >
                <Text style={styles.outlineButtonText}>
                  Chọn & upload ảnh (Cloudinary)
                </Text>
              </TouchableOpacity>

              <Text style={styles.label}>Chọn sản phẩm trong combo</Text>
              {loadingProducts ? (
                <Text style={styles.helperText}>Đang tải sản phẩm...</Text>
              ) : (
                <ScrollView
                  style={styles.productsScroll}
                  contentContainerStyle={{ paddingVertical: 4 }}
                >
                  {products.map((p) => {
                    const selected = selectedProductIds.includes(p.id);
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={[
                          styles.productRow,
                          selected && styles.productRowSelected,
                        ]}
                        onPress={() => toggleProductSelection(p.id)}
                      >
                        <View style={styles.productRowLeft}>
                          <View style={styles.checkboxOuter}>
                            {selected && <View style={styles.checkboxInner} />}
                          </View>
                          <Text
                            style={[
                              styles.productRowText,
                              selected && styles.productRowTextSelected,
                            ]}
                            numberOfLines={1}
                          >
                            {p.name}
                          </Text>
                        </View>
                        <Text style={styles.productRowPrice}>
                          {formatCurrency(p.price)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {products.length === 0 && !loadingProducts && (
                    <Text style={styles.helperText}>
                      Chưa có sản phẩm nào. Hãy thêm sản phẩm trước.
                    </Text>
                  )}
                </ScrollView>
              )}

              <Text style={styles.label}>
                Tổng giá combo (tự tính theo sản phẩm)
              </Text>
              <Text style={styles.totalPriceText}>
                {formatCurrency(totalPrice)}
              </Text>

              <Text style={styles.label}>Giá sale (priceSale)</Text>
              <TextInput
                value={priceSale}
                onChangeText={setPriceSale}
                placeholder="Nhập giá sale cho combo"
                keyboardType="numeric"
                placeholderTextColor="#6b7280"
                style={[styles.input, { color: theme.text ?? "#e5e7eb" }]}
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
                      {editingCombo ? "Lưu thay đổi" : "Thêm combo"}
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

// helper
function formatCurrency(value: number) {
  if (typeof value !== "number" || isNaN(value)) return "0 đ";
  try {
    return value.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    });
  } catch {
    return `${value} đ`;
  }
}

// styles
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
  cardLeft: { flexDirection: "row", gap: 10, flex: 1 },
  comboImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#0f172a",
  },
  comboImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
  },
  comboName: { fontSize: 14, fontWeight: "600" },
  comboPrice: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  comboPriceSale: { fontSize: 12, color: "#22c55e", marginTop: 2 },
  comboDescription: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
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
  helperText: { fontSize: 11, color: "#6b7280", marginBottom: 4 },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  imagePreview: { width: 64, height: 64, borderRadius: 12 },
  clearImageButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  clearImageText: { fontSize: 11, color: "#f97316" },
  outlineButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4f46e5",
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 4,
  },
  outlineButtonText: { color: "#4f46e5", fontSize: 13, fontWeight: "500" },
  formActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  center: { marginTop: 16, alignItems: "center" },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  chipText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  chipTextActive: {
    color: "#f9fafb",
    fontWeight: "600",
  },
  productsScroll: {
    maxHeight: 180,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
    backgroundColor: "#020617",
    paddingHorizontal: 4,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  productRowSelected: {
    backgroundColor: "#111827",
  },
  productRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  checkboxOuter: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#4b5563",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: "#4f46e5",
  },
  productRowText: {
    fontSize: 12,
    color: "#e5e7eb",
    flex: 1,
  },
  productRowTextSelected: {
    fontWeight: "600",
  },
  productRowPrice: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 8,
  },
  totalPriceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#22c55e",
    marginTop: 4,
  },
});
