import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAllTitles } from '../lib/data';
import { PosterCard } from '../components/PosterCard';

export default function Browse() {
  const { source } = useParams<{ source: string }>();
  const { animewitcher, asia2tv, loading } = useAllTitles();
  const [activeTab, setActiveTab] = React.useState<'all' | 'anime' | 'drama'>(source === 'asia2tv' ? 'drama' : source === 'animewitcher' ? 'anime' : 'all');
  
  if (loading) {
    return (
      <div className="w-full h-[70vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (source && source !== 'animewitcher' && source !== 'asia2tv') {
    return <div className="text-center py-20 font-headline-md font-bold text-on-surface">Source not found.</div>;
  }

  const animeItems = animewitcher.map(t => ({ ...t, _source: 'animewitcher' }));
  const dramaItems = asia2tv.map(t => ({ ...t, _source: 'asia2tv' }));
  
  const items = !source 
    ? activeTab === 'all' 
      ? [...animeItems, ...dramaItems]
      : activeTab === 'anime'
        ? animeItems
        : dramaItems
    : source === 'animewitcher' 
      ? animeItems 
      : dramaItems;

  const sourceName = !source 
    ? 'All Catalog' 
    : source === 'animewitcher' 
      ? 'Anime (AnimeWitcher)' 
      : 'Asian Drama (Asia2TV)';

  // Count items per category
  const animeCount = animeItems.length;
  const dramaCount = dramaItems.length;
  const totalCount = animeCount + dramaCount;

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-margin-edge py-6 md:py-lg">
      <div className="mb-8 md:mb-xl bg-surface-container border border-surface-variant rounded-2xl p-6 md:p-xl shadow-sm text-center">
        <h1 className="font-display-lg text-[28px] md:text-[36px] font-bold text-on-surface mb-2 tracking-tighter">{sourceName}</h1>
        <p className="font-body-md text-on-surface-variant font-bold flex items-center justify-center gap-2 text-sm md:text-base">
          <span className="material-symbols-outlined text-primary text-[20px]">movie</span>
          {items.length} titles available
        </p>
      </div>

      {/* Tabs for Browse All page */}
      {!source && (
        <div className="flex justify-center gap-2 mb-8 md:mb-xl overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 md:px-6 py-2.5 md:py-3 rounded-full font-title-sm font-bold transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === 'all' 
                ? 'bg-primary text-on-primary' 
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('anime')}
            className={`px-5 md:px-6 py-2.5 md:py-3 rounded-full font-title-sm font-bold transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === 'anime' 
                ? 'bg-primary text-on-primary' 
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            Anime ({animeCount})
          </button>
          <button
            onClick={() => setActiveTab('drama')}
            className={`px-5 md:px-6 py-2.5 md:py-3 rounded-full font-title-sm font-bold transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === 'drama' 
                ? 'bg-primary text-on-primary' 
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            Drama ({dramaCount})
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-gutter mb-xl">
        {items.map((t: any) => (
          <PosterCard 
            key={`${t._source}-${t.id}`} 
            id={t.id} 
            source={t._source}
            title={t._source === 'animewitcher' ? (t.english_title || t.name) : t.title}
            poster={t.poster}
            type={t.type || (t._source === 'asia2tv' ? "Drama" : null)} 
            tags={t.tags} 
            episodeCount={t.episodes?.length}
          />
        ))}
      </div>
    </div>
  );
}
