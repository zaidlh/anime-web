import React from 'react';

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-margin-edge py-xl">
      <h1 className="font-display-lg text-[48px] font-black tracking-tighter text-on-surface mb-lg">Terms of Service</h1>
      
      <div className="prose prose-invert prose-p:text-on-surface-variant prose-headings:text-on-surface max-w-none font-body-md">
        <p className="text-lg leading-relaxed mb-md">
          Welcome to Cloudstream Catalog. By accessing this website, we assume you accept these terms and conditions. Do not continue to use Cloudstream Catalog if you do not agree to take all of the terms and conditions stated on this page.
        </p>

        <h2 className="font-headline-md text-[24px] font-bold mt-xl mb-md border-b border-outline-variant pb-2">Nature of the Service</h2>
        <p className="mb-md">
          Cloudstream Catalog is a web-based index. We do not host, store, or upload any video files. The content provided is aggregated from third-party services on the internet. As such, we cannot guarantee the availability, quality, or legality of the content provided by those third parties.
        </p>

        <h2 className="font-headline-md text-[24px] font-bold mt-xl mb-md border-b border-outline-variant pb-2">User Responsibilities</h2>
        <p className="mb-md">
          You agree to use this site for personal, non-commercial purposes only. You are solely responsible for ensuring that your use of the content found on third-party sites complies with the laws and regulations of your jurisdiction.
        </p>
      </div>
    </div>
  );
}
