import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTitleById, SourceType } from '../lib/data';
import { decodeBase64Url } from '../lib/utils';
import { BulkDownloadManager } from '../components/BulkDownloadManager';

export default function Download() {
  const { source, id } = useParams<{ source: string; id: string }>();
  
  const decodedId = source === 'animewitcher' ? decodeURIComponent(id || '') : decodeBase64Url(id || '');
  const title = getTitleById(source as SourceType, decodedId);

  if (!title) {
    return (
      <div className="max-w-4xl mx-auto mt-20 text-center p-8 bg-[#1a1a1a] rounded-lg border border-[#262626]">
        <h1 className="text-2xl font-bold text-white mb-4">Title Not Found</h1>
        <Link to="/" className="text-blue-500 hover:underline">Return to Home</Link>
      </div>
    );
  }

  const isAnime = source === 'animewitcher';
  const t = title as any;
  const displayTitle = isAnime ? (t.english_title || t.name) : t.title;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col min-h-[80vh]">
      <div className="mb-8">
        <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
          <Link to={`/title/${source}/${encodeURIComponent(id || '')}`} className="hover:text-white">← Back to {displayTitle}</Link>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Bulk Download</h1>
        <p className="text-gray-400">Select episodes to download sequentially or export an M3U playlist.</p>
      </div>

      <BulkDownloadManager 
        source={source as SourceType}
        seriesTitle={displayTitle}
        episodes={t.episodes || []}
      />
    </div>
  );
}
