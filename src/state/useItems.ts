import { useState, useEffect } from 'react';
import { ItemDTO, InputType, TrackingRule } from '@/types/item';
import { api } from '@/api/client';
import { createPayload, CreatePayloadInput } from '@/lib/buildCreatePayload';
import { buildSkuKey } from '@/lib/normalize';
import { nanoid } from 'nanoid';

const STORAGE_KEY = 'spa.items.v2'; // Updated to v2 for snake_case schema
const DEMO_KEY = 'spa.demo.v2';

export function useItems() {
  const [items, setItems] = useState<ItemDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetchAt, setLastFetchAt] = useState<string | undefined>(undefined);
  const [demoMode, setDemoMode] = useState(() => {
    const stored = localStorage.getItem(DEMO_KEY);
    return stored === 'true' || import.meta.env.VITE_DEMO_MODE === 'true';
  });

  // Bootstrap: load from API or localStorage
  const bootstrap = async () => {
    setLoading(true);
    try {
      const fetchedItems = await api.listItems();
      setItems(fetchedItems);
      setLastFetchAt(new Date().toISOString());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fetchedItems));
    } catch (error) {
      console.error('Failed to fetch items from API', error);
      // Fallback to localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setItems(parsed);
        } catch (e) {
          console.error('Failed to parse stored items', e);
        }
      }
      // If no items and API failed, enable demo mode
      if (!stored || JSON.parse(stored).length === 0) {
        setDemoMode(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Save items to localStorage whenever they change
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  // Save demo mode to localStorage
  useEffect(() => {
    localStorage.setItem(DEMO_KEY, String(demoMode));
  }, [demoMode]);

  // Add item by mode
  const addBy = async (input: CreatePayloadInput) => {
    const payload = createPayload(input);

    // Optimistic insert with skeleton
    const skeletonItem: ItemDTO = {
      id: nanoid(),
      title: input.title,
      url: input.url,
      domain: input.url ? new URL(input.url).hostname : 'manual',
      input_type: input.mode,
      user_country: input.country,
      attributes: payload.attributes,
      links: input.links || [],
      tracking_rule: input.rule,
      status: 'TRACKING',
      sku_key: payload.sku_key,
      last_checked: new Date().toISOString(),
      history: [],
    };

    setItems((prev) => [skeletonItem, ...prev]);

    if (demoMode) {
      // In demo mode, just keep the skeleton
      return skeletonItem;
    }

    try {
      const newItem = await api.createItem(payload);
      // Replace skeleton with real item
      setItems((prev) =>
        prev.map((item) => (item.id === skeletonItem.id ? newItem : item))
      );
      return newItem;
    } catch (error) {
      // Remove skeleton on error
      setItems((prev) => prev.filter((item) => item.id !== skeletonItem.id));
      throw error;
    }
  };

  const addItem = (item: ItemDTO) => {
    setItems((prev) => [item, ...prev]);
  };

  const updateItem = (id: string, updates: Partial<ItemDTO>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeItem = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (!demoMode) {
      try {
        await api.deleteItem(id);
      } catch (error) {
        console.error('Failed to delete item from API', error);
      }
    }
  };

  const refreshPrices = async (ids?: string[]) => {
    if (demoMode) {
      // Simulate refresh in demo mode
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          last_checked: new Date().toISOString(),
        }))
      );
      return;
    }

    try {
      const result = await api.refreshPrices(ids);
      // Merge updated items
      setItems((prev) =>
        prev.map((item) => {
          const updated = result.updated.find((u) => u.id === item.id);
          return updated ? updated : item;
        })
      );
      setLastFetchAt(new Date().toISOString());
    } catch (error) {
      console.error('Failed to refresh prices', error);
      throw error;
    }
  };

  const simulateDrop = async (id: string) => {
    if (demoMode) {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      const newPrice =
        item.tracking_rule.type === 'below_absolute'
          ? item.tracking_rule.value * 0.95
          : item.current_price
          ? item.current_price * 0.85
          : 50;

      updateItem(id, {
        current_price: newPrice,
        status: 'ALERTED',
        last_checked: new Date().toISOString(),
      });
    } else {
      try {
        const updated = await api.simulateDrop(id);
        updateItem(id, updated);
      } catch (error) {
        console.error('Failed to simulate drop', error);
        throw error;
      }
    }
  };

  const editTrackingRule = async (id: string, rule: TrackingRule) => {
    updateItem(id, { tracking_rule: rule });
    if (!demoMode) {
      try {
        await api.patchItem(id, { tracking_rule: rule });
      } catch (error) {
        console.error('Failed to update tracking rule', error);
        throw error;
      }
    }
  };

  const toggleDemo = (on: boolean) => {
    setDemoMode(on);
  };

  const seedDemo = () => {
    const demoItems: ItemDTO[] = [
      {
        id: nanoid(),
        title: 'A Light in the Attic',
        url: 'https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html',
        domain: 'books.toscrape.com',
        input_type: 'url',
        user_country: 'GB',
        links: [],
        tracking_rule: { type: 'below_absolute', currency: 'GBP', value: 52.0 },
        status: 'TRACKING',
        current_price: 51.77,
        target_price: 52.0,
        sku_key: buildSkuKey('A Light in the Attic', undefined, 'GB'),
        last_checked: new Date().toISOString(),
        history: [],
      },
      {
        id: nanoid(),
        title: 'Tipping the Velvet',
        url: 'https://books.toscrape.com/catalogue/tipping-the-velvet_999/index.html',
        domain: 'books.toscrape.com',
        input_type: 'url',
        user_country: 'GB',
        links: [],
        tracking_rule: { type: 'below_absolute', currency: 'GBP', value: 53.0 },
        status: 'TRACKING',
        current_price: 53.74,
        target_price: 53.0,
        sku_key: buildSkuKey('Tipping the Velvet', undefined, 'GB'),
        last_checked: new Date().toISOString(),
        history: [],
      },
      {
        id: nanoid(),
        title: 'iPhone 15 Pro 256GB',
        domain: 'manual',
        input_type: 'name+attrs',
        user_country: 'GB',
        attributes: { size: '256GB', color: 'black', region: 'UK' },
        links: [],
        tracking_rule: { type: 'percentage_below_avg', value: 10 },
        status: 'TRACKING',
        current_price: 999.0,
        sku_key: buildSkuKey(
          'iPhone 15 Pro 256GB',
          { size: '256GB', color: 'black', region: 'UK' },
          'GB'
        ),
        last_checked: new Date().toISOString(),
        history: [],
      },
    ];

    setItems(demoItems);
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
    setDemoMode: toggleDemo,
    bootstrap,
    addBy,
    addItem,
    updateItem,
    removeItem,
    refreshPrices,
    simulateDrop,
    editTrackingRule,
    seedDemo,
    resetDemo,
  };
}
