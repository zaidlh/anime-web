import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTitleById, SourceType } from '../lib/data';
import { decodeBase64Url } from '../lib/utils';
import { BulkDownloadManager } from '../components/BulkDownloadManager';

export default function Download() {
  const { source, id } = useParams<{ source: string; id: string }>();
  
  const decodedId = source === 'animewitcher' ? decodeURIComponent(id || '') : decodeBase64Url(id || '');
  const { title, loading } = useTitleById(source as SourceType, decodedId);

  if (loading) {
    return (
      <div className="w-full h-[70vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!title) {
    return (
      <div className="max-w-[1200px] mx-auto px-margin-edge py-xl">
        <div className="text-center p-lg bg-surface-container rounded-xl ghost-border">
          <h1 className="font-headline-md text-[24px] font-bold text-on-surface mb-sm">Title Not Found</h1>
          <Link to="/" className="text-secondary hover:underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  const isAnime = source === 'animewitcher';
  const t = title as any;
  const displayTitle = isAnime ? (t.english_title || t.name) : t.title;

  return (
    <div className="max-w-[1200px] mx-auto px-margin-edge py-lg">
      <div className="mb-sm">
        <Link to={`/title/${source}/${encodeURIComponent(id || '')}`} className="text-secondary font-title-sm hover:underline flex items-center gap-xs font-bold w-fit">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to {displayTitle}
        </Link>
      </div>

      <BulkDownloadManager 
        source={source as SourceType}
        seriesTitle={displayTitle}
        episodes={t.episodes || []}
      />
    </div>
  );
}
