import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../type/types';

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Cart'>;

export default function CartScreen() {
  const navigation = useNavigation<CartScreenNavigationProp>();

  // Giả định dữ liệu giỏ hàng (thay bằng API hoặc state quản lý)
  const cartItems = []; // Thêm logic lấy cart từ API nếu có

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Cart Items: {cartItems.length}</Text>
      <Button title="Back to Products" onPress={() => navigation.navigate('Products')} />
    </View>
  );
}