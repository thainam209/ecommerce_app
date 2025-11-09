import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CartItem = ({ name, price, quantity, image, onQuantityChange, onRemove }:any) => (
  <View style={styles.cartItem}>
    <Image
      source={image ? { uri: image } : require('../assets/icon_image.png')}
      style={styles.itemImage}
    />
    <View style={styles.itemDetails}>
      <Text style={styles.itemName}>{name}</Text>
      <Text style={styles.itemPrice}>{price} Vnđ</Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => onQuantityChange(quantity - 1)}>
          
        </TouchableOpacity>
        <Text style={styles.quantity}>{quantity}</Text>
        <TouchableOpacity onPress={() => onQuantityChange(quantity + 1)}>
          
        </TouchableOpacity>
        <TouchableOpacity onPress={onRemove} style={{ marginLeft: 20 }}>
          
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function CartScreen() {

  

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart ({cartItems.length})</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={cartItems}
        renderItem={({ item }) => (
          <CartItem
            name={item.name}
            price={item.price}
            quantity={item.quantity}
            image={item.image}
            onQuantityChange={(newQuantity) => updateQuantity(item.id, newQuantity)}
            onRemove={() => removeFromCart(item.id)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.cartList}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30 }}>Giỏ hàng trống</Text>}
      />
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{subtotal.toLocaleString()} Vnđ</Text>
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Delivery</Text>
          <Text style={styles.totalValue}>{delivery.toLocaleString()} Vnđ</Text>
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{total.toLocaleString()} Vnđ</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('Checkout', {subtotal})}
        >
          <Text style={styles.checkoutText}>Proceed to checkout</Text>
        </TouchableOpacity>
      </View> */}
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
    fontSize: 18,
    fontWeight: '600',
    color: '#2A4BA0',
  },
  cartList: {
    padding: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2530',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2A4BA0',
    marginTop: 5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 10,
    color: '#1A2530',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2530',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A4BA0',
  },
  checkoutButton: {
    backgroundColor: '#2A4BA0',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});