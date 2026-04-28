// app/(tabs)/index.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import API_BASE_URL from "../../config/api";
import APIKEY from "@/config/key";
import { useRouter } from "expo-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import axios from 'axios';
import * as jwt_decode from 'jwt-decode';
import { BackToDashboardButton } from "@/components/BackToDashboardButton";

export default function AdminLoginScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const router = useRouter();

  // 🔥 dùng hook auth, KHÔNG tự redirect ở màn login
  const { loading: authLoading, isAdmin, user, login, logout } =
    useAdminAuth({ redirectToLogin: false });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Nếu đã login admin rồi thì đưa thẳng sang dashboard
  useEffect(() => {
    if (!authLoading && isAdmin) {
      router.replace("/(tabs)/dashboard/dashboard");
    }
  }, [authLoading, isAdmin, router]);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Lỗi", "Nhập đầy đủ email và mật khẩu");
      return;
    }

    try {
      setLoggingIn(true);

      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email.trim(),
        password,
        apikey: APIKEY
      });

      const token = res.data.token;

      if (!token) {
        Alert.alert("Sai tài khoản hoặc mật khẩu");
        return;
      }

      if (res.data.role !== "admin") {
        Alert.alert("Lỗi", "Tài khoản này không phải admin!");
        return;
      }

      // Decode JWT để lấy id từ token
      const decoded: any = jwt_decode.jwtDecode(token);
      
      // Tạo object AuthUser đúng định dạng
      const authUser = {
        id: decoded.id,
        username: email.split("@")[0], // Tạm dùng phần trước @ làm username
        email: email.trim(),
        role: res.data.role
      };

      // 🔥 cập nhật hook auth với object đúng định dạng
      await login(token, authUser);

      setPassword("");
      Alert.alert("Thành công", "Đăng nhập admin thành công!");

      router.replace("/(tabs)/dashboard/dashboard");
    } catch (err) {
      Alert.alert("Lỗi", "Không kết nối được server");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await logout(); // hook sẽ clear token và replace về / (tabs)
  }

  if (authLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: "#999" }}>
          Đang kiểm tra phiên đăng nhập...
        </Text>
      </View>
    );
  }

  const loggedIn = isAdmin && !!user;

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Admin Account</Text>
        <Text>{API_BASE_URL}</Text>
        <Text>{APIKEY}</Text>
        {!loggedIn ? (
          // Form login như cũ
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Đăng nhập Admin</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="admin@example.com"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loggingIn}
            >
              {loggingIn ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Đăng Nhập</Text>
              )}
            </TouchableOpacity>

            <Text style={{ marginTop: 10, color: "#777", fontSize: 12 }}>
              * Chỉ tài khoản có role = admin mới đăng nhập được.
            </Text>
          </View>
        ) : (
          // Thông tin admin + nút logout
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin Admin</Text>

            <Text style={styles.info}>ID: {user!.id}</Text>
            <Text style={styles.info}>Username: {user!.username}</Text>
            <Text style={styles.info}>Email: {user!.email}</Text>
            <Text style={styles.info}>Role: {user!.role}</Text>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#0a0af1", marginTop: 16 }]}
              onPress={() => router.push("/(tabs)/dashboard/dashboard")}
            >
              <Text style={styles.buttonText}>  Quay về Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#ef4444", marginTop: 16 }]}
              onPress={handleLogout}
            >
              <Text style={styles.buttonText}>Đăng Xuất</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  card: {
    padding: 16,
    backgroundColor: "#111827",
    borderRadius: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 12 },
  label: { marginTop: 8, color: "#ccc", fontSize: 13 },
  input: {
    backgroundColor: "#1f2937",
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
    color: "#fff",
  },
  button: {
    backgroundColor: "#4f46e5",
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  info: {
    color: "#eee",
    marginTop: 6,
    fontSize: 14,
  },
});
