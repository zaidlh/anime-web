export type HostCapability = 'native' | 'iframe' | 'external';

export interface ClassifiedServer {
  name: string;
  quality: string | null;
  capability: HostCapability;
  directUrl: string | null;
  embedUrl: string | null;
  originalUrl: string;
}

export function classifyServerUrl(url: string, name: string, quality: string | null = null): ClassifiedServer {
  const lower = url.toLowerCase();
  const lowerName = name.toLowerCase();

  // Pixeldrain direct API rewrite
  const pdMatch = url.match(/pixeldrain\.com\/(?:u|api\/file)\/([a-zA-Z0-9_-]+)/i);
  if (pdMatch) {
    return {
      name, quality, capability: 'native',
      directUrl: `https://pixeldrain.com/api/file/${pdMatch[1]}`, 
      embedUrl: null, originalUrl: url,
    };
  }

  // Bunny / MediaDelivery
  if (lowerName.includes('bunny') || lower.includes('mediadelivery.net') || lower.includes('bunnycdn')) {
    return {
      name, quality, capability: 'iframe',
      directUrl: null, embedUrl: url, originalUrl: url,
    };
  }

  // Ok.ru
  if (lower.includes('ok.ru') || lowerName.includes('okru')) {
    return {
      name, quality, capability: 'iframe',
      directUrl: null, embedUrl: url, originalUrl: url,
    };
  }

  // YouTube (for testing iframe capability easily)
  if (lower.includes('youtube.com/embed') || lowerName.includes('youtube')) {
    return {
      name, quality, capability: 'iframe',
      directUrl: null, embedUrl: url, originalUrl: url,
    };
  }

  // Direct video files
  if (/\.(mp4|mkv|webm)(\?.*)?$/i.test(lower)) {
    return {
      name, quality, capability: 'native',
      directUrl: url, embedUrl: null, originalUrl: url,
    };
  }

  // HLS
  if (/\.m3u8(\?.*)?$/i.test(lower)) {
    return {
      name, quality, capability: 'native',
      directUrl: url, embedUrl: null, originalUrl: url,
    };
  }

  // Mediafire
  if (lower.includes('mediafire.com')) {
    return {
      name, quality, capability: 'native',
      directUrl: url, embedUrl: null, originalUrl: url,
    };
  }

  // Krakenfiles
  if (lower.includes('krakenfiles.com')) {
    const id = url.split('/').slice(-2, -1)[0];
    return {
      name, quality, capability: 'iframe',
      directUrl: null, embedUrl: `https://krakenfiles.com/embed-video/${id}`, originalUrl: url,
    };
  }

  // Streamtape
  if (lower.includes('streamtape.com')) {
    const id = url.split('/').slice(-2, -1)[0];
    return {
      name, quality, capability: 'iframe',
      directUrl: null, embedUrl: `https://streamtape.com/e/${id}`, originalUrl: url,
    };
  }

  // Vidtube
  if (lower.includes('vidtube.one')) {
    const id = url.split('/').pop();
    return {
      name, quality, capability: 'iframe',
      directUrl: null, embedUrl: `https://vidtube.one/e/${id}`, originalUrl: url,
    };
  }

  // Vidmoly
  if (lower.includes('vidmoly.to') || lower.includes('vidmoly.me')) {
    const id = url.split('/').pop();
    return {
      name, quality, capability: 'iframe',
      directUrl: null, embedUrl: `https://vidmoly.to/embed-${id}.html`, originalUrl: url,
    };
  }

  return {
    name, quality, capability: 'external',
    directUrl: null, embedUrl: null, originalUrl: url,
  };
}

export function getBestServer(servers: ClassifiedServer[], preference: 'best' | '1080p' | '720p' | '480p' = 'best'): ClassifiedServer | null {
  const playable = servers.filter(s => s.capability === 'native' || s.capability === 'iframe');
  if (playable.length === 0) return null;

  // Prioritize Pixeldrain (PX) as requested by user
  const pxServers = playable.filter(s => 
    s.name.toLowerCase().includes('pixeldrain') || 
    s.name.toLowerCase().includes('px') ||
    (s.directUrl && s.directUrl.includes('pixeldrain.com'))
  );
  
  const qualityRank = (q: string | null): number => {
    if (!q) return 0;
    if (q.includes('1080')) return 4;
    if (q.includes('720')) return 3;
    if (q.includes('480')) return 2;
    return 1;
  };

  // If PX servers exist, only consider them. Otherwise use all playable.
  const targetList = pxServers.length > 0 ? pxServers : playable;

  if (preference === 'best') {
    return targetList.sort((a, b) => qualityRank(b.quality) - qualityRank(a.quality))[0];
  }

  const preferred = targetList.find(s => s.quality?.includes(preference));
  if (preferred) return preferred;

  // Fallback to best available in targetList
  return targetList.sort((a, b) => qualityRank(b.quality) - qualityRank(a.quality))[0];
}

export function getDownloadableServers(servers: ClassifiedServer[]): ClassifiedServer[] {
  return servers.filter(s => s.capability === 'native' && s.directUrl);
}
