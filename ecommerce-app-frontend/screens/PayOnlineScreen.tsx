import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, Switch, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import API_URL from '../config/api';
import APIKEY from '../config/key';

export default function PayOnlineScreen({ navigation, route }: any) {
    const  {orderId}  = route.params;
    const [amount, setAmount] = useState(0);
    const [paid, setPaid] = useState(false);
    const [qrUrl, setQrUrl] = useState('');  

    //hàm lấy token để gọi api
    const getToken = async () => {
        try {
            return await SecureStore.getItemAsync('token');
        } catch (error) {
            console.error('Lỗi lấy token:', error);
            return null;
        }
    };

    //hàm kiểm tra đã thanh toán chưa, nếu thanh toán rồi tự động chuyển đến trang đơn hàng
    const checkPaymentStatus = async () => {
        if (paid) return; // nếu đã thanh toán rồi thì không cần check nữa
        const token = await getToken();
        if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        return;
        }
        //console.log(paid);

        // 1. Lấy thông tin đơn hàng
        const orderRes = await axios.get(
        `${API_URL}/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
        );

        const order = orderRes.data.order;
        const amount = order.total;
        const status = order.status;
        //console.log("Trạng thái:", status);
        if(status !== 'pending - unpaid') {
            return; // nếu đơn hàng không ở trạng thái chờ thanh toán thì không cần check nữa
        }
        setAmount(amount); // cập nhật số tiền vào state
        setQrUrl(`https://img.vietqr.io/image/BIDV-V3CASS2153428235-compact2.png?amount=${amount}&addInfo=${content}&accountName={LE THAI NAM}`); // tạo URL QR code với số tiền và nội dung chuyển khoản')


        // 2. Lấy danh sách giao dịch
        const transRes = await axios.get(
        `https://script.google.com/macros/s/AKfycbwV3ElH3AZ1h6vL_skzWIeMTumJnBDYsfigqJlQM8cmUG7H_hUzXyv_ZL-14NqpoE0_Cw/exec`
        );

        const transactions = transRes.data.data;

        // 3. Kiểm tra giao dịch
        const isPaid = transactions.some((item: any) => {
        const description = item["Mô tả"] || "";
        const value = Number(item["Giá trị"]) || 0;

        console.log("Kiểm tra giao dịch:", { description, value, amount, orderId });

        return (
            description.includes(`don hang ${orderId}`) && // nội dung chuyển khoản
            value === amount // số tiền
        );
        });

        console.log("Kết quả kiểm tra giao dịch:", isPaid);
        setPaid(isPaid); // cập nhật trạng thái đã thanh toán hay chưa
        // 4. Nếu đã thanh toán
        if (isPaid) {
            setPaid(true); // cập nhật trạng thái đã thanh toán

            // gọi API update trạng thái đơn hàng
            const response = await axios.put(
                `${API_URL}/orders/payapprove/${orderId}`,
                {}, 
                {
                headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log("Kết quả cập nhật đơn hàng:", response.data.message);
            Alert.alert("Thành công", "Thanh toán thành công!");

            // chuyển sang màn hình đơn hàng
            navigation.navigate("OrdersScreen");

        }
    };
    
    //gọi hàm khi trạng thái paid thay đổi hoặc khi component được mount
    useEffect(() => {
        checkPaymentStatus();
    }, [paid]);

    const content = 'Thanh toán đơn hàng ' + orderId;

  return (
    <View style={styles.container}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10,paddingTop:80,alignContent:'center',textAlign:'center' }}>
            Quét mã QR dưới đây để thanh toán
        </Text>
        {/*gọi api để tạo mã qr chuyển khoản - hiện loading khi gọi api */} 
        <Image source={{ uri: qrUrl }} style={{ width: '100%', height: '60%',borderWidth:1 }} resizeMode="contain" />
        <TouchableOpacity
            onPress={() => {navigation.navigate('OrdersScreen')}}
            style={{ marginTop: 30, backgroundColor: '#2A4BA0',width:180,height:70, alignItems: 'center',borderRadius:16 }}
        >      
            <Text style={{ fontSize: 18, color: 'white', marginTop: 20, textAlign:'center' }}>
                Tới trang đơn hàng
            </Text>
        </TouchableOpacity>
    </View>
  );
}

// Styles giữ nguyên như cũ
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB',paddingTop: 40, alignItems: 'center' },
});