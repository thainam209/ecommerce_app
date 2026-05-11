// app/(tabs)/index.tsx
import React, { use, useEffect, useState } from "react";
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
import * as SecureStore from 'expo-secure-store';

export default function AdminLoginScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const router = useRouter();

  const getToken = async () => {
    try {
      return await localStorage.getItem("admin_token");
    } catch (error) {
      console.error('Lỗi lấy token:', error);
      return null;
    }
  };

  const token = getToken();
  // Giải mã token để lấy thông tin admin (nếu có)

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState<null | {id: number; username: string; email: string; role: string }>(null);

  //gọi api lấy thông tin user về hiển thị
  const infoUser = async () => {
    try
    {
      const token = await getToken();
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/infouser`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data.infouser);
    }
    catch (error)
    {
      console.log('Lỗi lấy thông tin user:', error);
    }
  };

  useEffect(() => {
    infoUser();
  }, []);

  async function handleLogin() {
    if (!email.trim() || !password) {
      alert("Lỗi"+ ": " + "Nhập đầy đủ email và mật khẩu");
      return;
    }

    try {
      setIsLogin(true);

      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email.trim(),
        password,
        apikey: APIKEY
      });

      const token = res.data.token;

      if (!token) {
        alert("Lỗi"+ ": " + "Sai tài khoản hoặc mật khẩu");
        return;
      }

      if (res.data.role !== "admin") {
        alert("Lỗi"+ ": " + "Tài khoản này không phải admin!");
        return;
      }

      setPassword("");
      alert("Đăng nhập admin thành công!");
      setIsLogin(false);

      router.replace("/(tabs)/dashboard/dashboard");
      //lưu token vào localStorage
      localStorage.setItem("admin_token", token);
    } catch (err) {
      Alert.alert("Lỗi", "Không kết nối được server");
    } 
  }

    async function handleLogout() {
      await localStorage.removeItem("admin_token"); // Xoá token khỏi localStorage
      Alert.alert("Đăng xuất thành công");
      //reload lại trang hiện tại (index.tsx) để show form login
      setIsLogin(true);
      window.location.reload();
    }

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Admin Account</Text>
        {/* <Text>{API_BASE_URL}</Text>
        <Text>{APIKEY}</Text> */}
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
              // disabled={isLogin}
            >
              {isLogin ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Đăng Nhập</Text>
              )}
            </TouchableOpacity>

            <Text style={{ marginTop: 10, color: "#777", fontSize: 12 }}>
              * Chỉ tài khoản có role = admin mới đăng nhập được.
            </Text>
          </View>
        
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
