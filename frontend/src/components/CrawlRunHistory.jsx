import { useCallback, useEffect, useState } from "react";
import { listCrawlRuns } from "../api/crawlRuns.api";
import CollapsibleSection from "./CollapsibleSection";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

function formatTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CrawlRunHistory({ refreshKey = 0 }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRuns = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await listCrawlRuns({
        page: 1,
        limit: 8,
      });

      setRuns(result.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadRuns);
  }, [loadRuns, refreshKey]);

  const summary =
    runs.length > 0
      ? `${runs.length} recent runs - latest: ${runs[0].status}`
      : loading
        ? "Loading recent runs"
        : "No recent runs";

  return (
    <CollapsibleSection
      title="Crawl History"
      summary={summary}
      className="crawl-history"
    >
      <p className="section-note">Recent manual and automatic crawl runs.</p>

      {error && <p className="error-message">{error}</p>}

      {runs.length === 0 && !loading ? (
        <div className="empty-state">No crawl runs yet.</div>
      ) : (
        <div className="crawl-run-list">
          {runs.map((run) => (
            <details className="crawl-run-card" key={run._id}>
              <summary className="crawl-run-summary">
                <span className={`badge status-${run.status}`}>
                  {run.status}
                </span>
                <span>{run.runType}</span>
                <span className="crawl-run-url">{run.url}</span>
                <span>{run.crawled ?? 0} crawled</span>
                <span>{formatTime(run.startedAt)}</span>
              </summary>

              <dl className="crawl-run-meta">
                <div>
                  <dt>Crawled</dt>
                  <dd>{run.crawled ?? 0}</dd>
                </div>

                <div>
                  <dt>Inserted</dt>
                  <dd>{run.inserted ?? 0}</dd>
                </div>

                <div>
                  <dt>Error</dt>
                  <dd>{run.error || "-"}</dd>
                </div>

                <div>
                  <dt>Started</dt>
                  <dd>{formatDate(run.startedAt)}</dd>
                </div>
              </dl>
            </details>
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
}

export default CrawlRunHistory;
