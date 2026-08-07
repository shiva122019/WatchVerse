/**
 * Karaoke Backing Tracks Map
 * 
 * Maps song titles (lowercase, normalized) to their Cloudinary-hosted audio URLs.
 * Add new songs here as they are uploaded to Cloudinary.
 * 
 * Format:
 * "song title keyword" : "cloudinary_url"
 */

const KARAOKE_TRACKS = {
  // English
  "closer":   "https://res.cloudinary.com/f0e9lhwk/video/upload/v1786019642/karaoke_tracks/closer.mp3",
  "memories": "https://res.cloudinary.com/f0e9lhwk/video/upload/v1786021456/karaoke_tracks/memories.mp3",

  // Hindi / Hindustani
  "aarzu":              "https://res.cloudinary.com/f0e9lhwk/video/upload/v1786021240/karaoke_tracks/aarzu.mp3",
  "bairan":             "https://res.cloudinary.com/f0e9lhwk/video/upload/v1786021252/karaoke_tracks/bairan.mp3",
  "apna bana le":       "https://res.cloudinary.com/f0e9lhwk/video/upload/v1786021314/karaoke_tracks/apna_bana_le.mp3",
  "tujhe kitna chahne": "https://res.cloudinary.com/f0e9lhwk/video/upload/v1786021384/karaoke_tracks/tujhe_kitna_chahne_lage.mp3",
  "arz kiya":           "https://res.cloudinary.com/f0e9lhwk/video/upload/v1786021420/karaoke_tracks/arz_kiya_hai.mp3",
};

/**
 * Finds a backing track URL by song title.
 * Does a fuzzy/partial match so "The Chainsmokers - Closer" also matches "closer".
 * 
 * @param {string} title - The song title to look up
 * @returns {string|null} - The Cloudinary URL, or null if not found
 */
function getBackingTrack(title) {
  if (!title) return null;
  const lower = title.toLowerCase();
  
  for (const [key, url] of Object.entries(KARAOKE_TRACKS)) {
    if (lower.includes(key)) {
      return url;
    }
  }
  
  return null;
}

module.exports = { KARAOKE_TRACKS, getBackingTrack };
