import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Products: undefined;
  ProductDetail: { productId: string }; // Tham số productId khi chuyển từ ProductsScreen
  Cart: undefined;
  Orders: undefined;
};