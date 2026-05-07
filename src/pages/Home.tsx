import React from 'react';
import { Link } from 'react-router-dom';
import { getAllTitles } from '../lib/data';
import { PosterCard } from '../components/PosterCard';

export default function Home() {
  const { animewitcher, asia2tv } = getAllTitles();
  
  const animes = animewitcher.slice(0, 12);
  const dramas = asia2tv.slice(0, 12);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-12">
      <section className="bg-gradient-to-r from-blue-900/20 to-emerald-900/20 border border-[#262626] rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 text-white">
          Watch & Download <br/>Anime & Asian Drama
        </h1>
        <p className="text-[#a3a3a3] max-w-2xl mb-8">
          The ultimate static catalog combining multiple sources. Stream natively in your browser or batch download whole series in one click without annoying ads.
        </p>
        <div className="flex gap-4">
          <Link to="/browse/animewitcher" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Browse Anime
          </Link>
          <Link to="/browse/asia2tv" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Browse Dramas
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-l-4 border-blue-500 pl-3">
            Latest Anime
          </h2>
          <Link to="/browse/animewitcher" className="text-sm text-blue-500 hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {animes.map(t => (
            <PosterCard 
              key={t.id}
              id={t.id}
              source="animewitcher"
              title={t.english_title || t.name}
              subtitle={t.type || 'Anime'}
              poster={t.poster}
              type={t.type}
              tags={t.tags}
              episodeCount={t.episodes?.length}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
            Latest Asian Drama
          </h2>
          <Link to="/browse/asia2tv" className="text-sm text-emerald-500 hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {dramas.map(t => (
            <PosterCard 
              key={t.url}
              id={t.id}
              source="asia2tv"
              title={t.title}
              poster={t.poster}
              type="Drama"
              tags={t.tags}
              episodeCount={t.episodes?.length}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
