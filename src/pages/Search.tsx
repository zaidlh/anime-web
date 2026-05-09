import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useSearchTitles, useAllTitles } from '../lib/data';
import { PosterCard } from '../components/PosterCard';
import { Star } from 'lucide-react';

import { SkeletonPosterGrid } from '../components/Skeleton';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [inputValue, setInputValue] = useState(q);
  const navigate = useNavigate();

  const results = useSearchTitles(q);
  const { animewitcher, asia2tv } = useAllTitles();
  
  const total = results.animewitcher.length + results.asia2tv.length;

  useEffect(() => {
    setInputValue(q);
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setParams({ q: inputValue.trim() });
    } else {
      setParams({});
    }
  };

  if (results.loading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto min-h-[90vh] bg-[#101010] flex flex-col pt-4 px-4 sm:px-6 pb-24">
        <SkeletonPosterGrid />
      </div>
    );
  }

  // If we have a query, show results:
  if (q) {
    return (
      <div className="max-w-[1200px] mx-auto px-margin-edge py-lg min-h-[80vh]">
        <div className="mb-xl sm:hidden">
          <form onSubmit={handleSearch} className="flex flex-row items-center bg-[#1E1E1E] border border-[#2D2D2D] rounded-xl px-4 py-3 relative">
            <span className="material-symbols-outlined text-[#8E8E8E] mr-3">search</span>
            <input
              type="text"
              className="bg-transparent border-none flex-1 text-white placeholder-[#8E8E8E] focus:outline-none focus:ring-0 text-[15px]"
              placeholder="Search anime, characters, or studio..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="button" className="ml-2 flex items-center text-[#8E8E8E] hover:text-white transition-colors">
              <span className="material-symbols-outlined">tune</span>
            </button>
          </form>
        </div>

        <div className="mb-xl mt-4 sm:mt-0">
          <h1 className="font-display-lg text-[28px] sm:text-[36px] font-bold text-white mb-2">Search Results for "{q}"</h1>
          <p className="font-body-md text-[#8E8E8E]">{total} titles found</p>
        </div>

        {total === 0 && (
          <div className="text-center py-20 bg-[#1E1E1E] rounded-xl border border-[#2D2D2D]">
            <p className="font-headline-md text-[#8E8E8E] font-bold">No titles matched your search.</p>
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
                  key={t.id}
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
              <h2 className="font-headline-md text-[24px] font-bold text-[#8E8E8E] mb-xs">Asian Drama</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-gutter">
              {results.asia2tv.map(t => (
                <PosterCard 
                  key={t.id}
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

  // Recommended titles (just taking some from animewitcher)
  const recommended = animewitcher.slice(4, 8);
  const ratingMock = [4.9, 4.7, 4.8, 4.5];

  return (
    <div className="w-full max-w-[1200px] mx-auto min-h-[90vh] bg-[#101010] flex flex-col pt-4 px-4 sm:px-6 pb-24">
      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex flex-row items-center bg-[#1E1E1E] border border-[#2D2D2D] rounded-xl px-4 py-3 relative mb-8">
        <span className="material-symbols-outlined text-[#8E8E8E] mr-3">search</span>
        <input
          type="text"
          className="bg-transparent border-none flex-1 text-white placeholder-[#8E8E8E] focus:outline-none focus:ring-0 text-[15px] font-medium"
          placeholder="Search anime, characters, or studio..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="button" className="ml-2 flex items-center text-[#ec4a45] hover:text-[#ff4d4d] transition-colors">
          <span className="material-symbols-outlined">tune</span>
        </button>
      </form>

      {/* Popular Genres */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[20px] font-bold text-white tracking-wide">Popular Genres</h2>
          <Link to="/browse" className="text-[#ec4a45] text-[13px] font-bold hover:underline uppercase tracking-wide">
            EXPLORE ALL
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {['Action', 'Romance', 'Shonen', 'Cyberpunk', 'Seinen', 'Fantasy'].map(genre => (
            <button key={genre} className="bg-[#2a2a2e] hover:bg-[#3a3a3e] border border-[#3a3a3e] text-[#d4d4d4] px-5 py-2.5 rounded-full text-[14px] font-medium transition-colors cursor-pointer">
              {genre}
            </button>
          ))}
        </div>
      </section>

      {/* Recommended for You */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-bold text-white tracking-wide">Recommended for You</h2>
          <span className="material-symbols-outlined text-[#8E8E8E] text-[18px]">auto_awesome</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recommended.map((item, i) => (
            <Link to={`/title/animewitcher/${encodeURIComponent(item.id)}`} key={item.id} className="flex flex-col group block">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-[#2D2D2D] group-hover:border-[#ec4a45] transition-colors">
                <img src={item.poster || ''} alt={item.english_title || item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101010]/80 via-transparent to-transparent"></div>
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-[#2D2D2D] flex items-center gap-1 shadow-lg">
                  <Star className="w-[10px] h-[10px] fill-[#FACC15] text-[#FACC15]" />
                  <span className="text-[11px] font-bold text-white">{ratingMock[i % ratingMock.length]}</span>
                </div>
              </div>
              <h3 className="text-[14px] font-bold text-white leading-tight uppercase tracking-wide line-clamp-1">
                {item.english_title || item.name || 'UNKNOWN TITLE'}
              </h3>
              <p className="text-[12px] font-medium text-[#8E8E8E] mt-1 line-clamp-1">
                {item.type || 'Action'} • {new Date().getFullYear()}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Searches */}
      <section className="mb-8">
        <div className="bg-[#1E1E1E] rounded-xl p-5 border border-[#2D2D2D]">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[#ec4a45]">trending_up</span>
            <h2 className="text-[18px] font-bold text-white">Trending Searches</h2>
          </div>
          <div className="space-y-4">
            {[
              { rank: '01', title: 'Chainsaw Man: Reze Arc' },
              { rank: '02', title: 'Solo Leveling Season 2' },
              { rank: '03', title: 'Demon Slayer Infinity Castle' },
            ].map(trend => (
              <Link to={`/search?q=${encodeURIComponent(trend.title)}`} key={trend.rank} className="flex flex-row items-center group cursor-pointer">
                <span className="text-[18px] font-bold text-[#3a3a3e] group-hover:text-[#ec4a45] transition-colors mr-3 w-[26px]">{trend.rank}</span>
                <span className="text-[15px] font-medium text-[#d4d4d4] group-hover:text-white transition-colors">{trend.title}</span>
                <span className="material-symbols-outlined ml-auto text-[#4a4a4e] group-hover:text-[#d4d4d4] transition-colors text-[20px]">arrow_outward</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Season Hits */}
      <section className="mb-0">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#2a1215] to-[#120a0b] border border-[#3e1b1e] p-6 flex flex-row items-center min-h-[160px]">
          <div className="flex flex-col z-10 w-full md:w-[60%]">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-white tracking-wide mb-2">New Season Hits</h2>
            <p className="text-[#a38084] text-[13px] sm:text-[14px] leading-relaxed mb-4 max-w-[250px]">
              Discover the most anticipated releases of Winter 2024.
            </p>
            <Link to="/browse" className="self-start text-[#101010] font-bold text-[14px] bg-[#ff4d4d] hover:bg-[#ff6b6b] px-5 py-2.5 rounded-lg transition-colors">
              Explore Now
            </Link>
          </div>
          
          <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none translate-x-[20%] translate-y-[20%] flex items-center justify-center">
            {/* Using a large icon or image representing the clapperboard with stars like in the image */}
            <span className="material-symbols-outlined text-[140px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>movie</span>
          </div>
        </div>
      </section>

    </div>
  );
}

