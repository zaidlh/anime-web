import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEpisodeByNumber, SourceType } from '../lib/data';
import { decodeBase64Url } from '../lib/utils';
import { VideoPlayer } from '../components/VideoPlayer';
import { classifyServerUrl } from '../lib/servers';

export default function Watch() {
  const { source, id, episode } = useParams<{ source: string; id: string; episode: string }>();
  
  const decodedId = source === 'animewitcher' ? decodeURIComponent(id || '') : decodeBase64Url(id || '');
  
  const data = getEpisodeByNumber(source as SourceType, decodedId, episode || '');

  if (!data) {
     return (
      <div className="max-w-[1200px] mx-auto px-margin-edge py-xl">
        <div className="text-center p-lg bg-surface-container rounded-xl ghost-border">
          <h1 className="font-headline-md text-[24px] font-bold text-on-surface mb-sm">Episode Not Found</h1>
          <Link to={`/title/${source}/${encodeURIComponent(id || '')}`} className="text-secondary hover:underline">Return to Title</Link>
        </div>
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
    <div className="max-w-[1200px] mx-auto px-margin-edge py-lg">
      <VideoPlayer 
        servers={servers}
        poster={ep.thumb || title.poster}
        title={displayTitle}
        episodeName={epName}
        titleDetailUrl={titleDetailUrl}
        downloadUrl={downloadUrl}
        prevEpUrl={prevEp ? getEpUrl(prevEp) : null}
        nextEpUrl={nextEp ? getEpUrl(nextEp) : null}
      />
    </div>
  );
}
