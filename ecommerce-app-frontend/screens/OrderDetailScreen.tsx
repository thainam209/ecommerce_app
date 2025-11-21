import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Alert,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import API_URL from '../config/api';

const Orderitem = ({ image, name, price, quantity }: any) => {
  return (
    <View style={styles.containerProduct}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 16, marginTop: 10, marginLeft: 10 }}>
          <Image source={image} style={{ width: 120, height: 90, borderRadius: 16 }} />
        </View>
        <View style={{ marginTop: 15, marginLeft: 20 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{name}</Text>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Giá:</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'green' }}>
              {price.toLocaleString()} ₫
            </Text>
          </View>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 10 }}>
            Số lượng: {quantity}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function OrderDetailScreen({ navigation, route }: any) {
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false); // Modal xác nhận hủy

  const status = route.params.status;
  const orderId = route.params.orderId;

  const getToken = async () => {
    try {
      return await SecureStore.getItemAsync('token');
    } catch (error) {
      console.error('Lỗi lấy token:', error);
      return null;
    }
  };

  const fetchOrderItems = async () => {
    try {
      const token = await getToken();
      const response = await axios.post(
        `${API_URL}/orderitems/orderId`,
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrderItems(response.data.items);

      const productIds = response.data.items.map((item: any) => item.productId);
      if (productIds.length > 0) {
        const productRequests = productIds.map((id: any) =>
          axios.get(`${API_URL}/products/${id}`)
        );
        const productResponses = await Promise.all(productRequests);
        const productDetails = productResponses.map(res => res.data);
        setProducts(productDetails);
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  // Hàm mở modal xác nhận
  const openCancelModal = () => {
    setModalVisible(true);
  };

  // Hàm thực hiện hủy đơn hàng
  const confirmCancelOrder = async () => {
    setModalVisible(false);

    try {
      const token = await getToken();
      const response = await axios.put(
        `${API_URL}/orders/${orderId}`,
        {}, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Thành công', 'Đơn hàng đã được hủy thành công!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('OrdersScreen'); // quay lại danh sách đơn hàng
          },
        },
      ]);
    } catch (error: any) {
      console.error('Lỗi hủy đơn:', error.response?.data || error.message);

      let errorMsg = 'Không thể hủy đơn hàng';
      if (error.response?.status === 404) {
        errorMsg = 'Không tìm thấy đơn hàng';
      } else if (error.response?.status === 401) {
        errorMsg = 'Phiên đăng nhập hết hạn';
      }

      Alert.alert('Lỗi', errorMsg);
    }
  };

  useEffect(() => {
    fetchOrderItems();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      {/* Nút Back */}
      <TouchableOpacity style={styles.buttonback} onPress={() => navigation.goBack()}>
        <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>{'<'}</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 20, marginBottom: 20, color: '#2A4BA0', textAlign: 'center' }}>
        Chi tiết đơn hàng
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {products.map((p, index) => (
          <Orderitem
            key={p.id}
            image={{ uri: p.image }}
            name={p.name}
            price={orderItems[index].price}
            quantity={orderItems[index].quantity}
          />
        ))}

        {/* Nút Hủy đơn hàng */}
        <View style={{ marginTop: 40, alignItems: 'center' }}>
          <TouchableOpacity
            style={[
              styles.cancleButton,
              status === 'pending' ? styles.active : styles.nonactive,
            ]}
            disabled={status !== 'pending'}
            onPress={openCancelModal} // mở modal xác nhận
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
              Hủy đơn hàng
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal xác nhận hủy */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác nhận hủy đơn hàng</Text>
            <Text style={styles.modalMessage}>
              Bạn có chắc chắn muốn hủy đơn hàng này không?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#e74c3c' }]}
                onPress={confirmCancelOrder}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Xác nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#ccc' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Quay lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonback: {
    backgroundColor: '#2A4BA0',
    borderRadius: 100,
    marginTop: 40,
    alignItems: 'center',
    width: 30,
    height: 30,
    paddingTop: 3,
  },
  containerProduct: {
    marginTop: 20,
    borderWidth: 2,
    width: '100%',
    height: 120,
    borderColor: '#ddd',
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  cancleButton: {
    width: 180,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: '#e74c3c',
  },
  nonactive: {
    backgroundColor: '#95a5a6',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});