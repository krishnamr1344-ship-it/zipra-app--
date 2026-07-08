import React, {useEffect} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import {useOrders, Order} from '../contexts/OrderContext';
import {STATUS_COLORS, STATUS_LABELS} from '../constants';

const OrdersScreen = ({navigation}: any) => {
  const {orders, loading, error, hasMore, loadOrders} = useOrders();

  useEffect(() => {
    loadOrders(true);
  }, []);

  const renderOrder = ({item}: {item: Order}) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderDetail', {order: item})}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Order #{item.id.substring(0, 8)}</Text>
        <View style={[styles.statusBadge, {backgroundColor: (STATUS_COLORS[item.status] ?? '#999') + '33'}]}>
          <Text style={[styles.statusText, {color: STATUS_COLORS[item.status] ?? '#999'}]}>
            {STATUS_LABELS[item.status] ?? item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.meta}>
        {item.items.length} items · ₹{item.total_amount.toFixed(2)}
      </Text>
      <Text style={styles.date}>{item.created_at.substring(0, 16).replace('T', ' ')}</Text>
    </TouchableOpacity>
  );

  if (error && orders.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{color: 'red'}}>{error}</Text>
        <TouchableOpacity style={styles.retry} onPress={() => loadOrders(true)}>
          <Text style={{color: '#fff'}}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {orders.length === 0 && !loading ? (
        <View style={styles.centered}>
          <Text style={{fontSize: 18, color: '#999'}}>No orders yet</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={() => loadOrders(true)}
          onEndReached={() => {if (hasMore) loadOrders();}}
          onEndReachedThreshold={0.3}
          renderItem={renderOrder}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16},
  retry: {backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, marginTop: 16},
  list: {padding: 12},
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2,
  },
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  orderId: {fontWeight: 'bold', fontSize: 16},
  statusBadge: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12},
  statusText: {fontWeight: '600', fontSize: 12},
  meta: {marginTop: 8, color: '#555'},
  date: {color: '#999', fontSize: 12, marginTop: 4},
});

export default OrdersScreen;
