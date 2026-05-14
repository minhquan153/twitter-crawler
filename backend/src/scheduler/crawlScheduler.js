const sourceService = require("../services/source.service");
const crawlService = require("../services/crawl.service");

let timer = null;
let running = false;

async function tick() {
  if (running) {
    console.log("[scheduler] Previous tick still running, skipped");
    return;
  }

  running = true;

  try {
    const sources = await sourceService.getDueSources();

    if (sources.length === 0) {
      return;
    }

    for (const source of sources) {
      try {
        console.log(`[scheduler] Crawling source: ${source.url}`);

        await crawlService.runSourceCrawl(source);

        console.log(`[scheduler] Crawl success: ${source.url}`);
      } catch (error) {
        console.error(`[scheduler] Crawl failed: ${source.url}`, error.message);
      }
    }
  } catch (error) {
    console.error("[scheduler] Tick failed:", error.message);
  } finally {
    running = false;
  }
}

function startCrawlScheduler() {
  const enabled = process.env.CRAWL_SCHEDULER_ENABLED === "true";
  if (!enabled) {
    console.log("[scheduler] Crawl scheduler disabled");
    return;
  }
  const intervalMs = Number(process.env.CRAWL_SCHEDULER_INTERVAL_MS || 60000);

  if (!Number.isInteger(intervalMs) || intervalMs < 1000) {
    throw new Error("CRAWL_SCHEDULER_INTERVAL_MS must be at least 1000");
  }

  if (timer) {
    return;
  }

  console.log(`[scheduler] Crawl scheduler started, interval=${intervalMs}ms`);

  tick();

  timer = setInterval(tick, intervalMs);
}

function stopCrawlScheduler() {
  if (!timer) {
    return;
  }

  clearInterval(timer);
  timer = null;

  console.log("[scheduler] Crawl scheduler stopped");
}

module.exports = {
  startCrawlScheduler,
  stopCrawlScheduler,
};
