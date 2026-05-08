import React, { useState } from 'react';
import { SourceType } from '../lib/data';
import { classifyServerUrl, getDownloadableServers } from '../servers';

interface BulkDownloadManagerProps {
  source: SourceType;
  seriesTitle: string;
  episodes: any[];
}

export function BulkDownloadManager({ source, seriesTitle, episodes }: BulkDownloadManagerProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [qualityPref, setQualityPref] = useState<'best'|'1080p'|'720p'|'480p'>('1080p');
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'done'>('idle');
  const [downloadedCount, setDownloadedCount] = useState(0);
  
  const downloadableMap = new Map<number, string | null>();
  const qualitiesMap = new Map<number, string[]>();
  
  episodes.forEach((ep) => {
    const serversInfo = ep.servers || [];
    const classified = serversInfo.map((s: any) => classifyServerUrl(s.link || s.url || '', s.name, s.quality || null));
    const dlServers = getDownloadableServers(classified);
    
    qualitiesMap.set(ep.number, dlServers.map(s => s.quality).filter(Boolean) as string[]);

    if (dlServers.length > 0) {
      let url = dlServers[0].directUrl;
      const sorted = [...dlServers].sort((a,b) => {
         const qA = a.quality ? parseInt(a.quality) : 0;
         const qB = b.quality ? parseInt(b.quality) : 0;
         return qB - qA;
      });

      if (qualityPref !== 'best') {
        const pref = sorted.find(s => s.quality?.includes(qualityPref));
        if (pref) url = pref.directUrl;
        else if (sorted.length > 0) url = sorted[0].directUrl;
      } else if (sorted.length > 0) {
        url = sorted[0].directUrl;
      }
      downloadableMap.set(ep.number, url);
    } else {
      downloadableMap.set(ep.number, null);
    }
  });

  const allSelectableCount = episodes.filter(e => downloadableMap.get(e.number)).length;

  const toggleAll = () => {
    if (selected.size === allSelectableCount) {
      setSelected(new Set());
    } else {
      const allSelectable = episodes.filter(e => downloadableMap.get(e.number)).map(e => e.number);
      setSelected(new Set(allSelectable));
    }
  };

  const toggleIndividual = (num: number) => {
    const next = new Set(selected);
    if (next.has(num)) next.delete(num);
    else next.add(num);
    setSelected(next);
  };

  const getSelectedUrls = () => {
    return Array.from<number>(selected).map(num => ({
        num,
        url: downloadableMap.get(num)!
      }))
      .filter(item => !!item.url);
  };

  const handleCopyLinks = () => {
    const urls = getSelectedUrls().map(x => x.url).join('\n');
    navigator.clipboard.writeText(urls);
    alert('Copied ' + selected.size + ' links to clipboard.');
  };

  const handleShareLinks = async () => {
    const urls = getSelectedUrls().map(x => x.url).join('\n');
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${seriesTitle} Episodes`,
          text: urls,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      alert('Web Share API is not supported on this browser. Use "Copy Links" instead.');
    }
  };

  const handleGenerateM3U = () => {
    let m3u = '#EXTM3U\n';
    getSelectedUrls().forEach(({num, url}) => {
      m3u += `#EXTINF:-1,${seriesTitle} - Episode ${num}\n${url}\n`;
    });
    const blob = new Blob([m3u], { type: 'audio/x-mpegurl' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = `${seriesTitle.replace(/[^a-z0-9]/gi, '_')}.m3u`;
    a.click();
    URL.revokeObjectURL(u);
  };

  const handleDownloadSelected = async () => {
    if (selected.size === 0) return;
    setDownloadState('downloading');
    setDownloadedCount(0);

    const urls = getSelectedUrls();
    for (let i = 0; i < urls.length; i++) {
        const item = urls[i];
        // If it's a direct URL (like pixeldrain api), we can try to download it
        // Otherwise, we just open it in a new tab for the user to download manually
        const isDirect = item.url.includes('pixeldrain.com/api/file/') || item.url.endsWith('.mp4') || item.url.endsWith('.mkv');
        
        if (isDirect) {
          const a = document.createElement('a');
          a.href = item.url;
          a.download = `${seriesTitle.replace(/[^a-z0-9]/gi, '_')}_EP${item.num}.mp4`;
          a.rel = 'noreferrer';
          a.referrerPolicy = 'no-referrer';
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          window.open(item.url, '_blank', 'noopener,noreferrer');
        }
        setDownloadedCount(i + 1);
        await new Promise(r => setTimeout(r, 1000));
    }
    setDownloadState('done');
    setTimeout(() => setDownloadState('idle'), 3000);
  };

  return (
    <>
      <section className="relative mb-8 md:mb-xl md:rounded-xl overflow-hidden ghost-border bg-surface-container -mx-4 md:mx-0">
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface-container to-transparent z-0"></div>
        <div className="relative z-10 p-6 md:p-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <h1 className="font-display-lg text-[32px] md:text-[48px] font-black text-on-surface mb-xs leading-tight md:leading-none">{seriesTitle}</h1>
            <p className="font-title-sm text-primary uppercase tracking-widest font-bold text-xs md:text-sm">Bulk Download</p>
          </div>
          <div className="flex flex-col gap-xs w-full md:min-w-[240px] md:w-auto">
            <label className="font-label-caps text-outline uppercase font-bold text-[10px] md:text-[12px] tracking-wider">Preferred Quality</label>
            <div className="relative">
              <select 
                className="w-full bg-surface-container-lowest ghost-border rounded-lg px-md py-sm font-body-md text-on-surface appearance-none focus:border-secondary-container outline-none transition-colors text-sm md:text-base"
                value={qualityPref}
                onChange={(e) => setQualityPref(e.target.value as any)}
              >
                <option value="best">Best Available</option>
                <option value="1080p">Full HD (1080p)</option>
                <option value="720p">HD (720p)</option>
                <option value="480p">SD (480p)</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
            </div>
          </div>
        </div>
      </section>

      <div className="ghost-border md:rounded-xl bg-surface-container-lowest overflow-hidden mb-32 -mx-4 md:mx-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap md:whitespace-normal">
            <thead>
              <tr className="bg-surface-container-high border-b border-outline-variant">
              <th className="p-md w-12 text-center">
                <input 
                  type="checkbox"
                  checked={selected.size > 0 && selected.size === allSelectableCount}
                  onChange={toggleAll}
                  className="w-5 h-5 rounded border-outline bg-surface-container-lowest text-primary-container focus:ring-primary-container"
                />
              </th>
              <th className="p-md font-label-caps text-outline uppercase tracking-wider text-[12px] font-bold">#</th>
              <th className="p-md font-label-caps text-outline uppercase tracking-wider text-[12px] font-bold">Episode Name</th>
              <th className="p-md font-label-caps text-outline uppercase tracking-wider text-[12px] font-bold">Available Qualities</th>
              <th className="p-md font-label-caps text-outline uppercase tracking-wider text-[12px] font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md">
            {episodes.map(ep => {
              const url = downloadableMap.get(ep.number);
              const isSelected = selected.has(ep.number);
              const qualities = qualitiesMap.get(ep.number) || [];
              const numStr = ep.number.toString().padStart(2, '0');

              return (
                <tr key={ep.number} className={`border-b border-outline-variant hover:bg-surface-variant/20 transition-colors ${!url ? 'opacity-50' : ''}`}>
                  <td className="p-md text-center">
                    <input 
                      type="checkbox"
                      disabled={!url}
                      checked={isSelected}
                      onChange={() => toggleIndividual(ep.number)}
                      className="w-5 h-5 rounded border-outline bg-surface-container-lowest text-primary-container focus:ring-primary-container disabled:opacity-30"
                    />
                  </td>
                  <td className="p-md text-on-surface-variant">{numStr}</td>
                  <td className="p-md text-on-surface font-semibold">{ep.name || `Episode ${numStr}`}</td>
                  <td className="p-md">
                    <div className="flex flex-wrap gap-xs">
                      {qualities.length > 0 ? qualities.map((q, i) => (
                        <span key={i} className={`px-xs py-0.5 rounded-xl font-label-caps text-[12px] font-bold uppercase ${
                          q.includes('1080') ? 'bg-primary-container text-white' : 'bg-surface-variant text-on-surface-variant'
                        }`}>
                          {q}
                        </span>
                      )) : (
                         <span className="text-on-surface-variant text-[12px]">None</span>
                      )}
                    </div>
                  </td>
                  <td className="p-md">
                    {url ? (
                      <div className="flex items-center gap-xs text-tertiary">
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        <span className="font-label-caps text-[12px] font-bold uppercase">Available</span>
                      </div>
                    ) : (
                       <div className="flex items-center gap-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                        <span className="font-label-caps text-[12px] font-bold uppercase">Unavailable</span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-[56px] md:bottom-0 left-0 right-0 z-40 bg-surface-container/80 backdrop-blur-xl border-t border-outline-variant py-3 md:py-md px-4 md:px-margin-edge">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 md:gap-md">
          <div className="flex items-center justify-between w-full md:w-auto gap-md">
            <div className="flex flex-col">
              <span className="font-label-caps text-[10px] md:text-[12px] font-bold text-outline uppercase tracking-wider">Selected</span>
              <span className="font-headline-md text-[18px] md:text-[24px] font-bold text-on-surface">{selected.size} Episodes</span>
            </div>
            {downloadState !== 'idle' && (
              <>
                 <div className="h-8 w-[1px] bg-outline-variant mx-sm"></div>
                 <div className="flex flex-col">
                    <span className="font-label-caps text-[12px] font-bold text-outline uppercase tracking-wider">Status</span>
                    {downloadState === 'downloading' ? (
                       <span className="font-headline-md text-[24px] font-bold text-secondary animate-pulse">Downloading {downloadedCount}/{selected.size}...</span>
                    ) : (
                       <span className="font-headline-md text-[24px] font-bold text-tertiary">Downloads Completed</span>
                    )}
                 </div>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-sm w-full md:w-auto">
            <button 
              onClick={handleShareLinks}
              disabled={selected.size === 0}
              className="ghost-border px-md py-sm rounded-lg font-title-sm font-bold text-on-surface-variant hover:bg-surface-variant/30 transition-all flex items-center gap-xs disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
              Share to ADM
            </button>
            <button 
              onClick={handleCopyLinks}
              disabled={selected.size === 0}
              className="ghost-border px-md py-sm rounded-lg font-title-sm font-bold text-on-surface-variant hover:bg-surface-variant/30 transition-all flex items-center gap-xs disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">content_copy</span>
              Copy Links
            </button>
            <button 
               onClick={handleGenerateM3U}
               disabled={selected.size === 0}
              className="ghost-border px-md py-sm rounded-lg font-title-sm font-bold text-on-surface-variant hover:bg-surface-variant/30 transition-all flex items-center gap-xs disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">file_export</span>
              Export M3U
            </button>
            <button 
               onClick={handleDownloadSelected}
               disabled={selected.size === 0 || downloadState === 'downloading'}
              className="bg-tertiary-container hover:bg-tertiary transition-colors px-lg py-sm rounded-lg font-title-sm font-bold text-on-tertiary-container flex items-center gap-sm shadow-lg shadow-tertiary-container/20 disabled:opacity-50 disabled:shadow-none"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>download</span>
              Download Selected ({selected.size})
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
