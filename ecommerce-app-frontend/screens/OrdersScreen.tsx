import React, { use, useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import API_URL from '../config/api';

const Order = ({ createdAt, status, orderPrice, onPress }:any) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.order}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Ngày tạo đơn: </Text>
          <Text style={{ fontSize: 16 }}>{createdAt}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Trạng thái đơn hàng: </Text>
          {/* Nếu trạng thái pending thì màu cam, on delivery màu xanh lá, delivered màu xám, canceled màu đỏ */}
          <Text style={{ color: status === 'approved - unpaid' ? 'orange'
                              : status === 'approved - paid' ? 'orange' 
                              : status === 'on delivery' ? 'green' 
                              : status === 'delivered' ? 'gray' 
                              : 'red', fontSize: 16 }}>
            {status}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Giá: </Text>
          <Text style={{ fontSize: 16, color:'green', fontWeight: 'bold' }}>{orderPrice} Vnđ</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function OrdersScreen({navigation}: any) {
  //lưu các orders vào state
  const [orders,setOrders] = useState<any[]>([]); 
  //lưu danh orderitem theo order
  const [orderItems,setOrderItems] = useState<any[]>([]); 
  //lưu danh sách sản phẩm
  const [products,setProducts] = useState<any[]>([]); 

  const getToken = async () => {
    try {
      return await SecureStore.getItemAsync('token');
    } catch (error) {
      console.error('Lỗi lấy token:', error);
      return null;
    }
  };

  //đang làm dở chỗ lấy danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20}}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 40, marginBottom: 20, color:'#2A4BA0' }}>Danh sách đơn hàng của bạn</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {/* tạo một tìm kiếm đơn hàng theo thời gian tạo */}
        
      </View>
      <Text style={{ marginTop: 30,fontSize:16, fontWeight: 'bold' }}>Nhấn vào đơn hàng để xem chi tiết đơn hàng</Text>
      {/*Lấy danh sách orderId -> lấy orderitem theo orderId -> lấy chi tiết sản phẩm theo id trong orderitem */}
      <ScrollView style={{ flex:1 }}>
        <View style={{ marginTop: 20 }}>
          {orders.map((order) => (
            <Order
              key={order.id}
              createdAt={new Date(order.createdAt).toLocaleString()}
              status={order.status}
              orderPrice={order.total}
              onPress={() => navigation.navigate('OrderDetailScreen', { orderId: order.id, status: order.status })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonStatus: {
    backgroundColor: '#2A4BA0',
    padding: 10,
    borderRadius: 16,
    marginTop: 10,
    alignItems: 'center',
    width: '30%',
    height: 50,
    paddingTop: 14,
  },
  textbuttonStatus: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  order: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 16,
    marginTop: 10,
  },
}); 