import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Play, Pause, ExternalLink } from 'lucide-react';
import { ClassifiedServer, getBestServer } from '../lib/servers';

interface VideoPlayerProps {
  servers: ClassifiedServer[];
  poster: string | null;
  title: string;
  episodeName: string;
}

export function VideoPlayer({ servers, poster, title, episodeName }: VideoPlayerProps) {
  const [selectedServer, setSelectedServer] = useState<ClassifiedServer | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const best = getBestServer(servers);
    setSelectedServer(best);
  }, [servers]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') return;

      const video = videoRef.current;
      if (!video) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          if (video.paused) video.play();
          else video.pause();
          break;
        case 'f':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            video.requestFullscreen();
          }
          break;
        case 'arrowright':
          e.preventDefault();
          video.currentTime += 10;
          break;
        case 'arrowleft':
          e.preventDefault();
          video.currentTime -= 10;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const s = servers.find(x => x.name === e.target.value);
    if (s && videoRef.current) {
      const cTime = videoRef.current.currentTime;
      const isPaused = videoRef.current.paused;
      setSelectedServer(s);
      
      // Need a slight delay to let react re-render the source URL
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = cTime;
          if (!isPaused) videoRef.current.play();
        }
      }, 50);
    }
  };

  if (!selectedServer) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg flex flex-col items-center justify-center p-8 text-center border border-[#262626]">
        <div className="mb-4 text-[#a3a3a3]">This episode is only available via external hosts.</div>
        <div className="flex flex-wrap gap-4 justify-center">
          {servers.map((s, i) => (
            <a
              key={i}
              href={s.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#262626] hover:bg-[#333] px-4 py-2 rounded-md transition-colors"
            >
              Open on {s.name} <ExternalLink className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    );
  }

  const nativeServers = servers.filter(s => s.capability === 'native');

  return (
    <div className="flex flex-col gap-4">
      <div className="relative group bg-black rounded-lg overflow-hidden border border-[#262626] shadow-xl">
        {selectedServer.capability === 'native' ? (
          <video
            ref={videoRef}
            controls
            preload="metadata"
            poster={poster || undefined}
            src={selectedServer.directUrl as string}
            className="w-full aspect-video outline-none"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="relative w-full aspect-video">
            <iframe
              src={selectedServer.embedUrl as string}
              allowFullScreen
              className="w-full h-full border-0"
              title={`${title} - ${episodeName}`}
            />
            <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded text-xs font-medium border border-white/10 pointer-events-none">
              Playing from {selectedServer.name}
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#262626] flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-white">{episodeName}</h2>
          <div className="text-sm text-[#a3a3a3]">Playing {selectedServer.quality || 'Auto'} on {selectedServer.name}</div>
        </div>

        {nativeServers.length > 1 && selectedServer.capability === 'native' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Quality:</span>
            <select
              className="bg-[#0f0f0f] border border-[#262626] rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500"
              value={selectedServer.name}
              onChange={handleQualityChange}
            >
              {nativeServers.map(s => (
                <option key={s.name} value={s.name}>
                  {s.quality || 'Standard'} ({s.name})
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedServer.capability === 'iframe' && (
             <a
             href={selectedServer.embedUrl as string}
             target="_blank"
             rel="noopener noreferrer"
             className="flex items-center gap-2 bg-[#262626] hover:bg-[#333] px-3 py-1.5 rounded-md text-sm transition-colors"
           >
             Open in New Tab <ExternalLink className="w-4 h-4" />
           </a>
        )}
      </div>
    </div>
  );
}
