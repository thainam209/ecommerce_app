import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, ImageBackground } from 'react-native';
import API_URL from '../config/api';

const Combo = ({ Image, price, priceSale, name, onPress }:any) => {
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
        <Text style={{fontSize:14,marginLeft:18,marginTop:20,color:'gray',textDecorationLine:'line-through'}}>{price} vnđ</Text>
        <Text style={{fontWeight:'bold',fontSize:14,marginLeft:18,marginTop:5,color:'green'}}>{priceSale} vnđ</Text>
        <Text style={{color:'black',fontWeight:600,fontSize:15,width:130,marginLeft:18,marginTop:5}}>{name}</Text>
      </ImageBackground>
    </View>
  );
};

export default function ComboScreen({ navigation , route }: any) {
  const { categoryId, categoryName } = route.params; // Lấy productId từ route param
  const [combo,setCombo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getProductbyCategory = useCallback(async (categoryId: any) => {
      try {
        const response = await axios.get(`${API_URL}/combos/category/` + categoryId); 
        const data = response.data;
        setCombo(data);
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
          <Text>Loading combo ...</Text>
        </View>
      );
    }

  return (
    <View style={{backgroundColor:'#FFFFFF', flex: 1}}>
        <View style={styles.header}>
            <View style={{width:150,marginLeft:170,marginTop: 13,height:50}}>
                <Text style={{fontSize:30,color:'#153075',fontWeight:'600'}}>{categoryName}</Text>
            </View>
        </View>
        <ScrollView style={{flex:1}}>
          <View style={{flexWrap:'wrap', flexDirection:'row'}}>
            {combo.map((p,idx) => (
              <Combo
                key={p.id}
                Image={{ uri: p.image }} // Sử dụng URL hình ảnh từ API
                price={p.price}
                priceSale={p.priceSale}
                name={p.name}
                onPress={() => navigation.navigate('ComboScreenDetail', { comboId: p.id, name: p.name, price: p.price, priceSale: p.priceSale, image: p.image })}
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