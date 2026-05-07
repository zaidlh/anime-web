import React from 'react';

export default function DMCA() {
  return (
    <div className="max-w-3xl mx-auto px-margin-edge py-xl">
      <h1 className="font-display-lg text-[48px] font-black tracking-tighter text-on-surface mb-lg">DMCA Policy</h1>
      
      <div className="prose prose-invert prose-p:text-on-surface-variant prose-headings:text-on-surface max-w-none font-body-md">
        <p className="text-lg leading-relaxed mb-md">
          Cloudstream Catalog respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998, we will respond expeditiously to claims of copyright infringement committed using the Cloudstream Catalog website.
        </p>

        <h2 className="font-headline-md text-[24px] font-bold mt-xl mb-md border-b border-outline-variant pb-2">No Hosted Content</h2>
        <p className="mb-md">
          Cloudstream Catalog is a static indexing frontend that aggregates animated and live-action shows from remote endpoints. <strong>We do not host, store, or upload any media files on our servers.</strong> All video content is hosted by non-affiliated third-party providers. We simply provide a platform to search and index links that are already publicly available on the internet.
        </p>

        <h2 className="font-headline-md text-[24px] font-bold mt-xl mb-md border-b border-outline-variant pb-2">Takedown Requests</h2>
        <p className="mb-md">
          If you are a copyright owner, authorized to act on behalf of one, or authorized to act under any exclusive right under copyright, please report alleged copyright infringements taking place on or through the Site by sending a DMCA Notice.
        </p>
        <p className="mb-md">
          Please note that because we do not host the files, taking down a link from our index does not remove the content from the internet. You should also contact the third-party host directly to request the removal of your copyrighted material.
        </p>
      </div>
    </div>
  );
}
