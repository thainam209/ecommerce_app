import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProductScreen from './screens/ProductScreen';
import HomeScreen from './screens/HomeScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import CartScreen from './screens/CartScreen';
import OrdersScreen from './screens/OrdersScreen';
import ChatScreen from './screens/ChatScreen';
import UserScreen from './screens/UserScreen';
import OrderDetailScreen from './screens/OrderDetailScreen';
import ComboScreen from './screens/ComboScreen';
import ComboScreenDetail from './screens/ComboScreenDetail'

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="ProductScreen" component={ProductScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="ProductDetailScreen" component={ProductDetailScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="CartScreen" component={CartScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="OrdersScreen" component={OrdersScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="UserScreen" component={UserScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="OrderDetailScreen" component={OrderDetailScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="ComboScreen" component={ComboScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="ComboScreenDetail" component={ComboScreenDetail} options={{ headerShown: false }}/>
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}