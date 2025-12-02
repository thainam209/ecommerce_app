import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import API_BASE_URL from "@/config/api";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useRouter } from "expo-router";

type Order = {
  id: number;
  userId: number;
  status: string;
  total: number;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
};

type DailyStat = {
  date: string; // YYYY-MM-DD
  orderCount: number;
  revenue: number;
};

type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  canceledOrders: number;
  todayRevenue: number;
  todayOrders: number;
  days: DailyStat[];
};

function buildStats(orders: Order[]): DashboardStats {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  let totalRevenue = 0;
  let totalOrders = 0;
  let completedOrders = 0;
  let pendingOrders = 0;
  let canceledOrders = 0;
  let todayRevenue = 0;
  let todayOrders = 0;

  const map: Record<string, { revenue: number; count: number }> = {};

  for (const o of orders) {
    const total = Number(o.total ?? 0);
    const dateKey = new Date(o.createdAt).toISOString().slice(0, 10);

    totalOrders += 1;

    if (o.status === "completed") {
      completedOrders += 1;
      totalRevenue += total;

      if (!map[dateKey]) map[dateKey] = { revenue: 0, count: 0 };
      map[dateKey].revenue += total;
      map[dateKey].count += 1;

      if (dateKey === todayKey) {
        todayRevenue += total;
        todayOrders += 1;
      }
    } else if (
      o.status === "pending" ||
      o.status === "processing" ||
      o.status === "shipping"
    ) {
      pendingOrders += 1;
    } else if (o.status === "canceled" || o.status === "cancelled") {
      canceledOrders += 1;
    }
  }

  const days: DailyStat[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);

    const entry = map[key] ?? { revenue: 0, count: 0 };
    days.push({
      date: key,
      orderCount: entry.count,
      revenue: entry.revenue,
    });
  }

  return {
    totalRevenue,
    totalOrders,
    completedOrders,
    pendingOrders,
    canceledOrders,
    todayRevenue,
    todayOrders,
    days,
  };
}

