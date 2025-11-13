import React, { useState } from 'react';
import { View, TextInput, Text, Alert, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { StyleSheet } from 'react-native';
import API_URL from '../config/api';

export default function RegisterScreen({ navigation }: { navigation: any }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    if (!username.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập username');
      return false;
    }
    if (username.trim().length < 3) {
      Alert.alert('Lỗi', 'Username phải có ít nhất 3 ký tự');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return false;
    }
    if (!password) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    return true;
  };

  const register = async () => {
    if (isLoading) return;
    if (!validate()) return;

    setIsLoading(true);
    try {
      //Khi gọi api cần thay đổi localhost thành IP của máy chủ
      await axios.post(`${API_URL}/auth/register`, { username, email, password });
      Alert.alert('Success', 'Registration successful, please login');
      navigation.navigate('LoginScreen');
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert('Error', 'Registration failed');
    }
  };

  return (
    <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text>back</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Sign Up</Text>
              <View style={{ width: 24 }} />
          </View>

          {/* Logo và tiêu đề */}
          <View style={styles.logoContainer}>
              <Text style={styles.welcomeText}>Welcome to Food Shop!</Text>
              <Text style={styles.subText}>
                  Create an account to start exploring the best shopping experience with us.
              </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput
                  style={styles.input}
                  placeholder="John Smith"
                  placeholderTextColor="#8891A5"
                  value={username}
                  onChangeText={setUsername}
              />

              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                  style={styles.input}
                  placeholder="john.smith@example.com"
                  placeholderTextColor="#8891A5"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
              />

              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                  style={styles.input}
                  placeholder="********"
                  placeholderTextColor="#8891A5"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
              />
          </View>
          <TouchableOpacity
              style={styles.signUpButton}
              onPress={register}
          >
              <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
                  <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
          </View>
      </View>
  );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#2A4BA0',
        marginTop: 15,
        paddingBottom: 15,
    },
    subText: {
        fontSize: 14,
        color: '#616A7D',
        textAlign: 'center',
        marginHorizontal: 20,
    },
    header: {
        paddingTop: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2A4BA0',
    },
    formContainer: {
        padding: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1A2530',
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        color: '#1A2530',
        marginBottom: 15,
    },
    forgotPassword: {
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#2A4BA0',
        fontWeight: '600',
    },
    signUpButton: {
        backgroundColor: '#2A4BA0',
        borderRadius: 16,
        paddingVertical: 15,
        alignItems: 'center',
        margin: 20,
    },
    signUpButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        fontSize: 14,
        color: '#616A7D',
    },
    footerLink: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2A4BA0',
    },
});