import React, {useEffect, useCallback} from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
  Dimensions,
} from 'react-native';
import {useProducts} from '../contexts/ProductContext';
import {useCart} from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Meat', 'Beverages', 'Snacks', 'General'];
const {width} = Dimensions.get('window');
const NUM_COLS = 2;

const ProductsScreen = ({navigation}: any) => {
  const {products, loading, error, hasMore, loadProducts, setCategory} = useProducts();
  const {itemCount} = useCart();
  const [selected, setSelected] = React.useState('All');

  useEffect(() => {
    loadProducts(true);
  }, []);

  const onEndReached = useCallback(() => {
    if (hasMore && !loading) loadProducts();
  }, [hasMore, loading, loadProducts]);

  const selectCategory = useCallback((cat: string) => {
    setSelected(cat);
    setCategory(cat === 'All' ? '' : cat);
  }, [setCategory]);

  if (error && products.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.retry} onPress={() => loadProducts(true)}>
          <Text style={{color: '#fff'}}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Zipra</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('Orders')} style={styles.iconBtn}>
            <Text style={styles.icon}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.iconBtn}>
            <Text style={styles.icon}>🛒</Text>
            {itemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={item => item}
        style={styles.chipList}
        contentContainerStyle={styles.chipContainer}
        renderItem={({item}) => (
          <TouchableOpacity
            style={[styles.chip, selected === item && styles.chipSelected]}
            onPress={() => selectCategory(item)}>
            <Text style={[styles.chipText, selected === item && styles.chipTextSelected]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={products}
        keyExtractor={item => item.id}
        numColumns={NUM_COLS}
        contentContainerStyle={styles.list}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        refreshing={loading}
        onRefresh={() => loadProducts(true)}
        ListFooterComponent={loading ? <ActivityIndicator style={{padding: 16}} /> : null}
        renderItem={({item}) => <ProductCard product={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16},
  error: {color: 'red', marginBottom: 16},
  retry: {backgroundColor: '#4CAF50', padding: 12, borderRadius: 8},
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4,
  },
  title: {fontSize: 24, fontWeight: 'bold', color: '#2e7d32'},
  headerRight: {flexDirection: 'row'},
  iconBtn: {marginLeft: 12, position: 'relative'},
  icon: {fontSize: 22},
  badge: {
    position: 'absolute', right: -6, top: -4,
    backgroundColor: 'red', borderRadius: 10, width: 18, height: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeText: {color: '#fff', fontSize: 10, fontWeight: 'bold'},
  chipList: {maxHeight: 44, marginVertical: 4},
  chipContainer: {paddingHorizontal: 12, gap: 8, alignItems: 'center'},
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#e8e8e8', marginRight: 8,
  },
  chipSelected: {backgroundColor: '#4CAF50'},
  chipText: {fontSize: 13, color: '#555'},
  chipTextSelected: {color: '#fff', fontWeight: '600'},
  list: {padding: 4},
});

export default ProductsScreen;
