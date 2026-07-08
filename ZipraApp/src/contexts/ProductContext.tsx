import React, {createContext, useContext, useState, useCallback, useRef, ReactNode} from 'react';
import {listProducts} from '../services/api';
import type {Product} from '../types';

const ProductContext = createContext<{
  products: Product[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadProducts: (refresh?: boolean, category?: string) => Promise<void>;
  setCategory: (cat: string) => void;
} | null>(null);

export function ProductProvider({children}: {children: ReactNode}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [category, setCategoryState] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const productsRef = useRef<Product[]>([]);

  const loadProducts = useCallback(async (refresh = false, cat?: string) => {
    const activeCategory = cat !== undefined ? cat : category;
    if (refresh) {
      pageRef.current = 1;
      setPage(1);
      setProducts([]);
      productsRef.current = [];
      setHasMore(true);
      if (cat !== undefined) setCategoryState(cat);
    }

    setLoading(true);
    setError(null);

    try {
      const currentPage = refresh ? 1 : pageRef.current;
      const result = await listProducts(activeCategory, currentPage);
      const newProducts = (result.products as Product[]) ?? [];
      productsRef.current = refresh ? newProducts : [...productsRef.current, ...newProducts];
      setProducts(productsRef.current);
      setHasMore(productsRef.current.length < (result.total as number));
      pageRef.current = refresh ? 2 : currentPage + 1;
      setPage(pageRef.current);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load products');
    }

    setLoading(false);
  }, [category]);

  const setCategory = useCallback((cat: string) => {
    loadProducts(true, cat);
  }, [loadProducts]);

  return (
    <ProductContext.Provider value={{products, loading, error, hasMore, loadProducts, setCategory}}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within ProductProvider');
  return ctx;
}
