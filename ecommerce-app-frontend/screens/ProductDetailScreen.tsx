import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../type/types';

type ProductDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen({ navigation, route }: { navigation: ProductDetailScreenNavigationProp; route: ProductDetailScreenRouteProp; }) {
  const [product, setProduct] = useState<any>(null); // Thay 'any' bằng kiểu cụ thể nếu có
  const { productId } = route.params;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/products/${productId}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Fetch product error:', error);
      }
    };
    fetchProduct();
  }, [productId]);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Product ID: {productId}</Text>
      {product && <Text>Details: {JSON.stringify(product)}</Text>}
      <Button title="Back" onPress={() => navigation.goBack()} />
    </View>
  );
}