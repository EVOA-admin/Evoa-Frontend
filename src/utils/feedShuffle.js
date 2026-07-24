/**
 * Fisher-Yates Shuffle Algorithm
 * Randomizes an array with O(N) linear complexity.
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Combines pitch reels and post cards into a single array and shuffles them randomly.
 * If existingFeedItems are provided (e.g. during a session update), it updates items in-place
 * to preserve card positions and completely prevent layout flicker or position jumps.
 */
export function buildRandomizedFeed(pitchList = [], postList = [], pinnedUploads = [], existingFeedItems = null) {
  const pitchItemsMap = new Map((pitchList || []).map(p => [`pitch-${p.id}`, p]));
  const postItemsMap = new Map((postList || []).map(p => [`post-${p.id}`, p]));

  // If we already have feed items in the active session, update them in-place
  if (Array.isArray(existingFeedItems) && existingFeedItems.length > 0) {
    const updatedFeed = [];
    const seenIds = new Set();

    // Preserve pinned uploads at top
    (pinnedUploads || []).forEach(pinned => {
      updatedFeed.push(pinned);
      seenIds.add(pinned.id);
    });

    // Update existing items in their established positions
    existingFeedItems.forEach(item => {
      if (seenIds.has(item.id)) return;

      if (item.itemType === 'pitch') {
        const freshData = pitchItemsMap.get(item.id);
        if (freshData) {
          updatedFeed.push({ ...item, data: freshData });
          seenIds.add(item.id);
        }
      } else if (item.itemType === 'post') {
        const freshData = postItemsMap.get(item.id);
        if (freshData) {
          updatedFeed.push({ ...item, data: freshData });
          seenIds.add(item.id);
        }
      }
    });

    // Append any new items not yet present in existingFeedItems
    const newItems = [];
    (pitchList || []).forEach(p => {
      const id = `pitch-${p.id}`;
      if (!seenIds.has(id)) {
        newItems.push({ itemType: 'pitch', id, data: p });
        seenIds.add(id);
      }
    });
    (postList || []).forEach(p => {
      const id = `post-${p.id}`;
      if (!seenIds.has(id)) {
        newItems.push({ itemType: 'post', id, data: p });
        seenIds.add(id);
      }
    });

    if (newItems.length > 0) {
      updatedFeed.push(...shuffleArray(newItems));
    }

    return updatedFeed;
  }

  // Initial page load / fresh refresh: generate a new randomized feed
  const pitchItems = (pitchList || []).map(p => ({ itemType: 'pitch', id: `pitch-${p.id}`, data: p }));
  const postItems = (postList || []).map(p => ({ itemType: 'post', id: `post-${p.id}`, data: p }));

  const combined = [...pitchItems, ...postItems];
  const shuffled = shuffleArray(combined);

  const pinnedIds = new Set((pinnedUploads || []).map(item => item.id));
  const filteredShuffled = shuffled.filter(item => !pinnedIds.has(item.id));

  return [...(pinnedUploads || []), ...filteredShuffled];
}

