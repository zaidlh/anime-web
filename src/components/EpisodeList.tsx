import React from 'react';
import { Link } from 'react-router-dom';
import { AnimeWitcherEpisode, Asia2TVEpisode, ServerInfo, SourceType } from '../lib/data';
import { classifyServerUrl } from '../servers';
import { encodeBase64Url } from '../lib/utils';

interface EpisodeListProps {
  source: SourceType;
  titleId: string;
  episodes: (AnimeWitcherEpisode | Asia2TVEpisode)[];
}

export function EpisodeList({ source, titleId, episodes }: EpisodeListProps) {
  const encId = source === 'animewitcher' ? encodeURIComponent(titleId) : encodeBase64Url(titleId);

  return (
    <section className="mt-8 md:mt-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <h3 className="font-display-lg text-[24px] md:text-[32px] font-bold text-on-surface">Episodes</h3>
            <div className="bg-surface-container-high px-3 py-1 rounded-full flex items-center gap-2 cursor-pointer hover:bg-surface-variant transition-colors border border-outline">
              <span className="font-title-sm text-sm font-semibold">Season 1</span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </div>
          </div>
          <p className="font-title-sm text-xs text-on-surface-variant tracking-widest font-bold uppercase">{episodes.length} EPISODES AVAILABLE</p>
        </div>
        
        <Link 
          to={`/download/${source}/${encId}`}
          className="bg-surface-container border border-outline px-4 py-2 rounded-full text-label-caps text-on-surface-variant hover:text-white hover:bg-surface-variant transition-colors uppercase font-bold text-xs flex items-center gap-2 w-fit"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          Batch Download
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
        {episodes.map((ep: any, idx) => {
          const num = ep.number;
          const name = ep.name || `Episode ${num}`;
          const serversInfo: ServerInfo[] = ep.servers || [];
          const classified = serversInfo.map((s: any) => classifyServerUrl(s.link || s.url || '', s.name, s.quality || null));
          const downlodableServers = classified.filter(c => c.capability === 'native' && c.directUrl);

          const epId = source === 'animewitcher' ? (ep.doc_id || num) : num;
          const watchUrl = `/watch/${source}/${encId}/${epId}`;

          return (
            <Link key={idx} to={watchUrl} className="group flex flex-col gap-3">
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-surface-container-high relative border border-transparent group-hover:border-outline transition-colors shadow-lg">
                {source === 'animewitcher' && ep.thumb ? (
                  <img src={ep.thumb} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                   <div className="w-full h-full bg-surface-container flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <span className="material-symbols-outlined text-outline-variant text-[48px]">movie</span>
                   </div>
                )}
                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
                  24m
                </div>
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                   <span className="material-symbols-outlined text-white text-[48px] drop-shadow-lg" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                </div>
                {/* Progress bar simulation for "Continue Watching" feel */}
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/20">
                  {idx === 0 && <div className="h-full bg-primary w-1/3"></div>}
                </div>
              </div>
              
              <div className="flex flex-col">
                <h4 className="font-title-sm text-[16px] md:text-[18px] font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                  {num}. {name}
                </h4>
                <p className="font-body-md text-sm text-on-surface-variant line-clamp-2 mt-1">
                  {/* We don't have episode descriptions in the data schema, so we use a fallback or show quality tags */}
                  {classified.filter(c => c.quality).slice(0, 3).map(c => c.quality).join(' • ') || 'Standard Definition'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      
      {episodes.length === 0 && (
        <div className="p-12 text-center text-on-surface-variant bg-surface-container-low rounded-xl border border-outline">
          No episodes found.
        </div>
      )}
    </section>
  );
}
