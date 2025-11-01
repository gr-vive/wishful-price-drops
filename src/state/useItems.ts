import { useState, useEffect } from 'react';
import { ItemDTO } from '@/types/item';

const STORAGE_KEY = 'spa.items.v1';

export function useItems() {
  const [items, setItems] = useState<ItemDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetchAt, setLastFetchAt] = useState<Date | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  // Load items from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setItems(parsed);
      } catch (e) {
        console.error('Failed to parse stored items', e);
      }
    }
  }, []);

  // Save items to localStorage whenever they change
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const addItem = (item: ItemDTO) => {
    setItems((prev) => [item, ...prev]);
  };

  const updateItem = (id: string, updates: Partial<ItemDTO>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const resetDemo = () => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    items,
    setItems,
    loading,
    setLoading,
    lastFetchAt,
    setLastFetchAt,
    demoMode,
    setDemoMode,
    addItem,
    updateItem,
    removeItem,
    resetDemo,
  };
}
