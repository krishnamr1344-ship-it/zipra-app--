import React, {createContext, useContext, useReducer, ReactNode} from 'react';
import type {Product} from '../types';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: Record<string, CartItem>;
}

type CartAction =
  | {type: 'ADD'; product: Product; quantity?: number}
  | {type: 'REMOVE'; productId: string}
  | {type: 'UPDATE_QTY'; productId: string; quantity: number}
  | {type: 'CLEAR'};

const CartContext = createContext<{
  items: Record<string, CartItem>;
  addProduct: (product: Product, quantity?: number) => void;
  removeProduct: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalAmount: number;
  itemCount: number;
} | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items[action.product.id];
      const qty = (existing?.quantity ?? 0) + (action.quantity ?? 1);
      return {
        items: {...state.items, [action.product.id]: {product: action.product, quantity: qty}},
      };
    }
    case 'REMOVE': {
      const items = {...state.items};
      delete items[action.productId];
      return {items};
    }
    case 'UPDATE_QTY': {
      if (action.quantity <= 0) {
        const items = {...state.items};
        delete items[action.productId];
        return {items};
      }
      const existing = state.items[action.productId];
      if (!existing) return state;
      return {
        items: {...state.items, [action.productId]: {...existing, quantity: action.quantity}},
      };
    }
    case 'CLEAR':
      return {items: {}};
    default:
      return state;
  }
}

export function CartProvider({children}: {children: ReactNode}) {
  const [state, dispatch] = useReducer(cartReducer, {items: {}});

  const items = state.items;
  const itemCount = Object.values(items).reduce((s, i) => s + i.quantity, 0);
  const totalAmount = Object.values(items).reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addProduct: (product, quantity) => dispatch({type: 'ADD', product, quantity}),
        removeProduct: productId => dispatch({type: 'REMOVE', productId}),
        updateQuantity: (productId, quantity) => dispatch({type: 'UPDATE_QTY', productId, quantity}),
        clear: () => dispatch({type: 'CLEAR'}),
        totalAmount,
        itemCount,
      }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
