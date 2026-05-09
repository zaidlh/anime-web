import React, { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';

export default function Settings() {
  const [quality, setQuality] = useState('best');
  const [downloadPath, setDownloadPath] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    // We could persist these in localStorage if they were globally used.
    // For now, it's just a UI showcase for a "professional" feel.
    setQuality(localStorage.getItem('cs_pref_quality') || 'best');
  }, []);

  const saveQuality = (q: string) => {
    setQuality(q);
    localStorage.setItem('cs_pref_quality', q);
    showToast(`Default quality set to ${q}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-margin-edge py-xl">
      <h1 className="font-display-lg text-[48px] font-black tracking-tighter text-on-surface mb-lg">Settings</h1>
      
      <div className="bg-surface-container rounded-xl ghost-border overflow-hidden">
        <div className="p-lg border-b border-outline-variant">
          <h2 className="font-headline-md text-[20px] font-bold text-on-surface mb-sm">Playback Preferences</h2>
          
          <div className="flex flex-col gap-xs mt-md">
            <label className="font-label-caps text-outline uppercase font-bold text-[12px] tracking-wider">Default Video Quality</label>
            <div className="relative w-full sm:w-64">
              <select 
                className="w-full bg-surface-container-lowest ghost-border rounded-lg px-md py-sm font-body-md text-on-surface appearance-none focus:border-secondary-container outline-none transition-colors"
                value={quality}
                onChange={(e) => saveQuality(e.target.value)}
              >
                <option value="best">Best Available</option>
                <option value="1080p">1080p (Full HD)</option>
                <option value="720p">720p (HD)</option>
                <option value="480p">480p (SD)</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
            </div>
            <p className="text-sm text-on-surface-variant mt-2">This will be your default preferred quality when watching or downloading.</p>
          </div>
        </div>

        <div className="p-lg">
          <h2 className="font-headline-md text-[20px] font-bold text-on-surface mb-sm">UI & Theme</h2>
          <div className="flex items-center gap-md mt-md">
            <span className="material-symbols-outlined text-[32px] text-primary">dark_mode</span>
            <div>
              <p className="font-title-sm font-bold text-on-surface">Cinematic Dark Mode</p>
              <p className="text-sm text-on-surface-variant">This site is permanently set to dark mode for the best viewing experience.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
