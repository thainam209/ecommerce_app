import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, Switch, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import API_URL from '../config/api';
import APIKEY from '../config/key';

export default function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRemembered, setIsRemembered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const login = async () => {
    console.log('API_URL:', API_URL);
    console.log('APIKEY:', APIKEY);
    if (isLoading) return;

    // Reset lỗi cũ (nếu có)
    setIsLoading(true);

    // Validate input
    if (!email.trim() || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email.trim(),
        password,
        apikey: APIKEY
      });

      const token = response.data.token;

      if (!token) {
        Alert.alert('Lỗi', 'Không nhận được token từ server');
        setIsLoading(false);
        return;
      }

      // Lưu token nếu nhớ mật khẩu (tùy chọn)
      await SecureStore.setItemAsync('token', token);

      if (isRemembered) {
        await SecureStore.setItemAsync('rememberedEmail', email.trim());
      } else {
        await SecureStore.deleteItemAsync('rememberedEmail');
      }

      // Thành công → chuyển sang Home
      Alert.alert('Thành công', 'Đăng nhập thành công!', [
        { text: 'OK', onPress: () => navigation.navigate('HomeScreen') }
      ]);

    } catch (error: any) {
      setIsLoading(false);

      // Xử lý lỗi cụ thể từ server
      if (error.response) {
        const status = error.response.status;

        if (status === 401) {
          Alert.alert(
            'Đăng nhập thất bại',
            'Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại.',
            [{ text: 'OK' }]
          );
        } else if (status === 400) {
          Alert.alert('Lỗi', 'Dữ liệu gửi lên không hợp lệ');
        } else if (status >= 500) {
          Alert.alert('Lỗi máy chủ', 'Server đang gặp sự cố. Vui lòng thử lại sau.');
        } else {
          Alert.alert('Lỗi', 'Không thể kết nối đến server');
        }
      } else if (error.request) {
        Alert.alert('Lỗi mạng', 'Không có kết nối internet. Vui lòng kiểm tra lại.');
      } else {
        Alert.alert('Lỗi', 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    }
  };

  // Tự động điền email nếu đã nhớ trước đó
  React.useEffect(() => {
    const loadRememberedEmail = async () => {
      const savedEmail = await SecureStore.getItemAsync('rememberedEmail');
      if (savedEmail) {
        setEmail(savedEmail);
        setIsRemembered(true);
      }
    };
    loadRememberedEmail();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sign In</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.logoContainer}>
        <Text style={styles.welcomeText}>Welcome to app!</Text>
        <Text style={styles.subText}>
          Sign in to continue enjoying our amazing shopping services.
        </Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>EMAIL</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#8891A5"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>PASSWORD</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#8891A5"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {/* Remember Me */}
        <View style={styles.rememberContainer}>
          <Switch
            value={isRemembered}
            onValueChange={setIsRemembered}
            trackColor={{ false: '#D3D3D3', true: '#2A4BA0' }}
            thumbColor={isRemembered ? '#FFFFFF' : '#F8F9FB'}
          />
          <Text style={styles.rememberText}>Remember Me</Text>
        </View>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Sign In Button */}
      <TouchableOpacity
        style={[
          styles.signInButton,
          isLoading && styles.signInButtonDisabled
        ]}
        onPress={login}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.signInButtonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      {/* Sign Up Link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
          <Text style={styles.footerLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles giữ nguyên như cũ
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { paddingTop: 50, padding: 20, backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 24, fontWeight: '600', color: '#2A4BA0', textAlign: 'center' },
  logoContainer: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  welcomeText: { fontSize: 24, fontWeight: '600', color: '#2A4BA0', marginTop: 15, paddingBottom: 15 },
  subText: { fontSize: 14, color: '#616A7D', textAlign: 'center', marginHorizontal: 20 },
  formContainer: { padding: 20 },
  label: { fontSize: 12, fontWeight: '600', color: '#1A2530', marginBottom: 5 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 15, fontSize: 16, color: '#1A2530', marginBottom: 15 },
  rememberContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  rememberText: { fontSize: 14, color: '#1A2530', marginLeft: 10 },
  forgotPassword: { alignItems: 'flex-end', paddingHorizontal: 20, marginBottom: 10 },
  forgotPasswordText: { fontSize: 14, color: '#2A4BA0', fontWeight: '600' },
  signInButton: { backgroundColor: '#2A4BA0', borderRadius: 16, paddingVertical: 15, alignItems: 'center', margin: 20 },
  signInButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  signInButtonDisabled: { backgroundColor: '#8a9fc2', opacity: 0.7 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 14, color: '#616A7D' },
  footerLink: { fontSize: 14, fontWeight: '600', color: '#2A4BA0' },
});