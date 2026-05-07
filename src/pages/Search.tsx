import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchTitles } from '../lib/data';
import { PosterCard } from '../components/PosterCard';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';

  const results = useMemo(() => searchTitles(q), [q]);
  const total = results.animewitcher.length + results.asia2tv.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">Search Results for "{q}"</h1>
      <p className="text-gray-400 mb-8">{total} titles found</p>

      {total === 0 && (
        <div className="text-center py-20 bg-[#1a1a1a] rounded-lg border border-[#262626]">
          <p className="text-lg text-gray-500">No titles matched your search.</p>
        </div>
      )}

      {results.animewitcher.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6 border-l-4 border-blue-500 pl-3">Anime</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {results.animewitcher.map(t => (
              <PosterCard 
                key={t.id} id={t.id} source="animewitcher"
                title={t.english_title || t.name} poster={t.poster}
                type={t.type} tags={t.tags} episodeCount={t.episodes?.length}
              />
            ))}
          </div>
        </section>
      )}

      {results.asia2tv.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-6 border-l-4 border-emerald-500 pl-3">Asian Drama</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {results.asia2tv.map(t => (
              <PosterCard 
                key={t.id} id={t.id} source="asia2tv"
                title={t.title} poster={t.poster}
                type="Drama" tags={t.tags} episodeCount={t.episodes?.length}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