const formatCurrency = (value: number) =>
  value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const themeColors = Colors[colorScheme] as any;
  const router = useRouter();

  const { token, isAdmin, loading: authLoading } = useAdminAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Một số màu “brand” cho dashboard
  const accent = colorScheme === "dark" ? "#38bdf8" : "#0ea5e9"; // xanh dương
  const success = "#22c55e";
  const warning = "#eab308";
  const danger = "#ef4444";

  async function fetchOrders() {
    try {
      if (!token || !isAdmin) return;

      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/orders/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Không thể tải dữ liệu đơn hàng");
      }

      const list: Order[] = json || [];
      setOrders(list);
      setStats(buildStats(list));
    } catch (err: any) {
      console.error("Fetch orders error:", err);
      setError(err?.message || "Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!token || !isAdmin) return;
    fetchOrders();
  }, [authLoading, token, isAdmin]);

  const maxRevenueInWeek = useMemo(() => {
    if (!stats) return 1;
    const max = Math.max(...stats.days.map((d) => d.revenue), 1);
    return max || 1;
  }, [stats]);

  if (authLoading) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: themeColors.background },
        ]}
      >
        <ActivityIndicator size="large" color={accent} />
        <Text style={[styles.loadingText, { color: themeColors.muted }]}>
          Đang kiểm tra phiên đăng nhập...
        </Text>
      </View>
    );
  }

  if (!token || !isAdmin) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: themeColors.background },
        ]}
      >
        <Text style={[styles.title, { color: themeColors.text }]}>
          Không có quyền truy cập
        </Text>
        <Text style={[styles.subtitle, { color: themeColors.muted }]}>
          Vui lòng đăng nhập lại bằng tài khoản admin.
        </Text>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: accent, marginTop: 16 }]}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.primaryButtonText}>Quay về màn đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: themeColors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      {/* HEADER MODERN */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: accent,
            shadowColor: "#000",
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.headerLabel}>Admin Dashboard</Text>
          <Text style={styles.headerTitle}>Tổng quan kinh doanh</Text>
          <Text style={styles.headerSub}>
            Theo dõi doanh thu và hiệu suất đơn hàng trong 7 ngày gần nhất.
          </Text>
        </View>
        {stats && (
          <View style={styles.headerStats}>
            <Text style={styles.headerStatsLabel}>Doanh thu hôm nay</Text>
            <Text style={styles.headerStatsValue}>
              {formatCurrency(stats.todayRevenue)}
            </Text>
            <Text style={styles.headerStatsSub}>
              {stats.todayOrders} đơn completed
            </Text>
          </View>
        )}
      </View>

      {/* MENU ICON NAVIGATION */}
      <Text
        style={[
          styles.sectionTitle,
          { color: themeColors.text, marginTop: 16, marginBottom: 8 },
        ]}
      >
        Điều hướng nhanh
      </Text>

      <View style={styles.menuRow}>
        <MenuItem
          label="Dashboard"
          sub="Tổng quan & báo cáo"
          icon="📊"
          color={accent}
          onPress={() => router.replace("/(tabs)/dashboard/dashboard")}
        />
        <MenuItem
          label="Quản lý"
          sub="Sản phẩm, danh mục"
          icon="🗂️"
          color="#6366f1"
          onPress={() => router.push("/(tabs)/manage")}
        />
      </View>

      <View style={[styles.menuRow, { marginTop: 12 }]}>
        <MenuItem
          label="Đơn hàng"
          sub="Trạng thái & xử lý"
          icon="📦"
          color="#f97316"
          onPress={() => router.push("/(tabs)/orders")}
        />
        <MenuItem
          label="Tài khoản"
          sub="Thông tin & đăng xuất"
          icon="👤"
          color="#22c55e"
          onPress={() => router.push("/(tabs)")}
        />
      </View>

      {/* STATE: LOADING / ERROR */}
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={accent} />
          <Text style={[styles.loadingText, { color: themeColors.muted }]}>
            Đang tải dữ liệu đơn hàng...
          </Text>
        </View>
      )}

      {error && (
        <View style={[styles.errorBox, { backgroundColor: "#fef2f2" }]}>
          <Text style={[styles.errorText, { color: danger }]}>{error}</Text>
        </View>
      )}

      {/* NẾU CHƯA CÓ DỮ LIỆU */}
      {!stats && !loading && !error && (
        <Text style={[styles.subtitle, { color: themeColors.muted, marginTop: 12 }]}>
          Chưa có dữ liệu đơn hàng nào để thống kê.
        </Text>
      )}

      {stats && (
        <>
          {/* SUMMARY CARDS HÀNG 1 */}
          <Text
            style={[
              styles.sectionTitle,
              { color: themeColors.text, marginTop: 20 },
            ]}
          >
            Tóm tắt hiệu suất
          </Text>

          <View style={styles.cardsRow}>
            <View style={[styles.summaryCard, styles.shadowCard]}>
              <Text style={styles.summaryLabel}>Tổng doanh thu</Text>
              <Text style={[styles.summaryValue, { color: accent }]}>
                {formatCurrency(stats.totalRevenue)}
              </Text>
              <Text style={styles.summaryChip}>
                {stats.totalOrders} đơn (mọi trạng thái)
              </Text>
            </View>

            <View style={[styles.summaryCard, styles.shadowCard]}>
              <Text style={styles.summaryLabel}>Đơn completed</Text>
              <Text style={[styles.summaryValue, { color: success }]}>
                {stats.completedOrders}
              </Text>
              <Text style={styles.summaryChip}>Đã thanh toán / hoàn tất</Text>
            </View>
          </View>

          {/* SUMMARY CARDS HÀNG 2 */}
          <View style={styles.cardsRow}>
            <View style={[styles.summaryCardSmall, styles.shadowCard]}>
              <Text style={styles.summaryLabelSmall}>Đang xử lý</Text>
              <Text style={[styles.summaryValueSmall, { color: warning }]}>
                {stats.pendingOrders}
              </Text>
              <Text style={styles.summaryChipSmall}>Pending / Processing</Text>
            </View>

            <View style={[styles.summaryCardSmall, styles.shadowCard]}>
              <Text style={styles.summaryLabelSmall}>Đã huỷ</Text>
              <Text style={[styles.summaryValueSmall, { color: danger }]}>
                {stats.canceledOrders}
              </Text>
              <Text style={styles.summaryChipSmall}>Canceled / Cancelled</Text>
            </View>

            <View style={[styles.summaryCardSmall, styles.shadowCard]}>
              <Text style={styles.summaryLabelSmall}>Đơn hôm nay</Text>
              <Text style={[styles.summaryValueSmall, { color: accent }]}>
                {stats.todayOrders}
              </Text>
              <Text style={styles.summaryChipSmall}>Completed trong ngày</Text>
            </View>
          </View>

          {/* MINI CHART 7 NGÀY */}
          <Text
            style={[
              styles.sectionTitle,
              { color: themeColors.text, marginTop: 24, marginBottom: 8 },
            ]}
          >
            Doanh thu 7 ngày gần nhất
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.text }]}>
            Biểu đồ cột đơn giản thể hiện doanh thu mỗi ngày (chỉ tính đơn
            completed).
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 12 }}
          >
            <View style={styles.chartRow}>
              {stats.days.map((d) => {
                const barHeight = Math.max(
                  6,
                  (d.revenue / maxRevenueInWeek) * 90
                );
                return (
                  <View key={d.date} style={styles.chartItem}>
                    <View style={styles.chartBarContainer}>
                      <View
                        style={[
                          styles.chartBar,
                          { height: barHeight, backgroundColor: accent },
                        ]}
                      />
                    </View>
                    <Text style={styles.chartLabelDate}>{formatDate(d.date)}</Text>
                    <Text style={styles.chartLabelValue}>
                      {d.orderCount} đơn
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* BẢNG CHI TIẾT 7 NGÀY */}
          <Text
            style={[
              styles.sectionTitle,
              { color: themeColors.text, marginTop: 8, marginBottom: 6 },
            ]}
          >
            Chi tiết theo ngày
          </Text>

          <View style={[styles.table, styles.shadowCard]}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.cellDate]}>Ngày</Text>
              <Text style={[styles.tableHeaderText, styles.cellOrders]}>Đơn</Text>
              <Text style={[styles.tableHeaderText, styles.cellRevenue]}>
                Doanh thu
              </Text>
            </View>

            {stats.days.map((d) => (
              <View key={d.date} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.cellDate]}>
                  {formatDate(d.date)}
                </Text>
                <Text style={[styles.tableCell, styles.cellOrders]}>
                  {d.orderCount}
                </Text>
                <Text style={[styles.tableCell, styles.cellRevenue]}>
                  {formatCurrency(d.revenue)}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

/** COMPONENT MENU CON CARD ICON */
type MenuItemProps = {
  label: string;
  sub: string;
  icon: string;
  color: string;
  onPress: () => void;
};

const MenuItem: React.FC<MenuItemProps> = ({ label, sub, icon, color, onPress }) => {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.menuIconWrap, { backgroundColor: color + "33" }]}>
        <Text style={[styles.menuIcon, { color }]}>{icon}</Text>
      </View>
      <Text style={styles.menuTitle}>{label}</Text>
      <Text style={styles.menuSub}>{sub}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
  },

  primaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  headerCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  headerLabel: {
    color: "#e0f2fe",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  headerTitle: {
    color: "#f9fafb",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSub: {
    color: "#bae6fd",
    fontSize: 12,
    lineHeight: 16,
  },
  headerStats: {
    alignItems: "flex-end",
    minWidth: 130,
  },
  headerStatsLabel: {
    color: "#e0f2fe",
    fontSize: 11,
  },
  headerStatsValue: {
    color: "#f9fafb",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  headerStatsSub: {
    color: "#bae6fd",
    fontSize: 11,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  // MENU
  menuRow: {
    flexDirection: "row",
    gap: 12,
  },
  menuItem: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#0b1220",
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuTitle: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "600",
  },
  menuSub: {
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 2,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  errorBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "500",
  },

  // SUMMARY CARDS
  cardsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  shadowCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#020617",
    borderRadius: 18,
    padding: 14,
  },
  summaryLabel: {
    color: "#9ca3af",
    fontSize: 12,
  },
  summaryValue: {
    color: "#f9fafb",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  summaryChip: {
    marginTop: 6,
    fontSize: 11,
    color: "#9ca3af",
  },

  summaryCardSmall: {
    flex: 1,
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 10,
  },
  summaryLabelSmall: {
    color: "#9ca3af",
    fontSize: 11,
  },
  summaryValueSmall: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  summaryChipSmall: {
    marginTop: 4,
    fontSize: 10,
    color: "#9ca3af",
  },

  // CHART
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  chartItem: {
    alignItems: "center",
    width: 40,
  },
  chartBarContainer: {
    height: 100,
    width: 20,
    borderRadius: 999,
    backgroundColor: "#020617",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  chartBar: {
    width: "100%",
    borderRadius: 999,
  },
  chartLabelDate: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
  },
  chartLabelValue: {
    fontSize: 10,
    color: "#6b7280",
  },

  // TABLE
  table: {
    marginTop: 4,
    borderRadius: 16,
    backgroundColor: "#020617",
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#020617",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1f2937",
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#111827",
  },
  tableCell: {
    fontSize: 12,
    color: "#e5e7eb",
  },
  cellDate: {
    flex: 1.3,
  },
  cellOrders: {
    flex: 0.7,
    textAlign: "center",
  },
  cellRevenue: {
    flex: 1.5,
    textAlign: "right",
  },
});
