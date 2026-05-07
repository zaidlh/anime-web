import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Download, ExternalLink } from 'lucide-react';
import { 
  AnimeWitcherEpisode, 
  Asia2TVEpisode, 
  ServerInfo, 
  SourceType 
} from '../lib/data';
import { classifyServerUrl } from '../lib/servers';
import { encodeBase64Url } from '../lib/utils';
import { PlaceholderImage } from './PlaceholderImage';

interface EpisodeListProps {
  source: SourceType;
  titleId: string;
  episodes: (AnimeWitcherEpisode | Asia2TVEpisode)[];
}

export function EpisodeList({ source, titleId, episodes }: EpisodeListProps) {
  const encId = source === 'animewitcher' ? encodeURIComponent(titleId) : encodeBase64Url(titleId);

  return (
    <div className="bg-[#1a1a1a] rounded-lg border border-[#262626] overflow-hidden">
      <div className="p-4 border-b border-[#262626] flex justify-between items-center">
        <h3 className="font-semibold text-lg text-white">Episodes ({episodes.length})</h3>
        <Link 
          to={`/download/${source}/${encId}`}
          className="text-emerald-500 hover:text-emerald-400 text-sm font-medium flex items-center gap-1"
        >
          <Download className="w-4 h-4" /> Bulk Download
        </Link>
      </div>

      <div className="divide-y divide-[#262626] max-h-[600px] overflow-y-auto">
        {episodes.map((ep: any, idx) => {
          const num = ep.number;
          const name = ep.name || `Episode ${num}`;
          const serversInfo: ServerInfo[] = ep.servers || [];
          const classified = serversInfo.map(s => 
            classifyServerUrl(s.link || s.url || '', s.name)
          );

          const hasPlayable = classified.some(c => c.capability !== 'external');
          const downlodableServers = classified.filter(c => c.capability === 'native' && c.directUrl);

          const epId = source === 'animewitcher' ? (ep.doc_id || num) : num;
          const watchUrl = `/watch/${source}/${encId}/${epId}`;

          return (
            <div key={idx} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-[#141414] transition-colors">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-8 font-mono text-gray-500 text-right">{num}</div>
                {source === 'animewitcher' && ep.thumb && (
                  <div className="w-24 h-14 bg-black rounded overflow-hidden flex-shrink-0">
                    <img src={ep.thumb} alt={name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-200">{name}</h4>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {classified.filter(c => c.quality).map((c, i) => (
                      <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        c.quality?.includes('1080') ? 'bg-blue-500/20 text-blue-400' :
                        c.quality?.includes('720') ? 'bg-green-500/20 text-green-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {c.quality}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto ml-12 sm:ml-0">
                {hasPlayable ? (
                  <Link
                    to={watchUrl}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" fill="currentColor" /> Play
                  </Link>
                ) : (
                  <button disabled className="flex items-center gap-1.5 bg-[#262626] text-gray-500 cursor-not-allowed px-3 py-1.5 rounded text-sm font-medium" title="No direct stream available">
                    <Play className="w-3.5 h-3.5" /> Play
                  </button>
                )}

                {downlodableServers.length > 0 ? (
                  <a
                    href={downlodableServers[0].directUrl as string}
                    download
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> 
                    {downlodableServers.length > 1 ? `DL (${downlodableServers.length})` : 'DL'}
                  </a>
                ) : (
                  <button disabled className="flex items-center gap-1.5 bg-[#262626] text-gray-500 cursor-not-allowed px-3 py-1.5 rounded text-sm font-medium" title="Download not available">
                    <Download className="w-3.5 h-3.5" /> DL
                  </button>
                )}

                {ep.url && (
                  <a 
                    href={ep.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-white bg-[#262626] hover:bg-[#333] rounded transition-colors"
                    title="Open source page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
        {episodes.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">No episodes indexed.</div>
        )}
      </div>
    </div>
  );
}
