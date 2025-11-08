import React, { useState } from 'react';
import { StyleSheet} from 'react-native';
import { View, TextInput, TouchableOpacity, Text, Alert, Switch } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';


export default function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRemembered, setIsRemembered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email:string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
    };


  const login = async () => {
    if (isLoading) return;
    setIsLoading(true);
    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
    Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
    return;
    }
    if (!validateEmail(email)) {
    Alert.alert('Lỗi', 'Email không hợp lệ');
    return;
    }
    if (password.length < 6) {
    Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
    return;
    }
    //Mã hóa password trước khi gửi
    // const hashedPassword = await SecureStore.getItemAsync('password');
    //Gọi API đăng nhập
    try {
        //mai check lại xem cần mã hóa  mật khẩu trước khi post vào api không
      const response = await axios.post('http://172.20.10.10:3000/api/auth/login', { email, password }); 
      await SecureStore.setItemAsync('token', response.data.token);
      Alert.alert('Success', 'Login successful');
      navigation.navigate('HomeScreen'); // Chuyển hướng sau khi đăng nhập
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Invalid credentials or server issue');
    }
  };

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
                />

                <Text style={styles.label}>PASSWORD</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#8891A5"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
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
                style={styles.signInButton}
                onPress={login}
            >
                <Text style={styles.signInButtonText}>Sign In</Text>
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
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#2A4BA0',
        textAlign:'center',
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
    rememberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    rememberText: {
        fontSize: 14,
        color: '#1A2530',
        marginLeft: 10,
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
    signInButton: {
        backgroundColor: '#2A4BA0',
        borderRadius: 16,
        paddingVertical: 15,
        alignItems: 'center',
        margin: 20,
    },
    signInButtonText: {
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