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
 * Interleaves pitch reel items and post items so both appear mixed together throughout the feed.
 */
function interleaveFeedItems(pitches, posts) {
  if (!posts || posts.length === 0) return shuffleArray(pitches);
  if (!pitches || pitches.length === 0) return shuffleArray(posts);

  const shuffledPitches = shuffleArray(pitches);
  const shuffledPosts = shuffleArray(posts);
  const result = [];

  const totalPitches = shuffledPitches.length;
  const totalPosts = shuffledPosts.length;
  
  // Calculate ratio so posts and pitches are evenly distributed
  const ratio = Math.max(1, Math.floor(totalPitches / totalPosts));
  let postIdx = 0;
  let pitchIdx = 0;

  while (pitchIdx < totalPitches || postIdx < totalPosts) {
    for (let k = 0; k < ratio && pitchIdx < totalPitches; k++) {
      result.push(shuffledPitches[pitchIdx++]);
    }
    if (postIdx < totalPosts) {
      result.push(shuffledPosts[postIdx++]);
    }
  }

  return result;
}

/**
 * Combines pitch reels and post cards into a single feed.
 * If existingFeedItems is provided, it updates items in-place to preserve established card positions,
 * eliminating visual flickering and layout jumps.
 */
export function buildRandomizedFeed(pitchList = [], postList = [], pinnedUploads = [], existingFeedItems = null) {
  const pitchItems = (pitchList || []).map(p => ({ itemType: 'pitch', id: `pitch-${p.id}`, data: p }));
  const postItems = (postList || []).map(p => ({ itemType: 'post', id: `post-${p.id}`, data: p }));

  const pitchItemsMap = new Map(pitchItems.map(p => [p.id, p.data]));
  const postItemsMap = new Map(postItems.map(p => [p.id, p.data]));

  // In-place update if existingFeedItems exist to prevent flickering
  if (Array.isArray(existingFeedItems) && existingFeedItems.length > 0) {
    const updatedFeed = [];
    const seenIds = new Set();

    // Preserve pinned uploads
    (pinnedUploads || []).forEach(pinned => {
      updatedFeed.push(pinned);
      seenIds.add(pinned.id);
    });

    // Update existing items in their exact established positions
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

    // Append any newly discovered items (interleaved)
    const newPitches = pitchItems.filter(p => !seenIds.has(p.id));
    const newPosts = postItems.filter(p => !seenIds.has(p.id));

    if (newPitches.length > 0 || newPosts.length > 0) {
      const newInterleaved = interleaveFeedItems(newPitches, newPosts);
      updatedFeed.push(...newInterleaved);
    }

    return updatedFeed;
  }

  // Initial cold load: generate a fresh interleaved feed
  const interleaved = interleaveFeedItems(pitchItems, postItems);
  const pinnedIds = new Set((pinnedUploads || []).map(item => item.id));
  const filteredInterleaved = interleaved.filter(item => !pinnedIds.has(item.id));

  return [...(pinnedUploads || []), ...filteredInterleaved];
}
