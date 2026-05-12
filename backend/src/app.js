const express = require("express");
const corsMiddleware = require("./middleware/cors.middleware");
const tweetRoutes = require("./routes/tweet.routes");
const sourceRoutes = require("./routes/source.routes");
const crawlRoutes = require("./routes/crawl.routes");
const statsRoutes = require("./routes/stats.routes");
const crawlRunRoutes = require("./routes/crawlRun.routes");

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.use("/api/tweets", tweetRoutes);
app.use("/api/sources", sourceRoutes);
app.use("/api/crawl", crawlRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/crawl-runs", crawlRunRoutes);

module.exports = app;
