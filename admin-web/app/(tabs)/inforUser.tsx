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

    async function handleLogout() {
      await localStorage.removeItem("admin_token"); // Xoá token khỏi localStorage
      Alert.alert("Đăng xuất thành công");
      router.push("/(tabs)"); // Điều hướng về trang login
    }

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Admin Account</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin Admin</Text>
            <Text style={styles.info}>Username: {user?.username}</Text>
            <Text style={styles.info}>Email: {user?.email}</Text>
            <Text style={styles.info}>Role: {user?.role}</Text>
            
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
