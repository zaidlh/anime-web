import { useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { db, auth } from './firebase';

export interface ListItem {
  id: string;
  source: string;
  title: string;
  poster: string | null;
  type: string | null;
  addedAt: number;
}

const LIST_KEY = 'cloudstream_mylist';

export function getMyListLocal(): ListItem[] {
  try {
    const data = localStorage.getItem(LIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

// React context/hook for real-time list
export function useMyList() {
  const [list, setList] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If we're not using Firebase auth listener immediately, 
    // we can rely on auth.currentUser changing or just local storage
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // Fetch from Firebase real-time
        const listRef = collection(db, 'users', user.uid, 'myList');
        const unsubscribeSnapshot = onSnapshot(listRef, (snapshot) => {
          const items: ListItem[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            items.push(data as ListItem);
          });
          // sort by addedAt desc
          items.sort((a, b) => b.addedAt - a.addedAt);
          setList(items);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching myList:", error);
          setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        // Fetch from LocalStorage
        setList(getMyListLocal());
        setLoading(false);
        
        // Listen to local storage changes via custom event or polling
        const handleStorage = () => setList(getMyListLocal());
        window.addEventListener('storage', handleStorage);
        const interval = setInterval(handleStorage, 1000); // fallback for same-tab
        return () => {
          window.removeEventListener('storage', handleStorage);
          clearInterval(interval);
        };
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return { list, loading };
}

export async function addToList(item: Omit<ListItem, 'addedAt'>) {
  const fullItem: ListItem = { ...item, addedAt: Date.now() };
  
  if (auth.currentUser) {
    // Save to Firebase
    try {
      const docId = encodeURIComponent(`${item.source}_${item.id}`);
      const docRef = doc(db, 'users', auth.currentUser.uid, 'myList', docId);
      await setDoc(docRef, fullItem);
    } catch (e) {
      console.error("Failed to add to Firebase list", e);
    }
  } else {
    // Save locally
    const list = getMyListLocal();
    if (!list.some(i => i.id === item.id && i.source === item.source)) {
      list.unshift(fullItem);
      try {
        localStorage.setItem(LIST_KEY, JSON.stringify(list));
      } catch (err) {
        console.error("LocalStorage save error:", err);
      }
    }
  }
}

export async function removeFromList(id: string, source: string) {
  if (auth.currentUser) {
    try {
      const docId = encodeURIComponent(`${source}_${id}`);
      const docRef = doc(db, 'users', auth.currentUser.uid, 'myList', docId);
      await deleteDoc(docRef);
    } catch (e) {
      console.error("Failed to remove from Firebase list", e);
    }
  } else {
    const list = getMyListLocal();
    const newList = list.filter(item => !(item.id === id && item.source === source));
    try {
      localStorage.setItem(LIST_KEY, JSON.stringify(newList));
    } catch (err) {
      console.error("LocalStorage save error:", err);
    }
  }
}

export function useIsInList(id: string, source: string) {
  const { list } = useMyList();
  return list.some(item => item.id === id && item.source === source);
}

