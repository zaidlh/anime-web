import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEpisodeByNumber, SourceType } from '../lib/data';
import { decodeBase64Url } from '../lib/utils';
import { VideoPlayer } from '../components/VideoPlayer';
import { classifyServerUrl } from '../lib/servers';
import { ChevronLeft, ChevronRight, List, Download } from 'lucide-react';

export default function Watch() {
  const { source, id, episode } = useParams<{ source: string; id: string; episode: string }>();
  
  const decodedId = source === 'animewitcher' ? decodeURIComponent(id || '') : decodeBase64Url(id || '');
  
  const data = getEpisodeByNumber(source as SourceType, decodedId, episode || '');

  if (!data) {
     return (
      <div className="max-w-4xl mx-auto mt-20 text-center p-8 bg-[#1a1a1a] rounded-lg border border-[#262626]">
        <h1 className="text-2xl font-bold text-white mb-4">Episode Not Found</h1>
        <Link to={`/title/${source}/${encodeURIComponent(id || '')}`} className="text-blue-500 hover:underline">Return to Title</Link>
      </div>
    );
  }

  const { title, episode: ep, index } = data;
  
  const displayTitle = source === 'animewitcher' ? (title.english_title || title.name) : title.title;
  const epName = ep.name || `Episode ${ep.number}`;

  const servers = useMemo(() => {
    const rawServers = ep.servers || [];
    return rawServers.map((s: any) => classifyServerUrl(s.link || s.url || '', s.name));
  }, [ep.servers]);

  const allEpisodes = title.episodes;
  const prevEp = index > 0 ? allEpisodes[index - 1] : null;
  const nextEp = index < allEpisodes.length - 1 ? allEpisodes[index + 1] : null;

  const getEpUrl = (targetEp: any) => {
    const epId = source === 'animewitcher' ? (targetEp.doc_id || targetEp.number) : targetEp.number;
    return `/watch/${source}/${encodeURIComponent(id || '')}/${epId}`;
  };

  const titleDetailUrl = `/title/${source}/${encodeURIComponent(id || '')}`;
  const downloadUrl = `/download/${source}/${encodeURIComponent(id || '')}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <Link to={titleDetailUrl} className="hover:text-white line-clamp-1">{displayTitle}</Link>
        <span>/</span>
        <span className="text-blue-400 font-medium">Ep {ep.number}</span>
      </div>

      <VideoPlayer 
        servers={servers}
        poster={ep.thumb || title.poster}
        title={displayTitle}
        episodeName={epName}
      />

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <Link
            to={prevEp ? getEpUrl(prevEp) : '#'}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              prevEp ? 'bg-[#262626] hover:bg-[#333] text-white' : 'bg-[#1a1a1a] text-[#555] cursor-not-allowed border border-[#262626]'
            }`}
            onClick={(e) => !prevEp && e.preventDefault()}
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </Link>
          
          <Link
            to={titleDetailUrl}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm bg-[#262626] hover:bg-[#333] text-white transition-colors"
          >
            <List className="w-4 h-4" /> <span className="hidden sm:inline">Episode List</span>
          </Link>

          <Link
            to={nextEp ? getEpUrl(nextEp) : '#'}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              nextEp ? 'bg-[#262626] hover:bg-[#333] text-white' : 'bg-[#1a1a1a] text-[#555] cursor-not-allowed border border-[#262626]'
            }`}
            onClick={(e) => !nextEp && e.preventDefault()}
          >
            Next <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <Link
          to={downloadUrl}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600 hover:text-white rounded-md font-medium text-sm transition-colors w-full sm:w-auto justify-center"
        >
          <Download className="w-4 h-4" /> Bulk Download Options
        </Link>
      </div>
    </div>
  );
}
