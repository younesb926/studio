
"use client"

import { useState, useEffect } from 'react';
import { Product, CartItem } from '@/lib/types';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('souk_electra_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem('souk_electra_cart', JSON.stringify(newItems));
  };

  const addToCart = (product: Product) => {
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      const newItems = items.map(i => 
        i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      );
      saveCart(newItems);
    } else {
      saveCart([...items, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    saveCart(items.filter(i => i.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(productId);
    saveCart(items.map(i => i.id === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => saveCart([]);

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    itemCount
  };
}
