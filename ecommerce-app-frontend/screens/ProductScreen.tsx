import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, ImageBackground } from 'react-native';

const Product = ({ Image, price, name, onPress }:any) => {
    return (
    <View style={styles.productContainer}>
      <ImageBackground
        source={Image}
        style={{flex: 1}}
        imageStyle={{width:110,height:110,marginTop:10,marginLeft:15,borderRadius:16}}
        >
        <TouchableOpacity onPress={onPress}
        style={{borderRadius:100,width:28,height:28,backgroundColor:'#153075',alignItems:'center',paddingTop:2,marginTop:90,marginLeft:130}}>
          <Text style={{color:'white',fontWeight:600,fontSize:18}}>+</Text>
        </TouchableOpacity>
        <Text style={{fontWeight:'bold',fontSize:14,marginLeft:18,marginTop:20}}>{price} vnđ</Text>
        <Text style={{color:'black',fontWeight:600,fontSize:15,width:130,marginLeft:18,marginTop:10}}>{name}</Text>
      </ImageBackground>
    </View>
  );
};

export default function ProductScreen({ navigation , route }: any) {
  const { categoryId, categoryName } = route.params; // Lấy productId từ route param
  const [products,setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getProductbyCategory = useCallback(async (categoryId: any) => {
      try {
        const response = await axios.get('http://192.168.10.2:3000/api/products/category/' + categoryId); 
        const data = response.data;
        setProducts(data);
        } catch (error) {
          console.error('Error fetching product detail:', error);
        } finally {
          setLoading(false);
        }
    }, [categoryId]);

    useEffect(() => {
      getProductbyCategory(categoryId);
    }, [getProductbyCategory, categoryId]);
  
    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2A4BA0" />
          <Text>Loading product ...</Text>
        </View>
      );
    }

  return (
    <View style={{backgroundColor:'#FFFFFF', flex: 1}}>
        <View style={styles.header}>
            <View style={{width:150,marginLeft:120,marginTop: 13,height:50}}>
                <Text style={{fontSize:30,color:'#153075',fontWeight:'600'}}>{categoryName}</Text>
            </View>
            <Image
                source={require('../assets/icon_search(black).png')}
                style={{marginTop:15,marginLeft: 45}}
            />
            <TouchableOpacity onPress={() => navigation.navigate('ShoppingCart')}>
                <Image
                    source={require('../assets/icon_bag(black).png')}
                    style={{marginTop:15,marginLeft: 45}}
                />
            </TouchableOpacity>
        </View>
        <ScrollView style={{flex:1}}>
          <View style={{flexWrap:'wrap', flexDirection:'row'}}>
            {products.map((p,idx) => (
              <Product
                key={p.id}
                Image={{ uri: p.image }} // Sử dụng URL hình ảnh từ API
                price={p.price}
                name={p.name}
                onPress={() => navigation.navigate('ProductDetailScreen', { productId: p.id })}
              />
            ))}
          </View>
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    marginTop: 60,
  },
  // productContainer: {
  //   borderRadius: 16,
  //   width:170,
  //   height:200,
  //   borderWidth: 1,
  //   marginLeft:25,
  //   marginTop:30,
  //   backgroundColor:'#F8F9FB'
  // },
  number: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  money: {
    fontSize: 26,
    fontWeight:400,
    marginLeft: 10,
  },
  content: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  productContainer: {
    borderRadius: 16,
    width:178,
    height:210,
    borderWidth: 1,
    marginLeft:25,
    marginTop:30,
    backgroundColor:'#F8F9FB'
  },
  button: {
    borderRadius:100,
    width: 50,
    height: 50,
    backgroundColor: '#F8F9FB',
    color:'black',
    fontWeight:600,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
  },
});