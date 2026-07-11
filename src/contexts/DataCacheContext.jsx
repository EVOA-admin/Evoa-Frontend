import React, { createContext, useContext, useRef } from 'react';

const DataCacheContext = createContext(null);

/**
 * Lightweight in-memory TTL cache.
 * Stored in a ref so it survives renders but is not reactive.
 * All dashboard pages and shared layout components read from here
 * before making API calls, preventing redundant fetches on navigation.
 */
export function DataCacheProvider({ children }) {
  const store = useRef(new Map());

  const get = (key) => {
    const entry = store.current.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.current.delete(key);
      return null;
    }
    return entry.data;
  };

  const set = (key, data, ttlMs = 5 * 60 * 1000) => {
    store.current.set(key, { data, expiresAt: Date.now() + ttlMs });
  };

  const invalidate = (key) => {
    store.current.delete(key);
  };

  const invalidateAll = () => {
    store.current.clear();
  };

  return (
    <DataCacheContext.Provider value={{ get, set, invalidate, invalidateAll }}>
      {children}
    </DataCacheContext.Provider>
  );
}

export function useDataCache() {
  const ctx = useContext(DataCacheContext);
  if (!ctx) throw new Error('useDataCache must be used within a DataCacheProvider');
  return ctx;
}
