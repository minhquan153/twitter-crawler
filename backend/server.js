require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");
const { startCrawlScheduler } = require("./src/scheduler/crawlScheduler");

const PORT = process.env.PORT || 6700;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
    startCrawlScheduler();
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
