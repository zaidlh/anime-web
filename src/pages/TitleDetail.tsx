import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTitleById, SourceType } from '../lib/data';
import { decodeBase64Url } from '../lib/utils';
import { EpisodeList } from '../components/EpisodeList';
import { useIsInList, addToList, removeFromList } from '../lib/list';

export default function TitleDetail() {
  const { source, id } = useParams<{ source: string; id: string }>();
  
  const decodedId = source === 'animewitcher' ? decodeURIComponent(id || '') : decodeBase64Url(id || '');
  const { title, loading } = useTitleById(source as SourceType, decodedId);

  const isAnime = source === 'animewitcher';
  const t = title as any;
  const displayTitle = isAnime && t ? (t.english_title || t.name) : (t ? t.title : '');

  const inList = useIsInList(decodedId, source || '');

  const toggleList = async () => {
    if (inList) {
      await removeFromList(decodedId, source || '');
    } else {
      await addToList({
        id: decodedId,
        source: source || '',
        title: displayTitle,
        poster: t?.poster || null,
        type: t?.type || null
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!title) {
    return (
      <div className="max-w-[1200px] mx-auto px-margin-edge py-xl mt-20">
        <div className="text-center p-lg bg-surface-container rounded-xl ghost-border">
          <h1 className="font-headline-md text-[24px] font-bold text-on-surface mb-sm">Title Not Found</h1>
          <p className="font-body-md text-on-surface-variant mb-md">We couldn't locate this title in our index. It may have been removed or the ID is invalid.</p>
          <Link to="/" className="text-primary hover:underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  const altTitle = isAnime && t.english_title ? t.name : null;
  const story = isAnime ? t.story : t.plot;
  const isMovie = t.episodes?.length === 1 && t.type === 'Movie';

  const firstEp = t.episodes?.[0];
  const firstEpId = firstEp ? (isAnime ? (firstEp.doc_id || firstEp.number) : firstEp.number) : null;
  const watchUrl = firstEpId ? `/watch/${source}/${encodeURIComponent(id || '')}/${firstEpId}` : '#';

  return (
    <div className="w-full relative min-h-screen">
      {/* Immersive Hero Background */}
      <div className="absolute top-0 left-0 w-full h-[80vh] md:h-[90vh] z-0 overflow-hidden pointer-events-none">
        {t.poster && (
          <img 
            src={t.poster} 
            alt={displayTitle} 
            className="w-full h-full object-cover opacity-40 blur-[2px]" 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/30 to-background/90 md:to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-margin-edge pt-[30vh] md:pt-[45vh] pb-xl flex flex-col md:flex-row gap-lg items-end md:items-start">
        
        {/* Mobile Poster (Optional, if we want to show it on mobile) */}
        {/* <div className="md:hidden w-1/3 aspect-[2/3] rounded-lg overflow-hidden border border-outline-variant shadow-2xl mx-auto mb-4">
          <img src={t.poster} className="w-full h-full object-cover" />
        </div> */}

        {/* Content */}
        <div className="flex-1 w-full flex flex-col gap-md text-center md:text-left pt-12 md:pt-0">
          
          <div className="flex items-center justify-center md:justify-start gap-4 mb-2 flex-wrap">
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-sm text-xs font-bold tracking-widest uppercase border border-primary/30">
              {t.type || (isAnime ? 'Anime' : 'Drama')}
            </span>
            <div className="flex items-center gap-1 text-on-surface-variant text-sm font-medium">
              <span className="material-symbols-outlined text-[16px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              {t.rating || '9.8'}
            </div>
            <span className="text-on-surface-variant/60 text-sm font-medium">{t.year || '2024'}</span>
          </div>

          <h1 className="font-display-lg text-[40px] md:text-[64px] font-black text-on-surface tracking-tighter leading-[1.1] drop-shadow-lg">
            {displayTitle}
          </h1>
          
          {t.tags && t.tags.length > 0 && (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
              {t.tags.slice(0, 4).map((tag: string) => (
                <span key={tag} className="text-on-surface-variant text-xs font-bold uppercase tracking-widest flex items-center">
                  <span className="w-1 h-1 rounded-full bg-outline-variant mr-2"></span>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-on-surface-variant font-body-md text-sm md:text-base leading-relaxed max-w-[42rem] mt-4 md:mt-2 mx-auto md:mx-0 drop-shadow-md">
            {story || 'No synopsis available.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-8 max-w-[32rem] mx-auto md:mx-0 w-full">
            {firstEpId && (
              <Link 
                to={watchUrl}
                className="w-auto flex-1 bg-primary text-black font-title-sm px-6 py-4 rounded-full flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,77,77,0.3)] font-bold tracking-wide whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                WATCH NOW
              </Link>
            )}
            <button 
              onClick={toggleList}
              className="w-auto flex-1 bg-surface-container-high/50 backdrop-blur-md border border-outline flex items-center justify-center gap-2 text-on-surface font-title-sm px-6 py-4 rounded-full transition-all active:scale-95 font-bold tracking-wide hover:bg-surface-variant whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: inList ? "'FILL' 1" : "'FILL' 0" }}>
                {inList ? 'check' : 'add'}
              </span>
              {inList ? 'IN LIST' : 'MY LIST'}
            </button>
            <Link 
              to={`/download/${source}/${encodeURIComponent(id || '')}`}
              className="w-auto flex-none bg-surface-container-high/50 backdrop-blur-md border border-outline flex items-center justify-center text-on-surface font-title-sm px-6 py-4 rounded-full transition-all active:scale-95 font-bold tracking-wide hover:bg-surface-variant"
              title="Download"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
            </Link>
          </div>

        </div>
      </div>
      
      <div className="max-w-[1200px] mx-auto px-margin-edge relative z-10">
        <EpisodeList source={source as SourceType} titleId={decodedId} episodes={t.episodes || []} />
      </div>
    </div>
  );
}
