import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

type Product = {
  id: string;
  name: string;
  price: number;
};

export default function ProductsScreen({ navigation }: { navigation: any }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Fetch products error:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
            <Text>{item.name} - ${item.price}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}