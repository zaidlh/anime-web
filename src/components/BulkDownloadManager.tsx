import React, { useState } from 'react';
import { Download, Clipboard, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { SourceType } from '../lib/data';
import { classifyServerUrl, getDownloadableServers } from '../lib/servers';

interface BulkDownloadManagerProps {
  source: SourceType;
  seriesTitle: string;
  episodes: any[];
}

export function BulkDownloadManager({ source, seriesTitle, episodes }: BulkDownloadManagerProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [qualityPref, setQualityPref] = useState<'best'|'1080p'|'720p'|'480p'>('best');
  
  const downloadableMap = new Map<number, string | null>();
  
  episodes.forEach((ep) => {
    const serversInfo = ep.servers || [];
    const classified = serversInfo.map((s: any) => classifyServerUrl(s.link || s.url || '', s.name));
    const dlServers = getDownloadableServers(classified);
    
    if (dlServers.length > 0) {
      let url = dlServers[0].directUrl;
      if (qualityPref !== 'best') {
        const pref = dlServers.find(s => s.quality?.includes(qualityPref));
        if (pref) url = pref.directUrl;
        else if (dlServers.length > 0) url = dlServers[0].directUrl;
      }
      downloadableMap.set(ep.number, url);
    } else {
      downloadableMap.set(ep.number, null);
    }
  });

  const toggleAll = () => {
    if (selected.size === episodes.filter(e => downloadableMap.get(e.number)).length) {
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

  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'done'>('idle');
  const [downloadedCount, setDownloadedCount] = useState(0);

  const handleDownloadSelected = async () => {
    if (selected.size === 0) return;
    setDownloadState('downloading');
    setDownloadedCount(0);

    const urls = getSelectedUrls();
    for (let i = 0; i < urls.length; i++) {
        const item = urls[i];
        const a = document.createElement('a');
        a.href = item.url;
        a.download = `${seriesTitle.replace(/[^a-z0-9]/gi, '_')}_EP${item.num}.mp4`;
        a.target = '_blank'; // Required for cross-origin downloads sometimes
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setDownloadedCount(i + 1);
        await new Promise(r => setTimeout(r, 1000)); // 1s delay
    }
    setDownloadState('done');
    setTimeout(() => setDownloadState('idle'), 3000);
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden flex flex-col">
      <div className="p-4 bg-emerald-900/20 border-b border-[#262626] text-sm text-emerald-200">
        <strong className="text-emerald-400">Note:</strong> Downloads work best for Pixeldrain and direct MP4 links. Some hosts block cross-origin downloads. If a download fails silently, use 'Copy Links' and paste into an external download manager (like IDM or aria2).
      </div>
      
      <div className="flex-1 overflow-y-auto max-h-[60vh]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#141414] sticky top-0 border-b border-[#262626] z-10">
            <tr>
              <th className="p-4 w-12">
                <input 
                  type="checkbox" 
                  className="rounded border-[#262626] bg-[#0f0f0f] w-4 h-4"
                  checked={selected.size > 0 && selected.size === episodes.filter(e => downloadableMap.get(e.number)).length}
                  onChange={toggleAll}
                />
              </th>
              <th className="p-4 text-gray-400 font-medium">Ep #</th>
              <th className="p-4 text-gray-400 font-medium">Title</th>
              <th className="p-4 text-gray-400 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {episodes.map(ep => {
              const url = downloadableMap.get(ep.number);
              const isSelected = selected.has(ep.number);
              
              return (
                <tr key={ep.number} className={`hover:bg-[#141414] ${!url ? 'opacity-50' : ''}`}>
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      disabled={!url}
                      checked={isSelected}
                      onChange={() => toggleIndividual(ep.number)}
                      className="rounded border-[#262626] bg-[#0f0f0f] w-4 h-4 disabled:opacity-30"
                    />
                  </td>
                  <td className="p-4 font-mono text-gray-400">{ep.number}</td>
                  <td className="p-4 text-gray-200">{ep.name || `Episode ${ep.number}`}</td>
                  <td className="p-4 text-right">
                    {url ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-500 text-xs" title="No direct download">
                        <AlertCircle className="w-3 h-3" /> Unavailable
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-[#141414] p-4 border-t border-[#262626] flex flex-col md:flex-row gap-4 justify-between items-center z-20">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-sm text-gray-400">Quality Pref:</label>
          <select 
            value={qualityPref} 
            onChange={(e) => setQualityPref(e.target.value as any)}
            className="bg-[#0f0f0f] border border-[#262626] rounded px-3 py-1.5 text-sm outline-none w-32"
          >
            <option value="best">Best Auth</option>
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
            <option value="480p">480p</option>
          </select>
          <span className="text-sm font-medium text-gray-300 ml-4">
            {selected.size} selected
          </span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-end">
          <button 
            onClick={handleCopyLinks}
            disabled={selected.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#262626] hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-medium transition-colors"
          >
            <Clipboard className="w-4 h-4" /> Copy Links
          </button>
          
          <button 
            onClick={handleGenerateM3U}
            disabled={selected.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#262626] hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-medium transition-colors"
          >
            <FileText className="w-4 h-4" /> Export M3U
          </button>

          <button 
            onClick={handleDownloadSelected}
            disabled={selected.size === 0 || downloadState === 'downloading'}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-white text-sm font-medium transition-colors"
          >
            {downloadState === 'downloading' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {downloadedCount}/{selected.size}</>
            ) : downloadState === 'done' ? (
              <><CheckCircle2 className="w-4 h-4" /> Done!</>
            ) : (
              <><Download className="w-4 h-4" /> Download Selected</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
