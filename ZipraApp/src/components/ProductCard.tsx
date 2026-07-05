import React, {useState} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {useCart} from '../contexts/CartContext';
import type {Product} from '../types';

const ProductCard = ({product}: {product: Product}) => {
  const {addProduct} = useCart();
  const [imageError, setImageError] = useState(false);
  const showImage = product.image_url && !imageError;
  const outOfStock = !product.is_available || !product.stock_quantity;

  return (
    <View style={styles.card}>
      {showImage ? (
        <Image source={{uri: product.image_url}} style={styles.image} onError={() => setImageError(true)} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>📷</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.price}>₹{product.price.toFixed(2)}</Text>
        <Text style={styles.stock}>Stock: {product.stock_quantity}</Text>
        <TouchableOpacity
          style={[styles.button, outOfStock && styles.buttonDisabled]}
          disabled={outOfStock}
          onPress={() => addProduct(product)}>
          <Text style={styles.buttonText}>
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {fontSize: 32},
  info: {padding: 8},
  name: {fontWeight: 'bold', fontSize: 14},
  price: {color: '#2e7d32', fontWeight: '600', fontSize: 16, marginTop: 4},
  stock: {color: '#999', fontSize: 11, marginTop: 2},
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  buttonDisabled: {backgroundColor: '#ccc'},
  buttonText: {color: '#fff', fontSize: 12, fontWeight: '600'},
});

export default ProductCard;
