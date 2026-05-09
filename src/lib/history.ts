import { useState, useEffect } from 'react';

const HISTORY_KEY = 'cs_pref_history';

export interface HistoryItem {
  source: string;
  titleId: string;
  epId: string | number;
  time: number; // progress time in seconds (optional)
  duration: number; // total duration (optional)
  completed: boolean;
  updatedAt: number;
}

export function getHistory(): Record<string, HistoryItem> {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

export function saveHistoryItem(item: Omit<HistoryItem, 'updatedAt'>) {
  const history = getHistory();
  const key = `${item.source}_${item.titleId}_${item.epId}`;
  history[key] = {
    ...item,
    updatedAt: Date.now()
  };
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function markEpisodeCompleted(source: string, titleId: string, epId: string | number) {
  saveHistoryItem({
    source,
    titleId,
    epId,
    time: 0,
    duration: 0,
    completed: true
  });
}

export function useHistory() {
  const [history, setHistory] = useState<Record<string, HistoryItem>>({});

  useEffect(() => {
    setHistory(getHistory());
    
    const handleStorage = () => setHistory(getHistory());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const markCompleted = (source: string, titleId: string, epId: string | number) => {
    markEpisodeCompleted(source, titleId, epId);
    setHistory(getHistory());
  }

  const isCompleted = (source: string, titleId: string, epId: string | number) => {
    const key = `${source}_${titleId}_${epId}`;
    return history[key]?.completed || false;
  }

  return { history, markCompleted, isCompleted };
}
