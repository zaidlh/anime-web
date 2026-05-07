import React from 'react';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-margin-edge py-xl">
      <h1 className="font-display-lg text-[48px] font-black tracking-tighter text-on-surface mb-lg">Privacy Policy</h1>
      
      <div className="prose prose-invert prose-p:text-on-surface-variant prose-headings:text-on-surface max-w-none font-body-md">
        <p className="text-lg leading-relaxed mb-md">
          At Cloudstream Catalog, accessible from our website, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Cloudstream Catalog and how we use it.
        </p>

        <h2 className="font-headline-md text-[24px] font-bold mt-xl mb-md border-b border-outline-variant pb-2">Information Collection</h2>
        <p className="mb-md">
          We operate as a static, client-side application. We do not require users to create accounts, and we do not collect personally identifiable information such as names, email addresses, or phone numbers. Any settings or preferences you save (like your "My List" or "Settings") are stored locally on your device within your browser's local storage and are never transmitted to our servers.
        </p>

        <h2 className="font-headline-md text-[24px] font-bold mt-xl mb-md border-b border-outline-variant pb-2">Third-Party Services</h2>
        <p className="mb-md">
          Please note that when you view videos or follow links, you are accessing content hosted on third-party domains. These external sites may use cookies, collect data, or employ their own tracking technologies according to their respective privacy policies. 
        </p>
      </div>
    </div>
  );
}
