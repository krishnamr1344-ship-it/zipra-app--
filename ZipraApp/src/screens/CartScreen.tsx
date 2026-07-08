import React, {useState, useEffect} from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import {useCart} from '../contexts/CartContext';
import {createOrder, verifyPayment, getConfig} from '../services/api';

const CartScreen = ({navigation}: any) => {
  const {items, updateQuantity, removeProduct, totalAmount, itemCount, clear} = useCart();
  const [address, setAddress] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState('');
  const [sessionId] = useState(() => 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10));

  useEffect(() => {
    getConfig().then(c => setRazorpayKey(c.razorpay_key)).catch(() => {});
  }, []);

  const placeOrder = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Enter delivery address');
      return;
    }

    setOrdering(true);
    try {
      const result = await createOrder(
        Object.entries(items).map(([id, item]) => ({product_id: id, quantity: item.quantity})),
        address.trim(),
        sessionId,
      );

      const options = {
        key: razorpayKey,
        amount: (result.amount * 100).toFixed(0),
        name: 'Zipra',
        description: 'Grocery Order',
        order_id: result.razorpay_order_id,
        theme: {color: '#4CAF50'},
      };

      const payment = await RazorpayCheckout.open(options);
      await verifyPayment(result.order_id, payment.razorpay_payment_id, payment.razorpay_signature);
      Alert.alert('Success', 'Order placed!');
      clear();
      navigation.navigate('Orders');
    } catch (e: any) {
      if (e.description) {
        Alert.alert('Payment Failed', e.description);
      } else {
        Alert.alert('Error', e.message ?? 'Order failed');
      }
    } finally {
      setOrdering(false);
    }
  };

  const cartItems = Object.entries(items).map(([id, item]) => ({id, ...item}));

  if (itemCount === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{fontSize: 18, color: '#999'}}>Cart is empty</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.goBack()}>
          <Text style={{color: '#fff'}}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <View style={styles.itemCard}>
            <View style={{flex: 1}}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemPrice}>₹{item.product.price.toFixed(2)}</Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity onPress={() => updateQuantity(item.product.id, item.quantity - 1)}>
                <Text style={styles.qtyBtn}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity
                onPress={() => {
                  if (item.quantity < item.product.stock_quantity) {
                    updateQuantity(item.product.id, item.quantity + 1);
                  } else {
                    Alert.alert('Not enough stock');
                  }
                }}>
                <Text style={styles.qtyBtn}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.itemTotal}>₹{(item.product.price * item.quantity).toFixed(2)}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <TextInput
          style={styles.addressInput}
          placeholder="Delivery Address"
          value={address}
          onChangeText={setAddress}
          multiline
        />
        <View style={styles.totalRow}>
          <Text style={styles.total}>Total: ₹{totalAmount.toFixed(2)}</Text>
          <TouchableOpacity style={styles.orderBtn} onPress={placeOrder} disabled={ordering}>
            {ordering ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.orderBtnText}>Place Order</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16},
  shopBtn: {backgroundColor: '#4CAF50', padding: 12, borderRadius: 8},
  list: {padding: 12},
  itemCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 12, borderRadius: 12, marginBottom: 8, elevation: 1,
  },
  itemName: {fontWeight: 'bold', fontSize: 15},
  itemPrice: {color: '#2e7d32', marginTop: 2},
  qtyRow: {flexDirection: 'row', alignItems: 'center', marginHorizontal: 12},
  qtyBtn: {fontSize: 22, paddingHorizontal: 8, color: '#4CAF50'},
  qtyText: {fontSize: 16, marginHorizontal: 8, minWidth: 20, textAlign: 'center'},
  itemTotal: {fontWeight: 'bold', fontSize: 15},
  footer: {
    padding: 16, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#e0e0e0',
  },
  addressInput: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12,
    minHeight: 60, marginBottom: 12,
  },
  totalRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  total: {fontSize: 18, fontWeight: 'bold'},
  orderBtn: {backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8},
  orderBtnText: {color: '#fff', fontSize: 16, fontWeight: '600'},
});

export default CartScreen;
