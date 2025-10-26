import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../type/types';

type OrdersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Orders'>;

export default function OrdersScreen() {
  const navigation = useNavigation<OrdersScreenNavigationProp>();

  // Giả định dữ liệu đơn hàng (thay bằng API nếu có)
  const orders = []; // Thêm logic lấy orders từ API nếu có

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Orders: {orders.length}</Text>
      <Button title="Back to Products" onPress={() => navigation.navigate('Products')} />
    </View>
  );
}