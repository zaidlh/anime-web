import React, { useMemo, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEpisodeByNumber, SourceType } from '../lib/data';
import { decodeBase64Url, safeDecodeURIComponent } from '../lib/utils';
import { VideoPlayer } from '../components/VideoPlayer';
import { classifyServerUrl } from '../servers';
import { useHistory, saveHistoryItem } from '../lib/history';
import { ToastProvider } from '../components/Toast';

import { SkeletonHero } from '../components/Skeleton';

export default function Watch() {
  const { source, id, episode } = useParams<{ source: string; id: string; episode: string }>();
  const navigate = useNavigate();
  const { markCompleted, history } = useHistory();
  
  const decodedId = source === 'animewitcher' ? safeDecodeURIComponent(id || '') : decodeBase64Url(id || '');
  
  const data = useEpisodeByNumber(source as SourceType, decodedId, episode || '');

  const initialTime = useMemo(() => {
    if (!data || !data.title || !data.episode) return 0;
    const epId = source === 'animewitcher' ? (data.episode.doc_id || data.episode.number) : data.episode.number;
    const key = `${source}_${decodedId}_${epId}`;
    return history[key]?.time || 0;
  }, [data, source, decodedId, history]);

  useEffect(() => {
    if (data && data.title && data.episode) {
      const epId = source === 'animewitcher' ? (data.episode.doc_id || data.episode.number) : data.episode.number;
      const key = `${source}_${decodedId}_${epId}`;
      const existing = history[key];
      
      saveHistoryItem({
        source: source as string,
        titleId: decodedId,
        epId: epId,
        time: existing?.time || 0,
        duration: existing?.duration || 0,
        completed: false
      });
    }
  }, [data, source, decodedId]);

  if (data?.loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-margin-edge py-lg">
        <SkeletonHero />
      </div>
    );
  }

  if (!data || !data.title) {
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
    return rawServers.map((s: any) => classifyServerUrl(s.link || s.url || '', s.name, s.quality || null));
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

  const handleEnded = () => {
    const epId = source === 'animewitcher' ? (ep.doc_id || ep.number) : ep.number;
    markCompleted(source as string, decodedId, epId);
    if (nextEp) {
      navigate(getEpUrl(nextEp));
    }
  };

  const timeUpdateRef = useRef<{time: number, nextSaveTime: number}>({ time: 0, nextSaveTime: 0 });

  const handleTimeUpdate = (time: number, duration: number) => {
    // Save every 5 seconds to avoid localStorage spam
    if (time > timeUpdateRef.current.nextSaveTime || time < timeUpdateRef.current.nextSaveTime - 10) {
      timeUpdateRef.current.nextSaveTime = time + 5;
      const epId = source === 'animewitcher' ? (ep.doc_id || ep.number) : ep.number;
      saveHistoryItem({
        source: source as string,
        titleId: decodedId,
        epId: epId,
        time: time,
        duration: duration,
        completed: false
      });
    }
  };

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
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        initialTime={initialTime}
      />
    </div>
  );
}
