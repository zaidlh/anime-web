import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAllTitles } from '../lib/data';
import { PosterCard } from '../components/PosterCard';
import { SkeletonHero, SkeletonPosterGrid } from '../components/Skeleton';
import { useHistory } from '../lib/history';
import { SectionHeader } from '../components/SectionHeader';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const { animewitcher, asia2tv, loading } = useAllTitles();
  const { history } = useHistory();
  const [heroIndex, setHeroIndex] = useState(0);
  
  const trending = animewitcher.slice(0, 7);
  
  useEffect(() => {
    if (trending.length === 0) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % trending.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [trending.length]);

  if (loading) {
    return (
      <div className="w-full relative pb-xl">
        <SkeletonHero />
        <div className="px-4 md:px-margin-edge max-w-screen-2xl mx-auto flex flex-col gap-12">
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

  return (
    <div className="w-full relative pb-24 bg-black">
      {/* Hero Carousel */}
      <section className="relative w-full px-4 md:px-margin-edge pt-4 mb-8">
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-2xl overflow-hidden shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <img 
                src={trending[heroIndex]?.poster || ""} 
                className="w-full h-full object-cover"
                alt={trending[heroIndex]?.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-10">
                <h1 className="text-white text-xl md:text-4xl font-black drop-shadow-lg tracking-tight">
                  {trending[heroIndex]?.english_title || trending[heroIndex]?.name}
                </h1>
              </div>
            </motion.div>
          </AnimatePresence>
          
          <Link 
            to={trending[heroIndex] ? `/title/animewitcher/${encodeURIComponent(trending[heroIndex].id)}` : '#'}
            className="absolute inset-0 z-20"
          />
        </div>
        
        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {trending.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === heroIndex ? 'w-6 bg-primary' : 'w-1.5 bg-white/20'}`}
            />
          ))}
        </div>
      </section>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-margin-edge">
        
        {/* Continue Watching */}
        {continueWatchingItems.length > 0 && (
          <section className="mb-10">
            <SectionHeader title="Continue Watching" viewAllUrl="/mylist" />
            <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0">
              {continueWatchingItems.map((item: any, idx) => {
                const titleData = [...animewitcher, ...asia2tv].find((t: any) => String(t.id) === String(item.titleId));
                const titleName = titleData ? (item.source === 'animewitcher' ? ((titleData as any).english_title || (titleData as any).name) : (titleData as any).title) : "Unknown Title";
                const poster = (titleData as any)?.poster || null;
                const thumb = (titleData as any)?.thumb || null;

                return (
                  <Link 
                    key={idx} 
                    to={`/watch/${item.source}/${encodeURIComponent(item.titleId)}/${item.epId}`} 
                    className="shrink-0 w-[280px] md:w-[340px] bg-surface-container-low rounded-xl overflow-hidden flex items-center p-2 gap-3 border border-white/5 hover:border-white/10 transition-all shadow-lg"
                  >
                    <div className="w-[100px] aspect-video rounded-lg overflow-hidden shrink-0 bg-black">
                      <img src={thumb || poster || ""} alt={titleName} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-sm font-bold text-white truncate mb-1">{titleName}</h3>
                      <p className="text-[11px] text-on-surface-variant font-medium mb-2">Episode {item.epId}</p>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${item.duration > 0 ? (item.time / item.duration) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Latest Updates */}
        <section className="mb-10">
          <SectionHeader title="Latest Updates" viewAllUrl="/browse/animewitcher" />
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-6">
            {animes.slice(0, 6).map(t => (
              <PosterCard 
                key={t.id}
                id={t.id}
                source="animewitcher"
                title={t.english_title || t.name}
                poster={t.poster}
                type="Anime"
                tags={t.tags}
                episodeCount={t.episodes?.length}
                badge={t.episodes?.length ? `Ep ${t.episodes.length}` : undefined}
                badgeColor="bg-primary"
                showTime={true}
              />
            ))}
          </div>
        </section>

        {/* Most Watched */}
        <section className="mb-10">
          <SectionHeader title="Most Watched Anime" viewAllUrl="/browse/animewitcher" />
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-6">
            {animes.slice(6, 12).map(t => (
              <PosterCard 
                key={t.id}
                id={t.id}
                source="animewitcher"
                title={t.english_title || t.name}
                poster={t.poster}
                type="Series"
                showYear={true}
                year="2024"
              />
            ))}
          </div>
        </section>

        {/* Latest Added */}
        <section className="mb-10">
          <SectionHeader title="Latest Added Works" viewAllUrl="/browse/asia2tv" />
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-6">
            {dramas.slice(0, 6).map(t => (
              <PosterCard 
                key={t.id}
                id={t.id}
                source="asia2tv"
                title={t.title}
                poster={t.poster}
                type="Drama"
                showYear={true}
                year="2025"
              />
            ))}
          </div>
        </section>

        {/* Latest News */}
        <section className="mb-10">
          <SectionHeader title="Latest News" />
          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0">
            {[
              {
                title: "MAPPA Studio reveals new project",
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDm2YLCxtMp-83E8KVftRDE138d50-Jrf7UlILOwSpeNDL4Newi94OPQwAhIPOGhLV9Mj_DfuMMxcv5CNwnEdt8Ghx1AUUheXsL4_HtQIWadeR1M9UFeRaKoWRYQGQXyWidKsTNTpH73IKZ2aCAWEpltnaDQBIFAKCmYDLwSWBrBXM5k7f1NcZ_TqzLbgVwIzxeTjHRZUNpfp45tf6VYcUnHzDr9A8pUN535YwpnJrJCRQNcYX7oOZoQxfxG9WMu4iv3MeJ4EXFKkw",
                time: "2 hours ago"
              },
              {
                title: "Tank Chair Anime PV Released",
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDm2YLCxtMp-83E8KVftRDE138d50-Jrf7UlILOwSpeNDL4Newi94OPQwAhIPOGhLV9Mj_DfuMMxcv5CNwnEdt8Ghx1AUUheXsL4_HtQIWadeR1M9UFeRaKoWRYQGQXyWidKsTNTpH73IKZ2aCAWEpltnaDQBIFAKCmYDLwSWBrBXM5k7f1NcZ_TqzLbgVwIzxeTjHRZUNpfp45tf6VYcUnHzDr9A8pUN535YwpnJrJCRQNcYX7oOZoQxfxG9WMu4iv3MeJ4EXFKkw",
                time: "4 hours ago"
              }
            ].map((news, i) => (
              <div key={i} className="shrink-0 w-[300px] md:w-[400px] group cursor-pointer">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-surface-container shadow-lg border border-white/5 group-hover:border-primary/50 transition-all">
                  <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <span className="material-symbols-outlined text-white text-[16px]">chat</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <span className="material-symbols-outlined text-white text-[16px]">link</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-primary transition-colors mb-1">{news.title}</h3>
                <p className="text-[11px] text-on-surface-variant/60 font-medium">{news.time}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
