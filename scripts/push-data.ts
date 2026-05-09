import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch, collection } from 'firebase/firestore';
import fetch from 'node-fetch';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function pushData() {
  console.log("Fetching JSON data from GitHub...");
  const [animeRes, dramaRes] = await Promise.all([
    fetch('https://raw.githubusercontent.com/zaidlh/Anime/refs/heads/main/data/animewitcher.json'),
    fetch('https://raw.githubusercontent.com/zaidlh/Anime/refs/heads/main/data/asia2tv.json')
  ]);
  
  const animeData = (await animeRes.json()) as any;
  const dramaData = (await dramaRes.json()) as any;
  
  const animes = animeData.titles || [];
  const dramas = dramaData.titles || [];
  console.log(`Found ${animes.length} Anime titles and ${dramas.length} Drama titles.`);

  const allTitles: any[] = [];

  for (const t of animes) {
    allTitles.push({
      id: t.id,
      name: t.name || '',
      english_title: t.english_title || null,
      type: t.type || null,
      poster: t.poster || null,
      story: t.story || null,
      tags: t.tags || [],
      source: 'animewitcher',
      episodesBlob: t.episodes ? JSON.stringify(t.episodes) : null,
      _docId: `animewitcher_${t.id}`
    });
  }

  for (const t of dramas) {
    let id = t.id;
    if (!id) id = t.title ? encodeURIComponent(t.title.replace(/\s+/g, '-').toLowerCase()) : 'unknown';
    // Remove dots/slashes to be a valid firestore id
    id = id.replace(/[\/\.]/g, '');
    let docId = `asia2tv_${id}`.substring(0, 128); // Respect 128 char limit in rule
    
    allTitles.push({
      id: id,
      name: t.title || '',
      english_title: null,
      type: null,
      poster: t.poster || null,
      story: t.plot || null,
      tags: t.tags || [],
      source: 'asia2tv',
      episodesBlob: t.episodes ? JSON.stringify(t.episodes) : null,
      _docId: docId
    });
  }

  console.log(`Total documents to push: ${allTitles.length}`);

  const colRef = collection(db, 'titles');
  let currentBatch = writeBatch(db);
  let batchCount = 0;
  let totalCommitted = 0;

  for (let i = 0; i < allTitles.length; i++) {
    const item = allTitles[i];
    const docId = item._docId;
    delete item._docId;

    let episodes = [];
    if (item.episodesBlob) {
      episodes = JSON.parse(item.episodesBlob);
    }
    
    // If episodes are huge, don't store them in the parent document to avoid 1MB limit.
    // Instead we will store them in a subcollection.
    item.episodesBlob = null; // Don't store in parent

    const docRef = doc(colRef, docId);
    currentBatch.set(docRef, item);
    batchCount++;

    // Chunk episodes into arrays of 25 and write to subcollection
    const chunkSize = 25;
    for (let c = 0; c < episodes.length; c += chunkSize) {
      const chunk = episodes.slice(c, c + chunkSize);
      const chunkRef = doc(collection(docRef, 'episodesChunks'), `chunk_${Math.floor(c/chunkSize)}`);
      currentBatch.set(chunkRef, { chunk: JSON.stringify(chunk), index: Math.floor(c/chunkSize) });
      batchCount++;
      
      if (batchCount >= 490) {
        await currentBatch.commit();
        totalCommitted += batchCount;
        console.log(`Committed ${totalCommitted} documents so far...`);
        currentBatch = writeBatch(db);
        batchCount = 0;
      }
    }

    if (batchCount >= 490 || i === allTitles.length - 1) {
      await currentBatch.commit();
      totalCommitted += batchCount;
      console.log(`Committed ${totalCommitted} documents so far...`);
      currentBatch = writeBatch(db);
      batchCount = 0;
    }
  }

  console.log(`Finished pushing ${totalCommitted} documents to Firestore!`);
}

pushData()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Error pushing data:", err);
    process.exit(1);
  });
