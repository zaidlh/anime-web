import React from 'react';
import { useMyList } from '../lib/list';
import { PosterCard } from '../components/PosterCard';
import { Link } from 'react-router-dom';
import { SkeletonPosterGrid } from '../components/Skeleton';

export default function MyList() {
  const { list, loading } = useMyList();

  return (
    <div className="max-w-[1200px] mx-auto px-margin-edge py-lg">
      <div className="mb-xl">
        <h1 className="font-display-lg text-[36px] font-bold text-on-surface mb-2 tracking-tighter">My List</h1>
        <p className="font-body-md text-on-surface-variant font-bold">{loading ? "Loading titles..." : `${list.length} titles saved`}</p>
      </div>

      {loading ? (
        <SkeletonPosterGrid />
      ) : list.length === 0 ? (
        <div className="text-center py-20 bg-surface-container rounded-xl ghost-border">
          <span className="material-symbols-outlined text-[48px] text-outline mb-sm">bookmark_border</span>
          <p className="font-headline-md text-on-surface-variant font-bold mb-md">Your list is empty.</p>
          <Link to="/" className="text-secondary hover:underline font-title-sm">Discover titles to watch</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-gutter mb-xl">
          {list.map(t => (
            <PosterCard 
              key={`${t.source}-${t.id}`} 
              id={t.id} 
              source={t.source as any}
              title={t.title}
              poster={t.poster}
              type={t.type} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

