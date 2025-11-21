import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import API_URL from '../config/api';

export default function UserScreen({ navigation }: { navigation: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('Halal User');
  const [email, setEmail] = useState('');

  const getToken = async () => {
      try {
        return await SecureStore.getItemAsync('token');
      } catch (error) {
        console.error('Lỗi lấy token:', error);
        return null;
      }
    };

  //gọi api lấy thông tin user về hiển thị
  const infoUser = async () => {
    try
    {
      const token = await getToken();
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        navigation.navigate('Login');
        return;
      }

      const response = await axios.get(`${API_URL}/infouser`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setName(response.data.infouser.username || '');
      setEmail(response.data.infouser.email || '');
    }
    catch (error)
    {
      console.log('Lỗi lấy thông tin user:', error);
    }
  };

  useEffect(() => {
    infoUser();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
      </View>

      {/* Logo và tiêu đề */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/jack.jpg')} // Thay bằng hình ảnh thực tế
            style={styles.logo}
          />
          <Text style={styles.welcomeText}>{name}</Text>
          <Text style={styles.subText}>Manage your account details below</Text>
        </View>

        {/* Form thông tin */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>FULL NAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            editable={isEditing}
            placeholder="Enter your name"
            placeholderTextColor="#8891A5"
          />

          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            editable={isEditing}
            placeholder="Enter your email"
            placeholderTextColor="#8891A5"
            keyboardType="email-address"
          />
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            navigation.navigate('OrdersScreen');
          }}
        >
          <Text style={styles.saveButtonText}>Xem các đơn hàng của bạn</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
  },
  subText: {
    fontSize: 14,
    color: '#616A7D',
    textAlign: 'center',
    marginHorizontal: 20,
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
  saveButton: {
    backgroundColor: '#2A4BA0',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    margin: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});