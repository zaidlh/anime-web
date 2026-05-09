import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAllTitles } from '../lib/data';
import { PosterCard } from '../components/PosterCard';
import { SkeletonPosterGrid } from '../components/Skeleton';

export default function Browse() {
  const { source } = useParams<{ source: string }>();
  const { animewitcher, asia2tv, loading } = useAllTitles();

  const [typeFilter, setTypeFilter] = useState(() => sessionStorage.getItem('browse_type') || 'All Types');
  const [sortOrder, setSortOrder] = useState(() => sessionStorage.getItem('browse_sort') || 'Default');
  const [tagFilter, setTagFilter] = useState(() => sessionStorage.getItem('browse_tag') || 'All Tags');

  useEffect(() => { sessionStorage.setItem('browse_type', typeFilter); }, [typeFilter]);
  useEffect(() => { sessionStorage.setItem('browse_sort', sortOrder); }, [sortOrder]);
  useEffect(() => { sessionStorage.setItem('browse_tag', tagFilter); }, [tagFilter]);
  
  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-margin-edge py-lg">
        <SkeletonPosterGrid count={12} />
      </div>
    );
  }

  if (source && source !== 'animewitcher' && source !== 'asia2tv') {
    return <div className="text-center py-20 font-headline-md font-bold text-on-surface">Source not found.</div>;
  }

  const baseItems = !source 
    ? [...animewitcher.map(t => ({ ...t, _source: 'animewitcher' })), ...asia2tv.map(t => ({ ...t, _source: 'asia2tv' }))]
    : source === 'animewitcher' 
      ? animewitcher.map(t => ({ ...t, _source: 'animewitcher' })) 
      : asia2tv.map(t => ({ ...t, _source: 'asia2tv' }));

  const allTags = Array.from(new Set(baseItems.flatMap((t: any) => t.tags || []))).sort();
  const allTypes = Array.from(new Set(baseItems.map((t: any) => t.type || (t._source === 'asia2tv' ? 'Drama' : '')).filter(Boolean))).sort();

  const items = baseItems
    .filter((t: any) => {
      if (typeFilter !== 'All Types') {
        const tType = t.type || (t._source === 'asia2tv' ? 'Drama' : '');
        if (tType !== typeFilter) return false;
      }
      if (tagFilter !== 'All Tags') {
        const tTags = t.tags || [];
        if (!tTags.includes(tagFilter)) return false;
      }
      return true;
    })
    .sort((a: any, b: any) => {
      const titleA = a._source === 'animewitcher' ? (a.english_title || a.name || '') : (a.title || '');
      const titleB = b._source === 'animewitcher' ? (b.english_title || b.name || '') : (b.title || '');
      
      if (sortOrder === 'A-Z') return titleA.localeCompare(titleB);
      if (sortOrder === 'Z-A') return titleB.localeCompare(titleA);
      if (sortOrder === 'Most Episodes') {
        const epA = a.episodes?.length || 0;
        const epB = b.episodes?.length || 0;
        return epB - epA;
      }
      return 0; // Default
    });

  const sourceName = !source 
    ? 'All Catalog' 
    : source === 'animewitcher' 
      ? 'Anime (AnimeWitcher)' 
      : 'Asian Drama (Asia2TV)';

  return (
    <div className="max-w-[1200px] mx-auto px-margin-edge py-lg">
      <div className="mb-md bg-surface-container border border-surface-variant rounded-2xl p-xl shadow-sm text-center">
        <h1 className="font-display-lg text-[36px] font-bold text-on-surface mb-2 tracking-tighter">{sourceName}</h1>
        <p className="font-body-md text-on-surface-variant font-bold flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">movie</span>
          {items.length} titles available
        </p>
      </div>

      <div className="flex flex-wrap gap-sm items-center mb-xl p-md bg-surface-container border border-surface-variant rounded-xl">
        <select 
          value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="appearance-none bg-surface-container-high border border-outline-variant rounded-full px-4 py-2 font-body-md font-semibold text-on-surface focus:border-outline outline-none transition-colors"
        >
          <option value="All Types">All Types</option>
          {allTypes.map(t => <option key={t as string} value={t as string}>{t as string}</option>)}
        </select>

        <select 
          value={sortOrder} onChange={e => setSortOrder(e.target.value)}
          className="appearance-none bg-surface-container-high border border-outline-variant rounded-full px-4 py-2 font-body-md font-semibold text-on-surface focus:border-outline outline-none transition-colors"
        >
          <option value="Default">Default</option>
          <option value="A-Z">A → Z</option>
          <option value="Z-A">Z → A</option>
          <option value="Most Episodes">Most Episodes</option>
        </select>

        <select 
          value={tagFilter} onChange={e => setTagFilter(e.target.value)}
          className="appearance-none bg-surface-container-high border border-outline-variant rounded-full px-4 py-2 font-body-md font-semibold text-on-surface focus:border-outline outline-none transition-colors"
        >
          <option value="All Tags">All Tags</option>
          {allTags.map(t => <option key={t as string} value={t as string}>{t as string}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-gutter mb-xl">
        {items.map((t: any) => (
          <PosterCard 
            key={`${t._source}-${t.id}`} 
            id={t.id} 
            source={t._source}
            title={t._source === 'animewitcher' ? (t.english_title || t.name) : t.title}
            poster={t.poster}
            type={t.type || (t._source === 'asia2tv' ? "Drama" : null)} 
            tags={t.tags} 
            episodeCount={t.episodes?.length}
          />
        ))}
      </div>
    </div>
  );
}
