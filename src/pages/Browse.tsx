import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAllTitles } from '../lib/data';
import { PosterCard } from '../components/PosterCard';

export default function Browse() {
  const { source } = useParams();
  const { animewitcher, asia2tv } = getAllTitles();
  
  if (source !== 'animewitcher' && source !== 'asia2tv') {
    return <div className="text-center py-20">Source not found.</div>;
  }

  const items = source === 'animewitcher' ? animewitcher : asia2tv;
  const sourceName = source === 'animewitcher' ? 'Anime (AnimeWitcher)' : 'Asian Drama (Asia2TV)';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Browse {sourceName}</h1>
        <p className="text-gray-400">{items.length} titles available</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
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
