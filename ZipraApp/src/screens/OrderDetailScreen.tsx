import React from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import type {Order} from '../contexts/OrderContext';
import {STATUS_COLORS, STATUS_LABELS} from '../constants';

const OrderDetailScreen = ({route}: any) => {
  const order: Order = route.params.order;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={order.items}
      keyExtractor={(_, i) => i.toString()}
      ListHeaderComponent={
        <>
          <View style={styles.headerCard}>
            <View style={styles.headerRow}>
              <Text style={styles.orderId}>Order #{order.id.substring(0, 8)}</Text>
              <View style={[styles.badge, {backgroundColor: (STATUS_COLORS[order.status] ?? '#999') + '33'}]}>
                <Text style={[styles.badgeText, {color: STATUS_COLORS[order.status] ?? '#999'}]}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </Text>
              </View>
            </View>
            <Text style={styles.date}>
              Placed: {order.created_at.substring(0, 16).replace('T', ' ')}
            </Text>
            <Text style={styles.address}>Delivery: {order.delivery_address}</Text>
          </View>
          <Text style={styles.sectionTitle}>Items</Text>
        </>
      }
      renderItem={({item}) => (
        <View style={styles.itemCard}>
          <View style={{flex: 1}}>
            <Text style={styles.itemName}>{item.product_name}</Text>
            <Text style={styles.itemDetail}>
              ₹{item.price.toFixed(2)} × {item.quantity}
            </Text>
          </View>
          <Text style={styles.itemTotal}>
            ₹{(item.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      )}
      ListFooterComponent={
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹{order.total_amount.toFixed(2)}</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  content: {padding: 16},
  headerCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2,
  },
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  orderId: {fontWeight: 'bold', fontSize: 18},
  badge: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16},
  badgeText: {fontWeight: '600'},
  date: {marginTop: 12, color: '#555'},
  address: {color: '#555', marginTop: 4},
  sectionTitle: {fontSize: 16, fontWeight: 'bold', marginBottom: 8},
  itemCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 12, borderRadius: 8, marginBottom: 8, elevation: 1,
  },
  itemName: {fontWeight: 'bold'},
  itemDetail: {color: '#666', marginTop: 2},
  itemTotal: {fontWeight: 'bold', fontSize: 15},
  totalCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 8, elevation: 2,
  },
  totalLabel: {fontSize: 18, fontWeight: 'bold'},
  totalAmount: {fontSize: 18, fontWeight: 'bold', color: '#2e7d32'},
});

export default OrderDetailScreen;
