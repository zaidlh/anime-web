import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClassifiedServer, getBestServer } from '../servers';

interface VideoPlayerProps {
  servers: ClassifiedServer[];
  poster: string | null;
  title: string;
  episodeName: string;
  titleDetailUrl: string;
  downloadUrl: string;
  prevEpUrl: string | null;
  nextEpUrl: string | null;
}

export function VideoPlayer({ servers, poster, title, episodeName, titleDetailUrl, downloadUrl, prevEpUrl, nextEpUrl }: VideoPlayerProps) {
  const [selectedServer, setSelectedServer] = useState<ClassifiedServer | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const best = getBestServer(servers);
    setSelectedServer(best);
    setVideoError(null);
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

  const nativeServers = servers.filter(s => s.capability === 'native');
  const iframeServers = servers.filter(s => s.capability === 'iframe');
  const externalServers = servers.filter(s => s.capability === 'external');
  const allServers = [...nativeServers, ...iframeServers, ...externalServers];

  return (
    <div className="flex flex-col gap-lg">
      <section className="w-full aspect-video bg-black md:rounded-xl overflow-hidden border-b md:border border-outline-variant/30 mb-md relative group video-glow transition-all duration-500 hover:border-primary/20 -mx-4 md:mx-0">
        {!selectedServer ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm bg-black/60">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4">open_in_new</span>
            <div className="mb-4 text-on-surface font-headline-md font-bold">External Stream Only</div>
            <div className="text-on-surface-variant max-w-md">
              This episode does not have a native web stream. Please select an external server from the list below to open it in a new tab.
            </div>
          </div>
        ) : selectedServer.capability === 'native' ? (
          <>
            {videoError && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 text-center p-6 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[48px] text-error mb-4">error_outline</span>
                <p className="font-headline-md font-bold text-on-surface mb-2">Playback Error</p>
                <p className="font-body-md text-on-surface-variant max-w-md">{videoError}</p>
                <button 
                  onClick={() => setVideoError(null)}
                  className="mt-6 px-lg py-sm bg-surface-container rounded-lg font-title-sm font-bold text-on-surface hover:bg-surface-variant transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}
            <video
              ref={videoRef}
              controls
              preload="metadata"
              poster={poster || undefined}
              src={selectedServer.directUrl as string}
              {...({ referrerPolicy: 'no-referrer' } as React.HTMLAttributes<HTMLVideoElement>)}
              className="w-full h-full object-cover outline-none"
              onError={(e) => {
                console.error("Video error:", e.type);
                setVideoError("The video stream could not be loaded. Please try selecting a different server.");
              }}
            >
              Your browser does not support the video tag.
            </video>
          </>
        ) : (
          <div className="relative w-full h-full">
            <iframe
              src={selectedServer.embedUrl as string}
              allowFullScreen
              referrerPolicy="no-referrer"
              className="w-full h-full border-0"
              title={`${title} - ${episodeName}`}
              sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
            />
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-label-caps font-bold pointer-events-none">
              Playing from {selectedServer.name}
            </div>
          </div>
        )}
      </section>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-md mb-xl px-4 md:px-0">
        <div className="flex-1 w-full">
          <h1 className="font-display-lg text-[20px] sm:text-[32px] text-on-surface mb-xs leading-tight font-black line-clamp-2 md:line-clamp-none">{episodeName}</h1>
          <p className="font-title-sm text-on-surface-variant/80 text-sm md:text-base">
            Part of <Link className="text-primary hover:text-primary-container font-bold transition-all underline decoration-primary/30 underline-offset-4" to={titleDetailUrl}>{title}</Link>
          </p>

          <div className="flex items-center mt-md overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            <div className="inline-flex rounded-xl border border-outline-variant/30 bg-surface-container-low overflow-hidden shadow-lg shrink-0">
              {prevEpUrl ? (
                <Link to={prevEpUrl} className="flex items-center gap-xs px-md py-3 hover:bg-surface-variant transition-all font-title-sm text-on-surface border-r border-outline-variant/30 font-bold">
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Previous
                </Link>
              ) : (
                <span className="flex items-center gap-xs px-md py-3 text-on-surface-variant opacity-50 border-r border-outline-variant/30 font-bold font-title-sm cursor-not-allowed">
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Previous
                </span>
              )}
              
              <Link to={titleDetailUrl} className="flex items-center gap-xs px-md py-3 hover:bg-surface-variant transition-all font-title-sm text-on-surface border-r border-outline-variant/30 font-bold">
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
                Episode List
              </Link>
              
              {nextEpUrl ? (
                <Link to={nextEpUrl} className="flex items-center gap-xs px-md py-3 hover:bg-surface-variant transition-all font-title-sm text-on-surface font-bold">
                  Next
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              ) : (
                <span className="flex items-center gap-xs px-md py-3 text-on-surface-variant opacity-50 font-bold font-title-sm cursor-not-allowed">
                  Next
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-auto mt-md lg:mt-0">
          <Link to={downloadUrl} className="w-full lg:w-auto flex items-center justify-center gap-sm px-lg py-4 rounded-xl bg-primary-container text-on-primary-container font-headline-md text-[18px] shadow-xl hover:brightness-110 active:scale-[0.98] transition-all font-bold">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 600" }}>download</span>
            Download Episode
          </Link>
        </div>
      </div>

      <div className="mb-md px-4 md:px-0">
        <h3 className="font-label-caps text-label-caps text-primary/70 tracking-[0.2em] uppercase mb-sm font-bold text-[10px] md:text-xs">Select Streaming Server</h3>
        <div className="flex flex-wrap gap-3 md:gap-md">
          {allServers.map((s, i) => {
            const isSelected = selectedServer && selectedServer.name === s.name && selectedServer.quality === s.quality;
            return (
              <button
                key={`${s.name}-${s.quality}-${i}`}
                onClick={() => {
                  if (s.capability === 'external') {
                    window.open(s.originalUrl, '_blank', 'noopener,noreferrer');
                    return;
                  }
                  setVideoError(null);
                  if (videoRef.current) {
                    const cTime = videoRef.current.currentTime;
                    const isPaused = videoRef.current.paused;
                    setSelectedServer(s);
                    setTimeout(() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = cTime;
                        if (!isPaused) videoRef.current.play();
                      }
                    }, 50);
                  } else {
                    setSelectedServer(s);
                  }
                }}
                className={`group flex items-center gap-sm p-3 pr-6 rounded-xl transition-all ${
                  isSelected 
                    ? 'bg-secondary-container/10 border-2 border-secondary-container text-on-secondary-container hover:bg-secondary-container/20'
                    : 'bg-surface-container-high/50 border-2 border-outline-variant/30 text-on-surface-variant hover:border-outline hover:text-on-surface'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-secondary-container' : 'bg-surface-container-highest group-hover:bg-primary/20 group-hover:text-primary'
                }`}>
                   <span className={`material-symbols-outlined ${isSelected ? 'text-white' : ''}`}>
                      {s.capability === 'native' ? 'dns' : s.capability === 'iframe' ? 'cloud_queue' : 'open_in_new'}
                   </span>
                </div>
                <div className="text-left">
                  <p className={`font-label-caps text-[10px] uppercase font-bold ${isSelected ? 'text-secondary/60' : 'text-outline'}`}>
                    {s.capability === 'native' ? 'Direct Source' : s.capability === 'iframe' ? 'Embed Player' : 'External Link'}
                  </p>
                  <p className="font-title-sm font-bold">{s.name} {s.quality && <span className="font-normal opacity-80">- {s.quality}</span>}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
}
