import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import API_URL from '../config/api';

const CheckBox = ({ isSelected, onPress }: { isSelected: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.checkboxContainer}>
    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
      {isSelected && <Text style={styles.checkmark}>✓</Text>}
    </View>
  </TouchableOpacity>
);

const CartItemComponent = ({
  image,
  name,
  price,
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
  isSelected,
  onToggleSelect,
}: any) => (
  <View style={styles.cartItem}>
    <CheckBox isSelected={isSelected} onPress={onToggleSelect} />

    <Image
      source={{ uri: image }}
      style={styles.itemImage}
      resizeMode="cover"
      defaultSource={require('../assets/icon_image.png')}
    />

    <View style={styles.itemDetails}>
      <Text style={styles.itemName}>{name}</Text>
      <Text style={styles.itemPrice}>{price.toLocaleString()} ₫</Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={onDecrease} style={styles.quantityBtn}>
          <Text style={styles.btnText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{quantity}</Text>
        <TouchableOpacity onPress={onIncrease} style={styles.quantityBtn}>
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
          <Text style={styles.removeText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function CartScreen({ navigation }: any) {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [note, setNote] = useState(''); // Thêm ghi chú

  const getToken = async () => {
    try {
      return await SecureStore.getItemAsync('token');
    } catch (error) {
      console.error('Lỗi lấy token:', error);
      return null;
    }
  };

  const fetchCart = async () => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        navigation.navigate('Login');
        return;
      }

      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems(response.data.items || []);
    } catch (error: any) {
      console.error('Lỗi lấy giỏ hàng:', error.response?.data || error.message);
      Alert.alert('Lỗi', 'Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const increaseQuantity = async (productId: number) => {
    const token = await getToken();
    await axios.post(`${API_URL}/cart`, { productId, quantity: 1 }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCart();
  };

  const decreaseQuantity = async (productId: number) => {
    const token = await getToken();
    await axios.post(`${API_URL}/cart`, { productId, quantity: -1 }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCart();
  };

  const removeItem = async (cartItemId: number) => {
    const token = await getToken();
    await axios.delete(`${API_URL}/cart/${cartItemId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCart();
  };

  const toggleSelect = (cartItemId: number) => {
    setSelectedItems(prev =>
      prev.includes(cartItemId)
        ? prev.filter(id => id !== cartItemId)
        : [...prev, cartItemId]
    );
  };

  const getSelectedTotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  };

  const validateForm = () => {
    if (!receiverName.trim()) return 'Vui lòng nhập họ tên người nhận';
    if (!receiverPhone.trim()) return 'Vui lòng nhập số điện thoại';
    if (!receiverAddress.trim()) return 'Vui lòng nhập địa chỉ giao hàng';
    if (!/^\d{9,11}$/.test(receiverPhone.replace(/\D/g, ''))) return 'Số điện thoại không hợp lệ';
    return null;
  };

  const checkout = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Chưa chọn', 'Vui lòng chọn ít nhất 1 sản phẩm');
      return;
    }
    setModalVisible(true); // Mở modal nhập thông tin
  };

  const confirmCheckout = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Lỗi', error);
      return;
    }

    const token = await getToken();
    if (!token) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
      return;
    }

    try {
      const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
      const total = getSelectedTotal();

      // ĐÚNG 100% với backend của bạn
      const orderRes = await axios.post(
        `${API_URL}/orders`,
        {
          total: total,
          status: 'pending',
          recipientName: receiverName.trim(),           // Đúng tên field
          recipientPhone: receiverPhone.trim(),         // Đúng tên field
          shippingAddress: receiverAddress.trim(),      // Đúng tên field
          note: note.trim() || null,                    // Có thể để trống
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const orderId = orderRes.data.order.id;

      // Tạo các order items
      for (const item of selectedCartItems) {
        await axios.post(
          `${API_URL}/orderitems/orderId/${orderId}`,
          {
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Xóa giỏ hàng đã chọn
      await axios.post(
        `${API_URL}/cart/clear-selected`,
        { cartItemIds: selectedItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Đóng modal + reset form
      setModalVisible(false);
      setReceiverName('');
      setReceiverPhone('');
      setReceiverAddress('');
      setNote('');

      Alert.alert('Thành công!', 'Đơn hàng đã được tạo thành công!', [
        {
          text: 'OK',
          onPress: () => {
            setSelectedItems([]);
            fetchCart();
            navigation.navigate('OrdersScreen');
          },
        },
      ]);
    } catch (error: any) {
      console.error('Lỗi checkout:', error.response?.data || error.message);
      Alert.alert(
        'Lỗi',
        error.response?.data?.error || 
        error.response?.data?.details || 
        'Không thể tạo đơn hàng. Vui lòng thử lại!'
      );
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2A4BA0" />
        <Text>Đang tải giỏ hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Giỏ hàng trống</Text>
        </View>
      ) : (
        <>
          <FlatList
            style={{ marginTop: 50 }}
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <CartItemComponent
                image={item.product.image}
                name={item.product.name}
                price={item.product.price}
                quantity={item.quantity}
                onIncrease={() => increaseQuantity(item.product.id)}
                onDecrease={() => decreaseQuantity(item.product.id)}
                onRemove={() => removeItem(item.id)}
                isSelected={selectedItems.includes(item.id)}
                onToggleSelect={() => toggleSelect(item.id)}
              />
            )}
          />

          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>
                Tổng tiền ({selectedItems.length} sản phẩm):
              </Text>
              <Text style={styles.totalValue}>{getSelectedTotal().toLocaleString()} ₫</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.checkoutButton,
                selectedItems.length === 0 && { backgroundColor: '#ccc' },
              ]}
              onPress={checkout}
              disabled={selectedItems.length === 0}
            >
              <Text style={styles.checkoutText}>Thanh toán</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Modal nhập thông tin giao hàng + ghi chú */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Thông tin giao hàng</Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                <TextInput
                  style={styles.input}
                  placeholder="Họ và tên người nhận"
                  value={receiverName}
                  onChangeText={setReceiverName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Số điện thoại"
                  value={receiverPhone}
                  onChangeText={setReceiverPhone}
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Địa chỉ giao hàng chi tiết"
                  value={receiverAddress}
                  onChangeText={setReceiverAddress}
                />
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="Ghi chú (không bắt buộc)"
                  value={note}
                  onChangeText={setNote}
                  multiline
                />
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: '#ccc' }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalBtnText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: '#2A4BA0' }]}
                  onPress={confirmCheckout}
                >
                  <Text style={[styles.modalBtnText, { color: '#fff' }]}>Xác nhận thanh toán</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#999' },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 16,
    padding: 15,
    elevation: 3,
  },
  checkboxContainer: { padding: 8 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2A4BA0',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: { backgroundColor: '#2A4BA0' },
  checkmark: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  itemImage: { width: 80, height: 80, borderRadius: 12, marginLeft: 10 },
  itemDetails: { flex: 1, marginLeft: 15 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#1A2530' },
  itemPrice: { fontSize: 15, fontWeight: '600', color: '#2A4BA0', marginTop: 5 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  quantityBtn: { backgroundColor: '#2A4BA0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  quantity: { marginHorizontal: 15, fontSize: 16, fontWeight: '600' },
  removeBtn: { marginLeft: 20 },
  removeText: { color: 'red', fontWeight: '600' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  totalLabel: { fontSize: 18, fontWeight: '600' },
  totalValue: { fontSize: 18, fontWeight: '600', color: '#2A4BA0' },
  checkoutButton: { backgroundColor: '#2A4BA0', padding: 16, borderRadius: 16, alignItems: 'center' },
  checkoutText: { color: '#fff', fontSize: 18, fontWeight: '600' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1A2530',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});