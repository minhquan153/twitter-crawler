import { useCallback, useEffect, useState } from "react";
import { getStatsOverview } from "../api/stats.api";
import CollapsibleSection from "./CollapsibleSection";

function formatDate(value) {
  if (!value) {
    return "No runs yet";
  }

  return new Date(value).toLocaleString();
}

function StatsCards({ refreshKey = 0 }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    setError("");

    try {
      const data = await getStatsOverview();
      setStats(data);
    } catch (error) {
      setError(error.message);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadStats);
  }, [loadStats, refreshKey]);

  const summary = stats
    ? `${stats.totalTweets} tweets - ${stats.enabledSources} sources - ${stats.errorRuns} errors - last: ${stats.lastRun?.status ?? "none"}`
    : "Loading overview";

  return (
    <CollapsibleSection
      title="Stats"
      summary={summary}
      className="stats-panel"
    >
      <p className="section-note">Overview of saved tweets and crawl activity.</p>

      {error && <p className="error-message">{error}</p>}

      <div className="stats-grid">
        <article className="stat-card">
          <span>Total tweets</span>
          <strong>{stats?.totalTweets ?? 0}</strong>
        </article>

        <article className="stat-card">
          <span>Enabled sources</span>
          <strong>{stats?.enabledSources ?? 0}</strong>
        </article>

        <article className="stat-card">
          <span>Error runs</span>
          <strong>{stats?.errorRuns ?? 0}</strong>
        </article>

        <article className="stat-card">
          <span>Last run</span>
          <strong>{stats?.lastRun?.status ?? "none"}</strong>
          <small>{formatDate(stats?.lastRun?.startedAt)}</small>
        </article>
      </div>
    </CollapsibleSection>
  );
}

export default StatsCards;
