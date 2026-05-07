import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTitleById, SourceType } from '../lib/data';
import { decodeBase64Url, encodeBase64Url } from '../lib/utils';
import { Play, Download, ExternalLink } from 'lucide-react';
import { EpisodeList } from '../components/EpisodeList';

export default function TitleDetail() {
  const { source, id } = useParams<{ source: string; id: string }>();
  
  const decodedId = source === 'animewitcher' ? decodeURIComponent(id || '') : decodeBase64Url(id || '');
  const title = getTitleById(source as SourceType, decodedId);

  if (!title) {
    return (
      <div className="max-w-4xl mx-auto mt-20 text-center p-8 bg-[#1a1a1a] rounded-lg border border-[#262626]">
        <h1 className="text-2xl font-bold text-white mb-4">Title Not Found</h1>
        <p className="text-gray-400 mb-6">We couldn't locate this title in our index. It may have been removed or the ID is invalid.</p>
        <Link to="/" className="text-blue-500 hover:underline">Return to Home</Link>
      </div>
    );
  }

  const isAnime = source === 'animewitcher';
  const t = title as any;
  const displayTitle = isAnime ? (t.english_title || t.name) : t.title;
  const altTitle = isAnime && t.english_title ? t.name : null;
  const story = isAnime ? t.story : t.plot;
  const isMovie = t.episodes?.length === 1 && t.type === 'Movie';

  const firstEp = t.episodes?.[0];
  const firstEpId = firstEp ? (isAnime ? (firstEp.doc_id || firstEp.number) : firstEp.number) : null;
  const watchUrl = firstEpId ? `/watch/${source}/${encodeURIComponent(id || '')}/${firstEpId}` : '#';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-72 flex-shrink-0">
          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#262626] shadow-xl relative">
            {t.poster ? (
              <img src={t.poster} alt={displayTitle} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">No Poster</div>
            )}
            {t.type && (
              <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow">
                {t.type}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2">{displayTitle}</h1>
          {altTitle && <h2 className="text-xl text-gray-500 mb-4">{altTitle}</h2>}
          
          {t.tags && t.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {t.tags.map((tag: string) => (
                <span key={tag} className="bg-[#262626] text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="prose prose-invert max-w-none text-gray-400 mb-8 line-clamp-6">
            {story || 'No synopsis available.'}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-auto">
            {firstEpId && (
              <Link 
                to={watchUrl}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                {isMovie ? 'Watch Movie' : 'Watch Episode 1'}
              </Link>
            )}
            <Link 
              to={`/download/${source}/${id}`}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              Bulk Download
            </Link>
            {!isAnime && t.url && (
              <a 
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-[#262626] hover:bg-[#1a1a1a] text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors ml-auto"
              >
                Open Source <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <EpisodeList source={source as SourceType} titleId={decodedId} episodes={t.episodes || []} />
    </div>
  );
}
