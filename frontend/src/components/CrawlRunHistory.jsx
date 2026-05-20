import { useCallback, useEffect, useState } from "react";
import { listCrawlRuns } from "../api/crawlRuns.api";
import CollapsibleSection from "./CollapsibleSection";

const PAGE_SIZE = 8;

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

  return new Date(value).toLocaleString([], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPageNumbers(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);

  if (page <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }

  if (page >= totalPages - 2) {
    pages.add(totalPages - 3);
    pages.add(totalPages - 2);
    pages.add(totalPages - 1);
  }

  return [...pages]
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
    .sort((first, second) => first - second)
    .flatMap((pageNumber, index, sortedPages) => {
      if (index === 0 || pageNumber === sortedPages[index - 1] + 1) {
        return [pageNumber];
      }

      return [`gap-${pageNumber}`, pageNumber];
    });
}

function CrawlRunHistory({ refreshKey = 0 }) {
  const [runs, setRuns] = useState([]);
  const [page, setPage] = useState(1);
  const [totalRuns, setTotalRuns] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRuns = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await listCrawlRuns({
        page,
        limit: PAGE_SIZE,
      });

      setRuns(result.data);
      setTotalRuns(result.total ?? result.data.length);
      setTotalPages(Math.max(result.totalPages ?? 1, 1));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void Promise.resolve().then(loadRuns);
  }, [loadRuns, refreshKey]);

  useEffect(() => {
    setPage(1);
  }, [refreshKey]);

  const summary =
    totalRuns > 0
      ? `${totalRuns} runs - page ${page} of ${totalPages}`
      : loading
        ? "Loading runs"
        : "No recent runs";
  const pageNumbers = getPageNumbers(page, totalPages);

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
                  <dt>Matched</dt>
                  <dd>{run.matched ?? 0}</dd>
                </div>

                <div>
                  <dt>Modified</dt>
                  <dd>{run.modified ?? 0}</dd>
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

      {totalRuns > PAGE_SIZE && (
        <nav className="crawl-run-pagination" aria-label="Crawl run pages">
          <button
            type="button"
            disabled={loading || page <= 1}
            onClick={() => setPage((value) => Math.max(value - 1, 1))}
          >
            Previous
          </button>

          <div className="page-number-list">
            {pageNumbers.map((pageNumber) =>
              typeof pageNumber === "string" ? (
                <span className="page-gap" key={pageNumber}>
                  ...
                </span>
              ) : (
                <button
                  className={pageNumber === page ? "active" : ""}
                  type="button"
                  key={pageNumber}
                  disabled={loading || pageNumber === page}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            disabled={loading || page >= totalPages}
            onClick={() =>
              setPage((value) => Math.min(value + 1, totalPages))
            }
          >
            Next
          </button>
        </nav>
      )}
    </CollapsibleSection>
  );
}

export default CrawlRunHistory;
