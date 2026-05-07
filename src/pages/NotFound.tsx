import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-margin-edge text-center py-xl">
      <h1 className="font-display-lg text-[120px] font-black text-primary-container leading-none drop-shadow-2xl mb-sm">
        404
      </h1>
      <h2 className="font-headline-md text-[32px] font-bold text-on-surface mb-md">
        Page Not Found
      </h2>
      <p className="font-body-md text-lg text-on-surface-variant max-w-xl mb-lg">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link 
        to="/" 
        className="bg-primary-container text-on-primary-container px-xl py-md rounded-lg font-title-sm text-[18px] font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg"
      >
        <span className="material-symbols-outlined mr-sm align-middle">home</span>
        Return to Homepage
      </Link>
    </div>
  );
}
