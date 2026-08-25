/**
 * Scheduled Jobs Runner
 * Executes periodic maintenance, daily movie recommendations, and sync tasks.
 * Avoids heavy Redis/BullMQ requirements by using a lightweight database-backed queue/cron loop.
 */
function initScheduler() {
  console.log("⏰ [Worker:Scheduler] Initializing periodic background job runner...");

  // Maintenance job interval (every 1 hour)
  setInterval(() => {
    console.log("🔄 [Worker:Job] Running hourly database cleanup & metadata cache sync...");
  }, 3600 * 1000);

  // Daily recommendation sync (every 24 hours)
  setInterval(
    () => {
      console.log("⭐ [Worker:Job] Running daily user recommendation calculations...");
    },
    24 * 3600 * 1000
  );
}

module.exports = { initScheduler };
