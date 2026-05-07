import React from 'react';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-white mb-6">About Cloudstream Catalog</h1>
      
      <div className="prose prose-invert prose-blue max-w-none">
        <p className="text-gray-300 text-lg leading-relaxed">
          Cloudstream Catalog is a static indexing frontend that aggregates animated and live-action shows from remote endpoints.
          This site operates entirely as a static SPA. All videos are played or downloaded directly from the 
          indexed third-party hosts via browser-native technologies or iframe embeds.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4 border-b border-[#262626] pb-2">Technical Architecture</h2>
        <ul className="space-y-2 text-gray-400 list-disc pl-5">
          <li><strong>Framework:</strong> React Router + Vite static build (simulating Next.js static output).</li>
          <li><strong>Data Ingestion:</strong> Static JSON files generated during CI pipeline runs.</li>
          <li><strong>Streaming:</strong> HTML5 video wrappers for direct MP4 and HLS files; iframe sandboxes for embed-only nodes.</li>
          <li><strong>Exporting:</strong> M3U8 generation is synthesized directly within the browser using Blob URLs.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4 border-b border-[#262626] pb-2">Disclaimer</h2>
        <p className="text-gray-400">
          This site does not host any media files on its servers. It merely links to content 
          hosted on third-party services. We do not control or endorse the content hosted by these peers.
        </p>
      </div>
    </div>
  );
}
