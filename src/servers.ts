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

  // Mediafire direct
  if (lower.includes('mediafire.com') && /download/i.test(lower)) {
    return {
      name, quality, capability: 'native',
      directUrl: url, embedUrl: null, originalUrl: url,
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

  const qualityRank = (q: string | null): number => {
    if (!q) return 0;
    if (q.includes('1080')) return 4;
    if (q.includes('720')) return 3;
    if (q.includes('480')) return 2;
    return 1;
  };

  if (preference === 'best') {
    return playable.sort((a, b) => qualityRank(b.quality) - qualityRank(a.quality))[0];
  }

  const preferred = playable.find(s => s.quality?.includes(preference));
  if (preferred) return preferred;

  // Fallback to best available
  return playable.sort((a, b) => qualityRank(b.quality) - qualityRank(a.quality))[0];
}

export function getDownloadableServers(servers: ClassifiedServer[]): ClassifiedServer[] {
  return servers.filter(s => s.capability === 'native' && s.directUrl);
}
