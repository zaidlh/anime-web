import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

export type SourceType = 'animewitcher' | 'asia2tv';

export type ServerInfo = {
  name: string;
  quality: string | null;
  link?: string; // animewitcher
  url?: string;  // asia2tv
  open_browser?: boolean;
};

export type AnimeWitcherEpisode = {
  doc_id: string;
  number: number;
  name: string | null;
  thumb: string | null;
  bunny_video_id: string | null;
  servers?: ServerInfo[];
};

export type Asia2TVEpisode = {
  number: number;
  url: string;
  servers?: ServerInfo[];
};

export type AnimeWitcherTitle = {
  id: string;
  name: string;
  english_title: string | null;
  type: string | null;
  poster: string | null;
  story: string | null;
  tags: string[];
  episodes: AnimeWitcherEpisode[];
};

export type Asia2TVTitle = {
  id: string;
  title: string;
  url: string;
  poster: string | null;
  plot: string | null;
  tags: string[];
  episodes: Asia2TVEpisode[];
};

type DataContextType = {
  animewitcher: AnimeWitcherTitle[];
  asia2tv: Asia2TVTitle[];
  loading: boolean;
  error: string | null;
};

const DataContext = createContext<DataContextType>({
  animewitcher: [],
  asia2tv: [],
  loading: true,
  error: null
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [animewitcher, setAnimeWitcher] = useState<AnimeWitcherTitle[]>([]);
  const [asia2tv, setAsia2TV] = useState<Asia2TVTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [animeRes, dramaRes] = await Promise.all([
          fetch('https://raw.githubusercontent.com/zaidlh/Anime/refs/heads/main/data/animewitcher.json'),
          fetch('https://raw.githubusercontent.com/zaidlh/Anime/refs/heads/main/data/asia2tv.json')
        ]);
        if (!animeRes.ok || !dramaRes.ok) throw new Error('Failed to fetch data files');
        const animeData = await animeRes.json();
        const dramaData = await dramaRes.json();
        setAnimeWitcher(animeData.titles || []);
        setAsia2TV(dramaData.titles || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <DataContext.Provider value={{ animewitcher, asia2tv, loading, error }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}

export function useAllTitles() {
  const data = useData();
  return {
    animewitcher: data.animewitcher,
    asia2tv: data.asia2tv,
    loading: data.loading,
    error: data.error,
    meta: {
      animewitcherCount: data.animewitcher.length,
      asia2tvCount: data.asia2tv.length,
    }
  };
}

export function useTitleById(source: SourceType, id: string): { title: AnimeWitcherTitle | Asia2TVTitle | undefined, loading: boolean } {
  const { animewitcher, asia2tv, loading } = useData();
  if (source === 'animewitcher') {
    return { title: animewitcher.find(t => t.id === id), loading };
  }
  return { title: asia2tv.find(t => t.id === id || t.url === id), loading };
}

export function useEpisodeByNumber(
  source: SourceType,
  titleId: string,
  episodeNum: string
): { title: any; episode: any; index: number; loading: boolean } | null {
  const { title, loading } = useTitleById(source, titleId);
  if (loading) return { title: null, episode: null, index: -1, loading };
  if (!title) return null;
  const episodes = (title as any).episodes;
  const idx = episodes.findIndex((ep: any) => String(ep.number) === episodeNum || ep.doc_id === episodeNum);
  if (idx === -1) return null;
  return { title, episode: episodes[idx], index: idx, loading };
}

export function useSearchTitles(query: string) {
  const q = query.toLowerCase().trim();
  const { animewitcher, asia2tv, loading } = useData();
  
  if (!q) return { animewitcher: [], asia2tv: [], loading };

  const rank = (title: any, source: SourceType): number => {
    const name = source === 'animewitcher' 
      ? (title.english_title || title.name || '') 
      : (title.title || '');
    const lowerName = name.toLowerCase();
    const tags = (title.tags || []).join(' ').toLowerCase();
    const synopsis = source === 'animewitcher' ? (title.story || '') : (title.plot || '');
    const lowerSynopsis = synopsis.toLowerCase();

    if (lowerName === q) return 5;
    if (lowerName.startsWith(q)) return 4;
    if (lowerName.includes(q)) return 3;
    if (tags.includes(q)) return 2;
    if (lowerSynopsis.includes(q)) return 1;
    return 0;
  };

  const anime = animewitcher
    .map(t => ({ t, r: rank(t, 'animewitcher') }))
    .filter(x => x.r > 0)
    .sort((a, b) => b.r - a.r || (a.t.english_title || a.t.name).localeCompare(b.t.english_title || b.t.name))
    .map(x => x.t);

  const drama = asia2tv
    .map(t => ({ t, r: rank(t, 'asia2tv') }))
    .filter(x => x.r > 0)
    .sort((a, b) => b.r - a.r || a.t.title.localeCompare(b.t.title))
    .map(x => x.t);

  return { animewitcher: anime, asia2tv: drama, loading };
}
