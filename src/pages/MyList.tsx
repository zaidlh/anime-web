import React from 'react';
import { useMyList } from '../lib/list';
import { PosterCard } from '../components/PosterCard';
import { Link } from 'react-router-dom';

export default function MyList() {
  const { list, loading } = useMyList();

  return (
    <div className="max-w-[1200px] mx-auto px-margin-edge py-lg">
      <div className="mb-xl">
        <h1 className="font-display-lg text-[36px] font-bold text-on-surface mb-2 tracking-tighter">My List</h1>
        <p className="font-body-md text-on-surface-variant font-bold">{loading ? "Loading..." : `${list.length} titles saved`}</p>
      </div>

      {loading ? (
        <div className="text-center py-20 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
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

