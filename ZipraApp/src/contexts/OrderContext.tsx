import React, {createContext, useContext, useState, useCallback, useRef, ReactNode} from 'react';
import {getMyOrders} from '../services/api';

interface OrderItem {
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  payment_id: string;
  created_at: string;
  items: OrderItem[];
}

const OrderContext = createContext<{
  orders: Order[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadOrders: (refresh?: boolean) => Promise<void>;
} | null>(null);

export function OrderProvider({children}: {children: ReactNode}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const ordersRef = useRef<Order[]>([]);

  const loadOrders = useCallback(async (refresh = false) => {
    if (refresh) {
      pageRef.current = 1;
      setPage(1);
      setOrders([]);
      ordersRef.current = [];
      setHasMore(true);
    }

    setLoading(true);
    setError(null);

    try {
      const currentPage = refresh ? 1 : pageRef.current;
      const result = await getMyOrders(currentPage);
      const newOrders = (result.orders as Order[]) ?? [];
      ordersRef.current = refresh ? newOrders : [...ordersRef.current, ...newOrders];
      setOrders(ordersRef.current);
      setHasMore(ordersRef.current.length < (result.total as number));
      pageRef.current = refresh ? 2 : currentPage + 1;
      setPage(pageRef.current);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load orders');
    }

    setLoading(false);
  }, []);

  return (
    <OrderContext.Provider value={{orders, loading, error, hasMore, loadOrders}}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
}
