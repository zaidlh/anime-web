import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { SourceType } from '../lib/data';
import { encodeBase64Url } from '../lib/utils';

interface PosterCardProps {
  id: string;
  source: SourceType;
  title: string;
  poster: string | null;
  type?: string | null;
  tags?: string[];
  episodeCount?: number;
  featured?: boolean;
  badge?: string;
  badgeColor?: string;
  showTime?: boolean;
  showYear?: boolean;
  year?: string;
}

export function PosterCard({ 
  id, 
  source, 
  title, 
  poster, 
  type, 
  badge, 
  badgeColor = "bg-primary",
  showTime = false,
  showYear = false,
  year
}: PosterCardProps) {
  const encodedId = source === 'animewitcher' ? encodeURIComponent(id) : encodeBase64Url(id);
  const detailUrl = `/title/${source}/${encodedId}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex flex-col group cursor-pointer"
    >
      <Link to={detailUrl} className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 bg-surface-container shadow-lg border border-white/5 group-hover:border-primary/50 transition-all duration-300">
        {poster ? (
          <img 
            src={poster} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container-high">
            <span className="material-symbols-outlined text-[32px] text-outline-variant">movie</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        {badge && (
          <div className={`absolute bottom-2 right-2 ${badgeColor} text-black px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter z-10 shadow-lg`}>
            {badge}
          </div>
        )}

        {showYear && year && (
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-bold z-10 border border-white/10">
            {year}
          </div>
        )}
      </Link>
      
      <div className="flex flex-col gap-0.5 px-1">
        <h3 className="text-[13px] md:text-[14px] font-bold text-white line-clamp-1 group-hover:text-primary transition-colors leading-tight">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-[11px] text-on-surface-variant font-medium">
            {type || (source === 'animewitcher' ? 'Anime' : 'Drama')}
          </p>
          {showTime && (
            <p className="text-[10px] text-on-surface-variant/60 font-medium">
              36 mins ago
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
