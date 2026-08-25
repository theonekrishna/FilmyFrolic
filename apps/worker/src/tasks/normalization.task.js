/**
 * Metadata Normalization Task
 * Transforms raw third-party DTO payloads into FilmyFrolic canonical entities.
 */
async function processNormalization(rawPayload = {}) {
  console.log(`[Worker:Normalization] Normalizing raw payload:`, rawPayload.id);

  return {
    success: true,
    canonicalEntity: {
      title: rawPayload.title || rawPayload.name || "Untitled",
      release_date: rawPayload.release_date || null,
      overview: rawPayload.overview || "",
      normalizedAt: new Date().toISOString(),
    },
  };
}

module.exports = { processNormalization };
