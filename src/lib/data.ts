import animewitcherData from '../data/animewitcher.json';
import asia2tvData from '../data/asia2tv.json';

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

export function getAllTitles() {
  return {
    animewitcher: animewitcherData.titles as AnimeWitcherTitle[],
    asia2tv: asia2tvData.titles as Asia2TVTitle[],
    meta: {
      animewitcherCount: animewitcherData.count,
      asia2tvCount: asia2tvData.count,
    }
  };
}

export function getTitleById(source: SourceType, id: string): AnimeWitcherTitle | Asia2TVTitle | undefined {
  if (source === 'animewitcher') {
    return (animewitcherData.titles as AnimeWitcherTitle[]).find(t => t.id === id);
  }
  return (asia2tvData.titles as Asia2TVTitle[]).find(t => t.id === id || t.url === id);
}

export function getEpisodeByNumber(
  source: SourceType,
  titleId: string,
  episodeNum: string
): { title: any; episode: any; index: number } | null {
  const title = getTitleById(source, titleId);
  if (!title) return null;
  const episodes = (title as any).episodes;
  const idx = episodes.findIndex((ep: any) => String(ep.number) === episodeNum || ep.doc_id === episodeNum);
  if (idx === -1) return null;
  return { title, episode: episodes[idx], index: idx };
}

export function searchTitles(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return { animewitcher: [], asia2tv: [] };

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

  const anime = (animewitcherData.titles as AnimeWitcherTitle[])
    .map(t => ({ t, r: rank(t, 'animewitcher') }))
    .filter(x => x.r > 0)
    .sort((a, b) => b.r - a.r || (a.t.english_title || a.t.name).localeCompare(b.t.english_title || b.t.name))
    .map(x => x.t);

  const drama = (asia2tvData.titles as Asia2TVTitle[])
    .map(t => ({ t, r: rank(t, 'asia2tv') }))
    .filter(x => x.r > 0)
    .sort((a, b) => b.r - a.r || a.t.title.localeCompare(b.t.title))
    .map(x => x.t);

  return { animewitcher: anime, asia2tv: drama };
}
