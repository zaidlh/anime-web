import React from 'react';
import { Link } from 'react-router-dom';
import { SourceType } from '../lib/data';
import { encodeBase64Url } from '../lib/utils';
import { LazyImage } from './LazyImage';

interface PosterCardProps {
  key?: React.Key;
  id: string;
  source: SourceType;
  title: string;
  subtitle?: string | null;
  poster: string | null;
  type?: string | null;
  tags?: string[];
  episodeCount?: number;
  featured?: boolean;
}

export function PosterCard({ id, source, title, subtitle, poster, type, tags, episodeCount, featured }: PosterCardProps) {
  const encodedId = source === 'animewitcher' ? encodeURIComponent(id) : encodeBase64Url(id);
  const detailUrl = `/title/${source}/${encodedId}`;

  const isAnime = source === 'animewitcher';

  return (
    <Link to={detailUrl} className={`group relative block rounded-xl overflow-hidden transition-all duration-500 hover:scale-[1.02] shadow-lg hover:shadow-primary/10 hover:z-10 bg-surface-container animate-fade-in ${featured ? 'col-span-2 row-span-2' : ''}`}>
      <div className="relative w-full h-full aspect-[2/3]">
        {poster ? (
          <LazyImage src={poster} alt={title} containerClassName="w-full h-full" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container">
            <span className="material-symbols-outlined text-[48px] text-outline-variant">movie</span>
          </div>
        )}
        
        {/* Gradients */}
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500"></div>
        
        {/* Play Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-12 h-12 rounded-full glass flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500">
            <span className="material-symbols-outlined text-white text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end">
          {featured && (
             <div className="flex items-center gap-2 mb-1">
                <span className="text-yellow-500 flex items-center font-bold text-xs"><span className="material-symbols-outlined text-[14px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>9.8</span>
                <span className="bg-primary text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm tracking-wider">Masterpiece</span>
             </div>
          )}
          {!featured && (
            <h3 className="font-display-lg text-lg font-bold text-white line-clamp-2 leading-tight drop-shadow-md mb-1">{title}</h3>
          )}
          {featured && (
            <h3 className="font-display-lg text-2xl md:text-3xl font-black text-white line-clamp-2 leading-tight drop-shadow-md mb-2">{title}</h3>
          )}

          {!featured && (
             <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                <span className="text-yellow-500 flex items-center drop-shadow-md"><span className="material-symbols-outlined text-[14px] mr-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>8.{Math.floor(Math.random() * 9) + 1}</span>
                <span>{isAnime ? 'Anime' : 'Drama'}</span>
             </div>
          )}
          {featured && (
             <p className="text-sm font-medium text-white/80 line-clamp-2 leading-snug">
               Experience the thrilling narrative in stunning high-definition.
             </p>
          )}
        </div>

        {/* Type Badge Top Left */}
        {type && !featured && (
          <div className="absolute top-2 left-2 glass px-2 py-0.5 rounded-md">
            <span className="font-label-caps text-[9px] font-black uppercase text-primary tracking-widest">TOP RATED</span>
          </div>
        )}
      </div>
    </Link>
  );
}
