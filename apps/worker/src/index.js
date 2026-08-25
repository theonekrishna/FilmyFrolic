const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { initScheduler } = require("./jobs/scheduler");
const { processMediaIngestion } = require("./tasks/ingestion.task");
const { processNormalization } = require("./tasks/normalization.task");
const { processDeduplication } = require("./tasks/deduplication.task");
const { processImageOptimization } = require("./tasks/imageProcessing.task");
const { processAIEnrichment } = require("./tasks/aiEnrichment.task");
const { processRecommendations } = require("./tasks/recommendation.task");
const { processNotificationDispatch } = require("./tasks/notifications.task");

console.log("⚙️  [FilmyFrolic Background Worker] Initializing background task pipeline...");

// Initialize background scheduled tasks
initScheduler();

module.exports = {
  processMediaIngestion,
  processNormalization,
  processDeduplication,
  processImageOptimization,
  processAIEnrichment,
  processRecommendations,
  processNotificationDispatch,
};
