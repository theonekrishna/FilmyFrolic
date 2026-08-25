// src/modules/gossips/gossip.helpers.js

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

function formatGossip(row) {
  return {
    id: row.id,
    headline: row.headline,
    excerpt: row.excerpt,
    source: row.source,
    timeAgo: timeAgo(row.created_at),
    category: row.category,
    verified: row.verified,
    image: row.image_url ?? undefined,
    fire: Number(row.fire_count),
    shocked: Number(row.shocked_count),
    comments: Number(row.comments_count),
    bookmarked: row.bookmarked ?? false,
    tags: row.tags ?? [],
    userFired: row.user_fired ?? false,
    userShocked: row.user_shocked ?? false,
  };
}

module.exports = { timeAgo, formatGossip };
