import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ImageBackground, TextInput, ActivityIndicator } from 'react-native';

const Cate = ({ name, onPress }:any) => {
  return (
    <TouchableOpacity style={styles.box} onPress={onPress}>
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.namecate}>{name}</Text>
      </View>
    </TouchableOpacity>
  );
};

const Product = ({Image, price, name, onPress }:any) => {
  return (
    <View style={styles.productContainer}>
      <ImageBackground
        source={Image}
        style={{ flex: 1 }}
        imageStyle={{ width: 105, height: 100, alignItems: 'center', marginLeft: 10, marginTop: 10, borderRadius: 16 }}
      >
        <TouchableOpacity
          style={{ borderRadius: 100, width: 28, height: 28, backgroundColor: '#153075', alignItems: 'center', paddingTop: 2, marginTop: 80, marginLeft: 130 }}
          onPress={onPress}
        >
          <Text style={{ color: 'white', fontWeight: 600, fontSize: 18 }}>+</Text>
        </TouchableOpacity>
        <Text style={{ fontWeight: 'bold', fontSize: 14, marginLeft: 18, marginTop: 20 }}>{price} vnđ</Text>
        <Text style={{ color: '#616A7D', fontWeight: 400, fontSize: 12, width: 112, marginLeft: 18, marginTop: 10 }}>{name}</Text>
      </ImageBackground>
    </View>
  );
};


