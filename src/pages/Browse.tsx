import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAllTitles } from '../lib/data';
import { PosterCard } from '../components/PosterCard';

export default function Browse() {
  const { source } = useParams();
  const { animewitcher, asia2tv } = getAllTitles();
  
  if (source !== 'animewitcher' && source !== 'asia2tv') {
    return <div className="text-center py-20 font-headline-md font-bold text-on-surface">Source not found.</div>;
  }

  const items = source === 'animewitcher' ? animewitcher : asia2tv;
  const sourceName = source === 'animewitcher' ? 'Anime (AnimeWitcher)' : 'Asian Drama (Asia2TV)';

  return (
    <div className="max-w-[1200px] mx-auto px-margin-edge py-lg">
      <div className="mb-xl">
        <h1 className="font-display-lg text-[36px] font-bold text-on-surface mb-2 tracking-tighter">Browse {sourceName}</h1>
        <p className="font-body-md text-on-surface-variant font-bold">{items.length} titles available</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-gutter mb-xl">
        {items.map((t: any) => (
          <PosterCard 
            key={t.id} 
            id={t.id} 
            source={source}
            title={source==='animewitcher' ? (t.english_title || t.name) : t.title}
            poster={t.poster}
            type={t.type || (source==='asia2tv'? "Drama": null)} 
            tags={t.tags} 
            episodeCount={t.episodes?.length}
          />
        ))}
      </div>
    </div>
  );
}
