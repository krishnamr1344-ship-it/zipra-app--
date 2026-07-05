import axios from 'axios';
import Config from '../config';

const api = axios.create({baseURL: Config.baseUrl});

export const listProducts = async (
  category = '',
  page = 1,
  perPage = 20,
) => {
  const res = await api.get('/products', {
    params: {category: category || undefined, page, per_page: perPage},
  });
  return res.data;
};

export const createOrder = async (
  items: {product_id: string; quantity: number}[],
  deliveryAddress: string,
  idempotencyKey: string,
) => {
  const res = await api.post(
    '/orders',
    {items, delivery_address: deliveryAddress},
    {headers: {'Idempotency-Key': idempotencyKey}},
  );
  return res.data;
};

export const verifyPayment = async (
  orderId: string,
  paymentId: string,
  signature: string,
) => {
  const res = await api.patch(`/orders/${orderId}/verify`, {
    payment_id: paymentId,
    signature,
  });
  return res.data;
};

export const getMyOrders = async (page = 1, perPage = 20) => {
  const res = await api.get('/orders/my', {
    params: {page, per_page: perPage},
  });
  return res.data;
};

export const getConfig = async () => {
  const res = await api.get('/config');
  return res.data;
};
