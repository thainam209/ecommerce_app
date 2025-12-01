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
  const [voucher, setVoucher] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [note, setNote] = useState(''); 

  //Modal voucher
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);

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
      //console.log(response.data.items);
    } catch (error: any) {
      console.error('Lỗi lấy giỏ hàng:', error.response?.data || error.message);
      Alert.alert('Lỗi', 'Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchVoucher = async () => {
    try{
      const token = await getToken();
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        navigation.navigate('Login');
        return;
      }

      const response = await axios.get(`${API_URL}/vouchers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setVoucher(response.data.vouchers);

    }catch (error : any) {
      console.error('Lỗi lấy voucher:', error.response?.data || error.message);
      Alert.alert('Lỗi', 'Không thể tải giỏ hàng');
    }
  };

  const increaseQuantity = async (item:any) => {
    const token = await getToken();
    const productId = item.productId;
    const comboId = item.comboId;
    if(productId) {
      await axios.post(`${API_URL}/cart`, { productId, quantity: 1 }, {
      headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    }
    if(comboId) {
      await axios.post(`${API_URL}/cart/combo`, { comboId, quantity: 1 }, {
      headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    }
  };

  const decreaseQuantity = async (item:any) => {
    if (item.quantity <= 1) {
      Alert.alert('Xác nhận', 'Bạn muốn xóa món này khỏi giỏ hàng?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', onPress: () => removeItem(item.id) },
      ]);
      return;
    }
    const token = await getToken();
    const productId = item.productId;
    const comboId = item.comboId;
    if(productId) {
      await axios.post(`${API_URL}/cart`, { productId, quantity: -1 }, {
      headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    }
    if(comboId) {
      await axios.post(`${API_URL}/cart/combo`, { comboId, quantity: -1 }, {
      headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    }
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
      .reduce((sum, item) => item.product === null ? sum + item.quantity * item.combo.priceSale : sum + item.quantity * item.product.price, 0);
  };

  //hàm tính giảm giá
  const getDiscountAmount = () => {
    if (!selectedVoucher) return 0;

    const total = getSelectedTotal();

    // Đảm bảo không giảm âm (nếu voucher > tổng tiền)
    if (selectedVoucher.discount > total) {
      // Đảm bảo không giảm âm (nếu voucher > tổng tiền)
      return total;
    }

    console.log(selectedVoucher);

    return selectedVoucher.discount;
  };

  const getFinalTotal = () => {
    return getSelectedTotal() - getDiscountAmount();
  };

  const validateForm = () => {
    if (!receiverName.trim()) return 'Vui lòng nhập họ tên người nhận';
    if (!receiverPhone.trim()) return 'Vui lòng nhập số điện thoại';
    if (!receiverAddress.trim()) return 'Vui lòng nhập địa chỉ giao hàng';
    if (!/^\d{9,11}$/.test(receiverPhone.replace(/\D/g, ''))) return 'Số điện thoại không hợp lệ';
    return null;
  };

  const deleteVoucher = async (voucherId:any) => {
    try{
      const token = await getToken();
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        navigation.navigate('Login');
        return;
      }
      const res = await axios.delete(`${API_URL}/vouchers/+${voucherId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        });
      return res;
    }catch(error:any){
      console.log('errol: ',error);
    }
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
      const total = getFinalTotal();

      console.log(selectedCartItems);

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
        if(item.productId){
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
        else {
          await axios.post(
            `${API_URL}/orderitems/orderId/${orderId}`,
            {
              comboId: item.comboId,
              quantity: item.quantity,
              price: item.combo.priceSale,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
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
    fetchVoucher();
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
                image={item.product === null ? item.combo.image : item.product.image}
                name={item.product === null ? item.combo.name : item.product.name}
                price={item.product === null ? item.combo.priceSale : item.product.price}
                quantity={item.quantity}
                onIncrease={() => increaseQuantity(item)}
                onDecrease={() => decreaseQuantity(item)}
                onRemove={() => removeItem(item.id)}
                isSelected={selectedItems.includes(item.id)}
                onToggleSelect={() => toggleSelect(item.id)}
              />
            )}
          />

          <View style={styles.footer}>
            <View style={styles.voucherContainer}>
              <TouchableOpacity
                style={styles.voucherButton}
                onPress={() => {
                  if (voucher.length === 0) {
                    Alert.alert('Thông báo', 'Bạn chưa có voucher nào khả dụng');
                    return;
                  }
                  setVoucherModalVisible(true);
                }}
              >
            <View style={styles.voucherButtonContent}>
              <Text style={styles.voucherIcon}>Voucher</Text>
              <Text style={styles.voucherButtonText} numberOfLines={1}>
                {selectedVoucher 
                  ? `${selectedVoucher.name}`
                  : 'Chọn mã giảm giá'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* MODAL CHỌN VOUCHER*/}
          <Modal
            animationType="slide"
            transparent={true}
            visible={voucherModalVisible}
            onRequestClose={() => setVoucherModalVisible(false)}
          >
            <View style={styles.modalOverlayv}>
              

            <View style={styles.voucherModal}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn mã giảm giá</Text>
                <TouchableOpacity onPress={() => setVoucherModalVisible(false)}>
                  <Text style={styles.closeBtn}>Close</Text>
                </TouchableOpacity>
              </View>

              {/* Danh sách voucher */}
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Option: Không dùng voucher */}
                <TouchableOpacity
                  style={styles.voucherOption}
                  onPress={() => {
                    setSelectedVoucher(null);
                    setVoucherModalVisible(false);
                  }}
                >
                  <View style={styles.radioOuter}>
                    {!selectedVoucher && <View style={styles.radioInner} />}
                  </View>
                  <Text style={{fontSize:16,fontWeight:'bold'}}>Không sử dụng voucher</Text>
                </TouchableOpacity>

                {/* Danh sách voucher */}
                {voucher.map((v: any) => (
                  <TouchableOpacity
                    key={v.id}
                    style={styles.voucherOption}
                    onPress={() => {
                      setSelectedVoucher(v);
                      setVoucherModalVisible(false);
                    }}
                  >
                    <View style={styles.radioOuter}>
                      {selectedVoucher?.id === v.id && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.voucherInfo}>
                      <Text style={styles.voucherName}>{v.name}</Text>
                      <Text style={styles.voucherDiscount}>
                        Giảm: {v.discount?.toLocaleString()}₫
                      </Text>
                      {v.description && (
                        <Text style={styles.voucherDesc}>{v.description}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            </View>
          </Modal>
            {selectedVoucher ? (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 20, marginBottom: 10, fontWeight: 'bold' }}>
                  Chi tiết giá
                </Text>
                <Text style={{ marginBottom: 5, fontSize: 16 }}>
                  Giá ban đầu: {getSelectedTotal().toLocaleString()} ₫
                </Text>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: 16 }}>Giảm giá: </Text>
                  <Text style={{ color: 'green', fontWeight: 'bold', fontSize: 16 }}>
                    -{getDiscountAmount().toLocaleString()} ₫
                  </Text>
                </View>
              </View>
            ) : null}
            </View>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>
                Tổng tiền ({selectedItems.length} sản phẩm):
              </Text>
              <Text style={styles.totalValue}>{getFinalTotal().toLocaleString()} ₫</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.checkoutButton,
                selectedItems.length === 0 && { backgroundColor: '#ccc' },
              ]}
              onPress={()=>{
                checkout();
              }}
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
                  onPress={() => {
                    // Nếu không dùng voucher (selectedVoucher = null) → chỉ thanh toán bình thường
                    // Nếu có dùng voucher → thanh toán + xóa voucher đó đi (voucher dùng 1 lần)
                    confirmCheckout();
                    if (selectedVoucher?.id) {
                      deleteVoucher(selectedVoucher.id);
                    }
                  }}
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
  voucherContainer: {
    marginBottom: 15,
    paddingHorizontal: 5,
  },
    voucherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF9E6',
    borderWidth: 1.5,
    borderColor: '#FFB800',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  voucherButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  voucherIcon: {
    backgroundColor: '#FFB800',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 10,
  },
  voucherButtonText: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#D35400',
    flex: 1,
  },
  voucherArrow: {
    fontSize: 20,
    color: '#D35400',
  },

  // Modal voucher
  modalOverlayv: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  voucherModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitlev: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A2530',
  },
  closeBtn: {
    fontSize: 24,
    color: '#999',
  },
  voucherOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2A4BA0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2A4BA0',
  },
  voucherInfo: {
    flex: 1,
  },
  voucherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2530',
  },
  voucherDiscount: {
    fontSize: 15,
    color: '#E74C3C',
    fontWeight: 'bold',
    marginTop: 2,
  },
  voucherDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },

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