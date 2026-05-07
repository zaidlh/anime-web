import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchTitles } from '../lib/data';
import { PosterCard } from '../components/PosterCard';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';

  const results = useMemo(() => searchTitles(q), [q]);
  const total = results.animewitcher.length + results.asia2tv.length;

  return (
    <div className="max-w-[1200px] mx-auto px-margin-edge py-lg">
      <div className="mb-xl">
        <h1 className="font-display-lg text-[36px] font-bold text-on-surface mb-2">Search Results for "{q}"</h1>
        <p className="font-body-md text-on-surface-variant">{total} titles found</p>
      </div>

      {total === 0 && (
        <div className="text-center py-20 bg-surface-container rounded-xl ghost-border">
          <p className="font-headline-md text-on-surface-variant font-bold">No titles matched your search.</p>
        </div>
      )}

      {results.animewitcher.length > 0 && (
        <section className="mb-xl">
          <div className="flex justify-between items-end mb-lg">
            <h2 className="font-headline-md text-[24px] font-bold text-primary mb-xs">Anime</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-gutter">
            {results.animewitcher.map(t => (
              <PosterCard 
                id={t.id} source="animewitcher"
                title={t.english_title || t.name} poster={t.poster}
                type={t.type} tags={t.tags} episodeCount={t.episodes?.length}
              />
            ))}
          </div>
        </section>
      )}

      {results.asia2tv.length > 0 && (
        <section className="mb-xl">
          <div className="flex justify-between items-end mb-lg">
            <h2 className="font-headline-md text-[24px] font-bold text-secondary mb-xs">Asian Drama</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-gutter">
            {results.asia2tv.map(t => (
              <PosterCard 
                id={t.id} source="asia2tv"
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
