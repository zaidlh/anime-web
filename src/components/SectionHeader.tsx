import React from 'react';
import { Link } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  viewAllUrl?: string;
  className?: string;
}

export function SectionHeader({ title, viewAllUrl, className = "" }: SectionHeaderProps) {
  return (
    <div className={`flex justify-between items-center mb-4 ${className}`}>
      {viewAllUrl ? (
        <Link to={viewAllUrl} className="text-on-surface-variant hover:text-primary text-xs font-bold transition-colors uppercase tracking-wider">
          View More
        </Link>
      ) : <div />}
      <h2 className="font-display-lg text-[18px] md:text-[22px] font-bold text-on-surface tracking-tight">
        {title}
      </h2>
    </div>
  );
}
