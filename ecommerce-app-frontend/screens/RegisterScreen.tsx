import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import axios from 'axios';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

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
      await axios.post('http://localhost:3000/api/auth/register', { username, email, password });
      Alert.alert('Success', 'Registration successful, please login');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert('Error', 'Registration failed');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Register" onPress={register} />
      <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}