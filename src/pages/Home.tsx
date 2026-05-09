import React from 'react';
import { Link } from 'react-router-dom';
import { useAllTitles } from '../lib/data';
import { PosterCard } from '../components/PosterCard';
import { SkeletonHero, SkeletonPosterGrid } from '../components/Skeleton';
import { useHistory } from '../lib/history';
import { useRecentlyViewed } from '../lib/recent';

export default function Home() {
  const { animewitcher, asia2tv, loading } = useAllTitles();
  const { history } = useHistory();
  const { recent } = useRecentlyViewed();
  
  if (loading) {
    return (
      <div className="w-full relative pb-xl">
        <SkeletonHero />
        <div className="px-margin-edge max-w-screen-2xl mx-auto flex flex-col gap-12">
          <SkeletonPosterGrid count={6} />
          <SkeletonPosterGrid count={12} />
        </div>
      </div>
    );
  }

  const animes = animewitcher.slice(0, 12);
  const dramas = asia2tv.slice(0, 12);
  
  const historyItems = Object.values(history).sort((a, b) => b.updatedAt - a.updatedAt).filter(i => !i.completed);
  const continueWatchingItems = historyItems.slice(0, 6);
  const heroItem = animes[0];

  // We'll use the first drama as the featured top rated item
  const featuredItem = dramas[0];
  const topRatedItems = dramas.slice(1, 5);

  return (
    <div className="w-full relative pb-12">
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] md:h-[90vh] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src={heroItem?.poster || "https://lh3.googleusercontent.com/aida-public/AB6AXuDm2YLCxtMp-83E8KVftRDE138d50-Jrf7UlILOwSpeNDL4Newi94OPQwAhIPOGhLV9Mj_DfuMMxcv5CNwnEdt8Ghx1AUUheXsL4_HtQIWadeR1M9UFeRaKoWRYQGQXyWidKsTNTpH73IKZ2aCAWEpltnaDQBIFAKCmYDLwSWBrBXM5k7f1NcZ_TqzLbgVwIzxeTjHRZUNpfp45tf6VYcUnHzDr9A8pUN535YwpnJrJCRQNcYX7oOZoQxfxG9WMu4iv3MeJ4EXFKkw"}
            className="w-full h-full object-cover object-top md:object-center opacity-80 mix-blend-lighten"
            alt="Hero background" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent md:w-3/4"></div>
        </div>

        <div className="relative z-10 px-margin-edge w-full max-w-screen-2xl mx-auto pb-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary text-white px-2 py-0.5 rounded-sm font-label-caps text-[10px] uppercase tracking-widest font-bold shadow-[0_0_10px_rgba(255,77,77,0.4)]">
                Trending #1
              </span>
              <span className="text-white/80 font-title-sm text-xs font-semibold tracking-wide">
                • Available Now
              </span>
            </div>
            
            <h1 className="font-display-lg text-[28px] sm:text-[40px] md:text-[64px] font-black mb-4 leading-[1.1] text-white drop-shadow-xl tracking-tighter line-clamp-3 md:line-clamp-none">
              {(heroItem as any)?.english_title || (heroItem as any)?.name || "Welcome to Animax"}
            </h1>
            
            <p className="font-body-md text-sm sm:text-base md:text-lg text-white/90 mb-8 max-w-[36rem] drop-shadow-md">
              {(heroItem as any)?.story || "Explore a massive collection of anime, dramas, and entertainment without limits."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to={heroItem ? `/title/animewitcher/${encodeURIComponent((heroItem as any).id)}` : '#'}
                className="bg-primary text-black px-8 py-3 rounded-full font-title-sm text-sm flex items-center justify-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,77,77,0.3)] font-bold tracking-wide w-auto whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                Watch Now
              </Link>
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
            {continueWatchingItems.map((item: any, idx) => {
              const titleData = [...animewitcher, ...asia2tv].find((t: any) => String(t.id) === String(item.titleId));
              const titleName = titleData ? (item.source === 'animewitcher' ? ((titleData as any).english_title || (titleData as any).name) : (titleData as any).title) : "Unknown Title";
              const poster = (titleData as any)?.poster || null;
              const thumb = (titleData as any)?.thumb || null;

              return (
                <Link 
                  key={idx} 
                  to={`/watch/${item.source}/${encodeURIComponent(item.titleId)}/${item.epId}`} 
                  className="shrink-0 w-[240px] md:w-[320px] group flex flex-col gap-3"
                >
                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-surface-container relative border border-transparent group-hover:border-outline transition-colors shadow-lg">
                    {thumb ? (
                       <img src={thumb} alt={titleName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : poster ? (
                       <img src={poster} alt={titleName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-high">
                         <span className="material-symbols-outlined text-[32px] text-outline-variant">movie</span>
                       </div>
                    )}
                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/20">
                      <div className="h-full bg-primary" style={{ width: `${item.duration > 0 ? (item.time / item.duration) * 100 : 0}%` }}></div>
                    </div>
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <span className="material-symbols-outlined text-white text-[48px] drop-shadow-lg" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-title-sm text-[16px] font-bold text-white line-clamp-1">{titleName}</h3>
                    <p className="font-body-md text-xs text-on-surface-variant flex items-center justify-between mt-1">
                      <span>Episode {item.epId}</span>
                      {item.duration > 0 && item.time > 0 && (
                        <span>{Math.max(1, Math.floor((item.duration - item.time) / 60))}m left</span>
                      )}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recently Viewed Strip */}
        {recent.length > 0 && (
          <section className="mb-12">
            <div className="flex justify-between items-end mb-6">
              <h2 className="font-display-lg text-[22px] md:text-[28px] font-bold text-white tracking-tight">Recently Viewed</h2>
            </div>
            <div className="flex overflow-x-auto no-scrollbar gap-gutter pb-4 -mx-margin-edge px-margin-edge md:mx-0 md:px-0">
              {recent.map((r, i) => (
                <div key={i} className="w-[120px] sm:w-[140px] md:w-[160px] lg:w-[180px] shrink-0">
                  <PosterCard 
                    id={r.id as any} 
                    source={r.source} 
                    title={r.title} 
                    poster={r.poster} 
                    type={r.type as string | undefined} 
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Top Rated Series */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="font-display-lg text-[22px] md:text-[28px] font-bold text-white tracking-tight">Top Rated Series</h2>
            <button className="text-on-surface-variant hover:text-white transition-colors">
              <span className="material-symbols-outlined">grid_view</span>
            </button>
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
