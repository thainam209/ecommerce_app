import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import API_URL from '../config/api';

const ComboItem = ({ name }:any) => {
    return (
    <View style={{marginTop:10}}>
      <Text style={{color:'orange',fontWeight:'bold',fontSize:16}}>{name}</Text>
    </View>
  );
};

export default function ProductDetailScreen({ navigation, route }: any) {
  const { comboId, name, price, priceSale, image } = route.params;
  const [combo, setCombo] = useState<any>(null);
  const [comboItem, setComboItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);

  const getToken = async () => {
    try {
      return await SecureStore.getItemAsync('token');
    } catch (error) {
      console.error('Lỗi lấy token:', error);
      return null;
    }
  };

  const getComboItem = useCallback(async (id: any) => {
    try {
      console.log('comboId',comboId);
      const response = await axios.get(`${API_URL}/combos/comboitems/${id}`);
      setComboItem(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching combo detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin combo');
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async () => {
    const token = await getToken();
    if (!token) {
      Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để thêm vào giỏ hàng', [
        { text: 'Hủy' },
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    try {
      console.log(comboId);
      await axios.post(
        `${API_URL}/cart/combo`,
        {
          comboId: comboId,
          quantity: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setModalVisible(false);
      setQuantity(1);

      Alert.alert('Thành công!', `${quantity} combo đã được thêm vào giỏ hàng`, [
        { text: 'Tiếp tục mua', onPress: () => navigation.goBack() },
        { text: 'Xem giỏ hàng', onPress: () => navigation.navigate('CartScreen') },
      ]);
    } catch (error: any) {
      console.error('Lỗi thêm vào giỏ:', error.response?.data || error);
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
    }
  };

  const buyNow = async () => {
    const token = await getToken();
    if (!token) {
      Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để mua hàng', [
        { text: 'Hủy' },
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    try {
      await axios.post(
        `${API_URL}/cart`,
        {
          comboId: comboId,
          quantity: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setModalVisible(false);
      setQuantity(1);

      //khi ấn buyNow sản phẩm sang trực tiếp giỏ hàng và được tích sẵn
      navigation.navigate('CartScreen')

    } catch (error: any) {
      console.error('Lỗi thêm vào giỏ:', error.response?.data || error);
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    getComboItem(comboId);
  }, [getComboItem, comboId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2A4BA0" />
        <Text>Loading combo item...</Text>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{name}</Text>
      </View>

      <View style={styles.imagePlaceholder}>
        <Image
          source={
            image
              ? { uri: `${image}` }
              : require('../assets/icon_image.png')
          }
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.productName}>{name}</Text>
        <Text style={{color:'gray',marginTop:8,fontSize:18,textDecorationLine:'line-through'}}>{price.toLocaleString()} vn₫</Text>
        <Text style={styles.productPrice}>{priceSale.toLocaleString()} vn₫</Text>
        
        <TouchableOpacity style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
        </TouchableOpacity>

        {comboItem.map((c:any) => (
          <ComboItem
            key={c.id}
            name={c.productName}
          />
        ))}
        
        
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => {
            setQuantity(1);
            setModalVisible(true);
          }}
        >
          <Ionicons name="cart-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.buyNowButton} onPress={buyNow}>
          <Text style={styles.buttonText}>Buy Now</Text>
        </TouchableOpacity> */}
      </View>

      {/* MODAL CHỌN SỐ LƯỢNG */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn số lượng</Text>
            <Text style={styles.modalProductName}>{name}</Text>

            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => {
                  setModalVisible(false);
                  setQuantity(1);
                }}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.okBtn]} onPress={addToCart}>
                <Text style={styles.okText}>Thêm vào giỏ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 26,
    fontWeight: '600',
    color: '#2A4BA0',
    textAlign: 'center',
    flex: 1,
    marginTop: 10,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E0E0',
    height: 230,
    margin: 20,
    borderRadius: 16,
  },
  productImage: {
    width: 388,
    height: 230,
    borderRadius: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A2530',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A4BA0',
    marginTop: 5,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A2530',
  },
  sectionContent: {
    fontSize: 14,
    color: '#616A7D',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#2A4BA0',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#FFC83A',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    width: '88%',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A2530',
    marginBottom: 10,
  },
  modalProductName: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  qtyBtn: {
    backgroundColor: '#2A4BA0',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 22,
    fontWeight: '600',
    marginHorizontal: 30,
    minWidth: 50,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10,
  },
  modalBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  cancelBtn: {
    backgroundColor: '#ddd',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  okBtn: {
    backgroundColor: '#2A4BA0',
  },
  okText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});