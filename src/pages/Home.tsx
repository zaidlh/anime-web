import React from 'react';
import { Link } from 'react-router-dom';
import { useAllTitles } from '../lib/data';
import { PosterCard } from '../components/PosterCard';

export default function Home() {
  const { animewitcher, asia2tv, loading } = useAllTitles();
  
  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const animes = animewitcher.slice(0, 12);
  const dramas = asia2tv.slice(0, 12);
  
  // We'll use the first anime as the "Continue Watching" item
  const continueWatchingItems = animes.slice(0, 3);

  // We'll use the first drama as the featured top rated item
  const featuredItem = dramas[0];
  const topRatedItems = dramas.slice(1, 5);

  return (
    <div className="w-full relative pb-12">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] sm:h-[85vh] md:h-[90vh] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src={continueWatchingItems[0]?.poster || "https://lh3.googleusercontent.com/aida-public/AB6AXuDm2YLCxtMp-83E8KVftRDE138d50-Jrf7UlILOwSpeNDL4Newi94OPQwAhIPOGhLV9Mj_DfuMMxcv5CNwnEdt8Ghx1AUUheXsL4_HtQIWadeR1M9UFeRaKoWRYQGQXyWidKsTNTpH73IKZ2aCAWEpltnaDQBIFAKCmYDLwSWBrBXM5k7f1NcZ_TqzLbgVwIzxeTjHRZUNpfp45tf6VYcUnHzDr9A8pUN535YwpnJrJCRQNcYX7oOZoQxfxG9WMu4iv3MeJ4EXFKkw"}
            className="w-full h-full object-cover object-top md:object-center opacity-80 mix-blend-lighten"
            alt="Hero background" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent md:w-3/4"></div>
        </div>

        <div className="relative z-10 px-4 md:px-margin-edge w-full max-w-screen-2xl mx-auto pb-6 md:pb-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
              <span className="bg-primary text-white px-2 py-0.5 rounded-sm font-label-caps text-[9px] md:text-[10px] uppercase tracking-widest font-bold shadow-[0_0_10px_rgba(255,77,77,0.4)]">
                Trending #1
              </span>
              <span className="text-white/80 font-title-sm text-[10px] md:text-xs font-semibold tracking-wide">
                • Season 4 Available
              </span>
            </div>
            
            <h1 className="font-display-lg text-[24px] sm:text-[40px] md:text-[64px] font-black mb-2 md:mb-4 leading-[1.1] text-white drop-shadow-xl tracking-tighter line-clamp-2 md:line-clamp-none">
              {continueWatchingItems[0]?.english_title || continueWatchingItems[0]?.name || "Cyber:\nRebirth\nProject"}
            </h1>
            
            <p className="font-body-md text-xs sm:text-base md:text-lg text-white/90 mb-4 md:mb-8 max-w-[36rem] drop-shadow-md line-clamp-2 md:line-clamp-none">
              In a world where memories can be digitised, one rogue hacker discovers a truth that threatens the very fabric of Neo-Tokyo.
            </p>
            
            <div className="flex flex-row gap-3 md:gap-4">
              <Link 
                to={`/title/animewitcher/${encodeURIComponent(continueWatchingItems[0]?.id || '')}`}
                className="bg-primary text-black px-4 md:px-8 py-2 md:py-3 rounded-full font-title-sm text-xs md:text-sm flex items-center justify-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,77,77,0.3)] font-bold tracking-wide w-auto whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[18px] md:text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                Watch Now
              </Link>
              <button 
                className="bg-surface-container/60 backdrop-blur-md border border-white/10 text-white px-4 md:px-8 py-2 md:py-3 rounded-full font-title-sm text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors active:scale-95 font-bold tracking-wide w-auto whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[18px] md:text-[20px]">add</span>
                My List
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-4 mt-8 flex-wrap">
              <span className="bg-primary/20 text-primary border border-primary/30 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase">
                All Genres
              </span>
              <span className="bg-surface-container-high/50 text-white border border-white/10 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase">
                Action
              </span>
              <span className="bg-surface-container-high/50 text-white border border-white/10 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase">
                Fantasy
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-screen-2xl mx-auto px-margin-edge">
        
        {/* Continue Watching */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="font-display-lg text-[22px] md:text-[28px] font-bold text-white tracking-tight">Continue Watching</h2>
            <Link to="/mylist" className="text-primary font-title-sm hover:underline flex items-center gap-1 text-sm font-semibold">
              View All <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          </div>
          
          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 -mx-margin-edge px-margin-edge md:mx-0 md:px-0">
            {continueWatchingItems.map((item, idx) => {
              const randomWidth = Math.random() * 60 + 20;
              const randomTime = Math.floor(Math.random() * 15 + 5);

              return (
                <Link 
                  key={idx} 
                  to={`/title/animewitcher/${encodeURIComponent(item.id)}`} 
                  className="shrink-0 w-[240px] md:w-[320px] group flex flex-col gap-3"
                >
                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-surface-container relative border border-transparent group-hover:border-outline transition-colors shadow-lg">
                    {item.episodes[0]?.thumb ? (
                       <img src={item.episodes[0].thumb} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : item.poster ? (
                       <img src={item.poster} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-high">
                         <span className="material-symbols-outlined text-[32px] text-outline-variant">movie</span>
                       </div>
                    )}
                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/20">
                      <div className="h-full bg-primary" style={{ width: `${randomWidth}%` }}></div>
                    </div>
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <span className="material-symbols-outlined text-white text-[48px] drop-shadow-lg" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-title-sm text-[16px] font-bold text-white line-clamp-1">{item.english_title || item.name}</h3>
                    <p className="font-body-md text-xs text-on-surface-variant flex items-center justify-between mt-1">
                      <span>S1 : E{idx + 1}</span>
                      <span>{randomTime}:45 left</span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Top Rated Series */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="font-display-lg text-[22px] md:text-[28px] font-bold text-white tracking-tight">Top Rated Series</h2>
            <Link to="/browse" className="text-on-surface-variant hover:text-white transition-colors">
              <span className="material-symbols-outlined">grid_view</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featuredItem && (
               <PosterCard 
                 key={featuredItem.id}
                 id={featuredItem.id}
                 source="asia2tv"
                 title={featuredItem.title}
                 poster={featuredItem.poster}
                 type="Drama"
                 tags={featuredItem.tags}
                 episodeCount={featuredItem.episodes?.length}
                 featured={true}
               />
            )}
            
            {topRatedItems.map(t => (
              <PosterCard 
                key={t.id}
                id={t.id}
                source="asia2tv"
                title={t.title}
                poster={t.poster}
                type="Drama"
                tags={t.tags}
                episodeCount={t.episodes?.length}
              />
            ))}
            {animes.slice(3, 7).map(t => (
              <PosterCard 
                key={t.id}
                id={t.id}
                source="animewitcher"
                title={t.english_title || t.name}
                poster={t.poster}
                type="Anime"
                tags={t.tags}
                episodeCount={t.episodes?.length}
              />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
