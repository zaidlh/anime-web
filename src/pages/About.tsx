import React from 'react';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-margin-edge py-xl">
      <h1 className="font-display-lg text-[48px] font-black tracking-tighter text-on-surface mb-lg">About Cloudstream Catalog</h1>
      
      <div className="prose prose-invert prose-p:text-on-surface-variant prose-headings:text-on-surface max-w-none font-body-md">
        <p className="text-lg leading-relaxed mb-md">
          Cloudstream Catalog is a static indexing frontend that aggregates animated and live-action shows from remote endpoints.
          This site operates entirely as a static SPA. All videos are played or downloaded directly from the 
          indexed third-party hosts via browser-native technologies or iframe embeds.
        </p>

        <h2 className="font-headline-md text-[24px] font-bold mt-xl mb-md border-b border-outline-variant pb-2">Technical Architecture</h2>
        <ul className="space-y-sm text-on-surface-variant list-disc pl-5 mb-xl">
          <li><strong>Framework:</strong> React Router + Vite static build (simulating Next.js static output).</li>
          <li><strong>Data Ingestion:</strong> Static JSON files generated during CI pipeline runs.</li>
          <li><strong>Streaming:</strong> HTML5 video wrappers for direct MP4 and HLS files; iframe sandboxes for embed-only nodes.</li>
          <li><strong>Exporting:</strong> M3U8 generation is synthesized directly within the browser using Blob URLs.</li>
        </ul>

        <h2 className="font-headline-md text-[24px] font-bold mt-xl mb-md border-b border-outline-variant pb-2">Disclaimer</h2>
        <p className="text-on-surface-variant">
          This site does not host any media files on its servers. It merely links to content 
          hosted on third-party services. We do not control or endorse the content hosted by these peers.
        </p>
      </div>
    </div>
  );
}
