import React from 'react';
import { Film } from 'lucide-react';

export function PlaceholderImage({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-[#1a1a1a] border border-[#262626] ${className}`}>
      <Film className="w-12 h-12 text-[#262626]" />
    </div>
  );
}
