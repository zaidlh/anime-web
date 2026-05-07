import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Download } from 'lucide-react';
import { PlaceholderImage } from './PlaceholderImage';
import { SourceType } from '../lib/data';
import { encodeBase64Url } from '../lib/utils';

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
}

export function PosterCard({ id, source, title, subtitle, poster, type, tags, episodeCount }: PosterCardProps) {
  const encodedId = source === 'animewitcher' ? encodeURIComponent(id) : encodeBase64Url(id);
  const detailUrl = `/title/${source}/${encodedId}`;
  const watchUrl = episodeCount === 1 ? `/watch/${source}/${encodedId}/1` : detailUrl;
  const downloadUrl = `/download/${source}/${encodedId}`;

  return (
    <div className="group relative rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#262626] transition-transform hover:-translate-y-1">
      <div className="aspect-[2/3] relative">
        {poster ? (
          <img src={poster} alt={title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <PlaceholderImage className="w-full h-full" />
        )}
        
        {/* Type Badge */}
        {type && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-sm font-medium shadow-md">
            {type}
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
          <Link 
            to={watchUrl}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            <Play className="w-4 h-4" fill="currentColor" /> Watch
          </Link>
          <Link 
            to={downloadUrl}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Download
          </Link>
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1 text-[#e5e5e5]" title={title}>{title}</h3>
        {subtitle && <p className="text-xs text-[#a3a3a3] line-clamp-1 mt-0.5">{subtitle}</p>}
        {tags && tags.length > 0 && (
          <p className="text-[10px] text-blue-400 mt-1.5 line-clamp-1">{tags.join(' • ')}</p>
        )}
      </div>
    </div>
  );
}
