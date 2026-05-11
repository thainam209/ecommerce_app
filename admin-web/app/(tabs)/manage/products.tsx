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
import API_BASE_URL from '../../../config/api';
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import axios from "axios";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BackToManageButton } from "@/components/BackToManageButton";


type Category = {
  id: number;
  name: string;
};

type products = {
  id: number;
  name: string;
  price: number;
  categoryId?: number;
  image?: string;
  description?: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

export default function ManageProductsScreen() {
  const router = useRouter();

  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme] as any;

  const getToken = async () => {
    try {
      return await localStorage.getItem("admin_token");
    } catch (error) {
      console.error('Lỗi lấy token:', error);
      return null;
    }
  };

  const [products, setProducts] = useState<products[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<products | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // File input cho web (upload ảnh)
  const fileInputRef = useRef<any>(null);
  
  

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const token = await getToken();
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
    }
  }

  async function fetchProducts(page: number = 1, limit: number = 20) {
    try {
      const token = await getToken();
      if (!token) return;
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/products?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const json = await res.json();
      //
      const data: products[] = json.data ?? json.products ?? json;
      const pag: Pagination =
        json.pagination ?? json.meta ?? {
          page,
          limit,
          total: data?.length ?? 0,
          totalPages: 1,
          hasMore: false,
        };
      // Nếu page = 1 thì set mới, còn page > 1 thì append vào cuối
      if (page === 1) {
        setProducts(data || []);
      } else {
        setProducts((prev) => [...prev, ...(data || [])]);
      }
      setPagination(pag);
    } catch (e: any) {
      console.error("Fetch products error:", e?.message);
      alert("Lỗi"+ "Không tải được danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName("");
    setPrice("");
    setCategoryId(null);
    setDescription("");
    setImageUrl("");
    setEditingProduct(null);
  }

  function openCreateForm() {
    resetForm();
    setIsFormOpen(true);
  }

  function openEditForm(product: products) {
    // alert('hihihi');
    setEditingProduct(product);
    setName(product.name ?? "");
    setPrice(product.price?.toString() ?? "");
    setCategoryId(product.categoryId ?? null);
    setDescription(product.description ?? "");
    setImageUrl(product.image ?? "");
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    resetForm();
  }

  async function handleSave() {
    if (!name.trim()) {
      alert("Lỗi" + ": " + "Tên sản phẩm không được để trống");
      return;
    }
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      alert("Lỗi" + ": " + "Giá sản phẩm không hợp lệ");
      return;
    }

    const token = await getToken();
    if (!token) {
      alert("Lỗi" + ": " + "Phiên hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    const payload: any = {
      name: name.trim(),
      price: numericPrice,
      categoryId: Number(categoryId) || null,
      description: description.trim() || null,
      image: imageUrl || null,
    };

    const isEdit = Boolean(editingProduct?.id);
    const url = isEdit
      ? `${API_BASE_URL}/products/admin/${editingProduct!.id}`
      : `${API_BASE_URL}/products/admin`;
    const method = isEdit ? "PUT" : "POST";

    try {
      setSaving(true);
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Save product error:", errorText);
        alert("Lỗi" + ": " + "Không lưu được sản phẩm");
        return;
      }

      await fetchProducts();
      closeForm();
    } catch (e: any) {
      console.error("Save product exception:", e?.message);
      alert("Lỗi" + ": " + "Có lỗi khi lưu sản phẩm");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: products) {
    const token = await getToken();

    if (!token) {
      alert("Lỗi" + ": " + "Phiên hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    const result = confirm("Xoá sản phẩm"+`Bạn có chắc chắn muốn xoá sản phẩm ?`);

    if (result) {
      try {
        const res = await fetch(
          `${API_BASE_URL}/products/admin/${product.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) {
          const t = await res.text();
          console.error("Delete product error:", t);
          alert("Lỗi" + ": " + "Không xoá được sản phẩm");
          return;
        }
        // Xoá khỏi state
        setProducts((prev) =>
          prev.filter((p) => p.id !== product.id)
        );
      } catch (e: any) {
        console.error("Delete product exception:", e?.message);
        alert("Lỗi"+ ": " + e?.message);
      }
    };
  }

  function handleOpenFilePicker() {
    if (Platform.OS === "web") {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      } else {
        alert("Lỗi: Không tìm thấy input file");
      }
    } else {
      alert(
        "Upload ảnh thành công"
      );
    }
  }

  async function handleFileChange(event: any) {
    const file = event?.target?.files?.[0];
    if (!file) return;

    try {
        const url = await uploadImageToCloudinary(file);
        setImageUrl(url);
        alert("Thành công! Ảnh đã được upload lên Cloudinary");
    } catch (err: any) {
        alert("Lỗi"+ err.message );
    }

    event.target.value = ""; // reset input
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
                <Text style={[styles.title, { color: theme.text ?? "#e5e7eb" }]}>
                  Quản lý sản phẩm
                </Text>
                <Text
                  style={[styles.subtitle, { color: theme.muted ?? "#9ca3af" }]}
                >
                  Thêm, chỉnh sửa, xoá sản phẩm trong hệ thống
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.primaryButton, styles.shadow]}
                onPress={openCreateForm}
              >
                <Text style={styles.primaryButtonText}>+ Thêm sản phẩm</Text>
              </TouchableOpacity>
          </View>

        {/* Danh sách + Form */}
        <View style={styles.contentRow}>
          {/* Bên trái: Danh sách sản phẩm */}
          <View style={styles.leftPane}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text ?? "#e5e7eb" },
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
                    color: theme.muted ?? "#9ca3af",
                  }}
                >
                  Đang tải sản phẩm...
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.list}
                contentContainerStyle={{ paddingBottom: 16 }}
              >
                {products.map((p) => (
                  <View key={p.id} style={[styles.card, styles.shadow]}>
                    <View style={styles.cardLeft}>
                      {p.image ? (
                        <Image
                          source={{ uri: p.image }}
                          style={styles.productImage}
                        />
                      ) : (
                        <View style={styles.productImagePlaceholder}>
                          <Text style={{ color: "#6b7280", fontSize: 11 }}>
                            No image
                          </Text>
                        </View>
                      )}

                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.productName,
                            { color: "#e5e7eb" },
                          ]}
                          numberOfLines={1}
                        >
                          {p.name}
                        </Text>
                        <Text style={styles.productPrice}>
                          {formatCurrency(p.price)}
                        </Text>
                        {p.description ? (
                          <Text
                            style={styles.productDescription}
                            numberOfLines={2}
                          >
                            {p.description}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={[styles.secondaryButton]}
                        onPress={() => openEditForm(p)}
                      >
                        <Text style={styles.secondaryButtonText}>Sửa</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.dangerButton]}
                        onPress={() => handleDelete(p)}
                      >
                        <Text style={styles.dangerButtonText}>Xoá</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {products.length === 0 && !loading && (
                  <Text
                    style={{
                      color: theme.muted ?? "#9ca3af",
                      fontStyle: "italic",
                    }}
                  >
                    Chưa có sản phẩm nào.
                  </Text>
                )}
              </ScrollView>
            )}
            {/* thêm nút load more */}
            {/* khi ấn nút sẽ render ra thêm sản phẩm nhưng không mất dữ liệu trước đó */}
             {pagination?.hasMore && (
              <TouchableOpacity
                style={[{backgroundColor: '#0b5bda', marginTop:20, width: 100, height:50, borderRadius: 25, justifyContent: 'center', paddingLeft:15},
                   { alignSelf: "center" }]}
                onPress={() => fetchProducts(pagination.page + 1, pagination.limit)}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Load More</Text>
              </TouchableOpacity>
            )} 
          </View>

          {/* Bên phải: Form thêm / sửa */}
          <ScrollView style={styles.rightPane} contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={styles.rightPane}>
            <Text
              style={[
                styles.sectionTitle,
                { color: "#e5e7eb" },
              ]}
            >
              {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </Text>

            {/* Input file ẩn cho web */}
            {Platform.OS === "web" && (
              // @ts-ignore
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            )}

            <View style={styles.form}>
              <Text style={styles.label}>Tên sản phẩm</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nhập tên sản phẩm"
                placeholderTextColor="#6b7280"
                style={[
                  styles.input,
                  { color: "#e5e7eb" },
                ]}
              />

              <Text style={styles.label}>Giá</Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="Nhập giá (VND)"
                keyboardType="numeric"
                placeholderTextColor="#6b7280"
                style={[
                  styles.input,
                  { color: "#e5e7eb" },
                ]}
              />
              <Text style={styles.label}>Category </Text>
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
              {/* <TextInput
                  value={categoryId}
                  onChangeText={setCategoryId}
                  placeholder="Nhập Category ID"
                  keyboardType="numeric"
                  placeholderTextColor="#6b7280"
                  style={[
                      styles.input,
                      { color: "#e5e7eb" },
                  ]}
              /> */}
              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Mô tả ngắn về sản phẩm"
                placeholderTextColor="#6b7280"
                style={[
                  styles.input,
                  styles.inputMultiline,
                  { color: "#e5e7eb" },
                ]}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Ảnh sản phẩm</Text>
              {imageUrl ? (
                <View style={styles.previewRow}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.imagePreview}
                  />
                  <TouchableOpacity
                    onPress={() => setImageUrl("")}
                    style={styles.clearImageButton}
                  >
                    <Text style={styles.clearImageText}>Xoá ảnh</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.helperText}>
                  Chưa có ảnh. Hãy upload ảnh lên Cloudinary.
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

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={[styles.secondaryButton, { flex: 1 }]}
                  onPress={closeForm}
                >
                  <Text style={styles.secondaryButtonText}>Huỷ</Text>
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
                      {editingProduct ? "Lưu thay đổi" : "Thêm mới"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

// === Helper ===

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

// === Styles ===

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  contentRow: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 0,
  },
  leftPane: {
    flex: 1.2,
  },
  rightPane: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#020617",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  list: {
    marginTop: 4,
  },
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
  cardLeft: {
    flexDirection: "row",
    gap: 10,
    flex: 1,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#0f172a",
  },
  productImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
  },
  productPrice: {
    fontSize: 13,
    color: "#22c55e",
    marginTop: 2,
  },
  productDescription: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
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
  primaryButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  secondaryButtonText: {
    color: "#e5e7eb",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  dangerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#b91c1c",
  },
  dangerButtonText: {
    color: "#fee2e2",
    fontSize: 12,
    fontWeight: "500",
  },
  form: {
    marginTop: 4,
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: "#020617",
  },
  inputMultiline: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  helperText: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  imagePreview: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  clearImageButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  clearImageText: {
    fontSize: 11,
    color: "#f97316",
  },
  outlineButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4f46e5",
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 4,
  },
  outlineButtonText: {
    color: "#4f46e5",
    fontSize: 13,
    fontWeight: "500",
  },
  formActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  center: {
    marginTop: 16,
    alignItems: "center",
  },
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
  }
});