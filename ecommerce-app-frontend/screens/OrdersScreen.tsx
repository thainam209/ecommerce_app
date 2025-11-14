import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import API_URL from '../config/api';

export default function OrdersScreen({navigation}: any) {

  // Giả định dữ liệu đơn hàng (thay bằng API nếu có)
  const orders = []; // Thêm logic lấy orders từ API nếu có

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Orders: {orders.length}</Text>
      <Button title="Back to Products" onPress={() => navigation.navigate('Products')} />
    </View>
  );
}