export default function HomeScreen({ navigation }: { navigation: any }) {
    const [categories, setCategories] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [pageProduct, setPageProduct] = useState(1);
    const [limit] = useState(3); // page size cho category
    const [hasMoreCategories, setHasMoreCategories] = useState(true);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [product,setProduct] = useState<any[]>([]);
    const [limitProduct] = useState(4); // page size cho product
    const [hasMoreProducts, setHasMoreProducts] = useState(true);
    const [isLoadingProduct, setIsLoadingProduct] = useState(false);

    //useCallback giữ nguyên tham chiếu hàm giữa các lần render → tránh tạo hàm mới liên tục
    const getCategory = useCallback(async (requestedPage = 1) => {
      if (isLoadingCategories) return; //nếu đang load thì bỏ qua lời gọi hàm mới, tránh gọi api nhiều lần
      setIsLoadingCategories(true);
      try {
        const response = await axios.get('http://192.168.10.2:3000/api/categories', {
          params: { page: requestedPage, limit }
        });
        //do sửa api thành trả về dạng { data: [], pagination: {} } nên phải gọi .data của data
        const data = response.data.data || []; //nếu data null thì gán mảng rỗng
        if (requestedPage === 1) { //nếu là trang đầu tiên thì gán lại hoàn toàn
          setCategories(data);
        } else {
          setCategories(prev => [...prev, ...data]); //nối thêm vào các trang sau
        }
        setPage(requestedPage); //cập nhật trang hiện tại
        // nếu backend trả đúng số bản ghi bằng limit thì còn trang tiếp theo
        setHasMoreCategories(response.data.pagination.hasMore);
        console.log('Categories:', data); //khi ổn thì bỏ đi để nhìn log cho dễ
      } catch (error) {
        console.error('Get categories error:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    }, [limit]); //chỉ tạo hàm mới khi chỉ số thay đổi

    const getProduct = useCallback(async (requestedPage = 1) => {
      if (isLoadingProduct) return;
      setIsLoadingProduct(true);
      try {
        const response = await axios.get('http://192.168.10.2:3000/api/products', {
          params: { page: requestedPage, limit: limitProduct }
        });
        const data = response.data.data || [];
        if (requestedPage === 1) { 
          setProduct(data);
        } else {
          setProduct(prev => [...prev, ...data]);
        }
        setPageProduct(requestedPage);
        // nếu backend trả đúng số bản ghi bằng limit thì còn trang tiếp theo
        setHasMoreProducts(response.data.pagination.hasMore);
        console.log('Products:', data);
      } catch (error) {
        console.error('Get products error:', error);
      } finally {
        setIsLoadingProduct(false);
      }
    }, [limitProduct]); //chỉ tạo hàm mới khi chỉ số thay đổi

    // gọi khi mở trang, nếu getCategory thay đổi thì gọi lại
    useEffect(() => {
      getCategory(1);
      getProduct(1);
    }, [getCategory, getProduct]); //chỉ gọi lại hàm khi 1 trong 2 thay đổi

    const search = () => {
      console.log('Search clicked');
    };
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', marginTop: 60, marginLeft: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: 600, fontFamily: 'Manrope', color: '#F8F9FB' }}>
            Hey, Halal
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('CartScreen')}>
            <Image
              source={require('../assets/icon_bag.png')}
              style={{ width: 18, height: 20, marginLeft: 270, marginTop: 3 }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.search}>
          <TouchableOpacity onPress={search}>
            <Image
              source={require('../assets/icon_search.png')}
              style={{ width: 20, height: 20, marginLeft: 30 }}
            />
          </TouchableOpacity>
          <TextInput placeholder='Search Products' placeholderTextColor='#8891A5' style={{ marginLeft: 10, fontSize: 16, fontWeight: 500, color: 'white',width: 300 }} />
        </View>
        <View style={styles.text}>
          <Text style={styles.text1}>DELIVERY TO</Text>
          <Text style={styles.text1}>WITHIN</Text>
        </View>
        <View style={styles.text}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.text2}>Green Way 3000, Sylhet</Text>
            <Image
              source={require('../assets/icon_muiten.png')}
              style={{ marginLeft: 10, marginTop: 6, marginRight: 153 }}
            />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.text2}>1 Hour</Text>
            <Image
              source={require('../assets/icon_muiten.png')}
              style={{ marginLeft: 10, marginTop: 6 }}
            />
          </View>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.bannerCard}>
          {/* Hiển thị categories
              tạo thành cuộn ngang và ẩn thanh cuộn */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {isLoadingCategories && categories.length === 0 ? (
              <ActivityIndicator size="small" color="#153075" style={{ margin: 20 }} />
            ) : (
              categories.map((c, idx) => (
                <Cate
                  key={c.id ?? idx}
                  name={c.name}
                  description={c.description ?? ''}
                  onPress={() => navigation.navigate('ProductScreen', { categoryId: c.id, categoryName: c.name })}
                />
              ))
            )}
            {/* Nút load more */}
            {hasMoreCategories && (
              <TouchableOpacity
                style={[styles.box, { justifyContent: 'center', alignItems: 'center' }]}
                onPress={() => getCategory(page + 1)}
              >
                {isLoadingCategories ? <ActivityIndicator /> : <Text style={{ fontWeight: '600' }}>Load more</Text>}
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
        <Text style={{ fontSize: 20, fontWeight: 700, marginTop: 30, marginLeft: 25 }}>
          Some food you may like
        </Text>
        <View style={{ flexWrap: 'wrap', flexDirection: 'row' }}>
          {isLoadingProduct && product.length === 0 ? (
            <ActivityIndicator size="small" color="#153075" style={{ margin: 20 }} />
          ) : (
            product.map((p, idx) => (
              <Product
                key={p.id ?? idx}
                Image={p.image ? { uri: p.image } : require('../assets/icon_image.png')}
                price={p.price}
                name={p.name}
                onPress={() => navigation.navigate('ProductDetailScreen', { productId: p.id })}
              />
            ))
          )}
          {/* Nút load more */}
          {hasMoreProducts && (
          <TouchableOpacity
            style={[styles.button_loadmore, { justifyContent: 'center', alignItems: 'center', marginLeft: 25, marginTop: 30 }]}
            onPress={() => getProduct(pageProduct + 1)}
          >
            {isLoadingProduct ? <ActivityIndicator /> : <Text style={{ fontWeight: '600', color: 'white' }}>Load more</Text>}
          </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      {/* Nút load more */}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 280,
    backgroundColor: '#2A4BA0',
  },
  search: {
    width: 380,
    height: 60,
    backgroundColor: '#153075',
    borderRadius: 28,
    marginTop: 38,
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30
  },
  text: {
    flexDirection: 'row',
    marginLeft: 20,
    marginTop: 10
  },
  text1: {
    fontSize: 12,
    fontFamily: 'Manrope',
    fontWeight: 800,
    color: '#AAAAAA',
    marginRight: 250
  },
  text2: {
    fontSize: 14,
    fontFamily: 'Manrope',
    fontWeight: 500,
    color: '#F8F9FB',
  },
  bannerCard: {
    flexDirection: 'row',
    marginTop: 30,
  },
  box: {
    width: 120,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginLeft: 25,
    backgroundColor: '#FFC83A',
  },
  button_loadmore: {
    width: 120,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#153075',
  },
  namecate: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  money: {
    fontSize: 26,
    fontWeight: 400,
    marginLeft: 10,
  },
  content: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  productContainer: {
    borderRadius: 16,
    width: 178,
    height: 210,
    borderWidth: 1,
    marginLeft: 25,
    marginTop: 30,
    backgroundColor: 'white',
  }
}); 