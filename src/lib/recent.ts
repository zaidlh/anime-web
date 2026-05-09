import { useState, useEffect } from 'react';

const RECENTLY_VIEWED_KEY = 'cs_recently_viewed';

export interface RecentlyViewedItem {
  source: string;
  id: string;
  title: string;
  poster: string | null;
  type: string | null;
  timestamp: number;
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export function addRecentlyViewed(item: Omit<RecentlyViewedItem, 'timestamp'>) {
  let list = getRecentlyViewed();
  // Remove if exists
  list = list.filter(i => !(i.source === item.source && i.id === item.id));
  // Add to front
  list.unshift({ ...item, timestamp: Date.now() });
  // Keep latest 10
  if (list.length > 10) list = list.slice(0, 10);
  
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list));
}

export function clearRecentlyViewed() {
  localStorage.removeItem(RECENTLY_VIEWED_KEY);
}

export function useRecentlyViewed() {
  const [recent, setRecent] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    setRecent(getRecentlyViewed());
    
    const handleStorage = () => setRecent(getRecentlyViewed());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return { 
    recent, 
    clearRecent: () => {
      clearRecentlyViewed();
      setRecent([]);
    }
  };
}
