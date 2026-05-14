import { useState } from "react";
import { crawlX } from "../api/crawl.api";

const DEFAULT_URL = "https://x.com/home";

function CrawlForm({ onSuccess }) {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [showCustomUrl, setShowCustomUrl] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  async function runCrawl(targetUrl) {
    setLoading(true);
    setError("");
    setSummary(null);

    try {
      const result = await crawlX(targetUrl);
      setSummary(result.data);

      if (onSuccess) {
        onSuccess();
      }

      alert("Crawl completed");
    } catch (error) {
      setError(error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCrawl() {
    runCrawl(url);
  }

  return (
    <section className="crawl-form">
      <div className="crawl-header">
        <div>
          <h2>Manual Crawl</h2>
          <p>Run a manual crawl from your X session.</p>
        </div>

        <div className="crawl-actions">
          <button type="button" onClick={handleCrawl} disabled={loading}>
            {loading ? "Crawling..." : "Crawl X"}
          </button>

          <button
            type="button"
            className="link-button"
            onClick={() => setShowCustomUrl((value) => !value)}
          >
            {showCustomUrl ? "Hide custom source" : "Custom source"}
          </button>

          {showCustomUrl && (
            <div className="crawl-row">
              <input
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://x.com/home"
                disabled={loading}
                required
              />
            </div>
          )}
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      {summary && (
        <div className="crawl-summary">
          <span>Crawled: {summary.crawled}</span>
          <span>Inserted: {summary.inserted}</span>
          <span>Matched: {summary.matched}</span>
          <span>Modified: {summary.modified}</span>
        </div>
      )}
    </section>
  );
}

export default CrawlForm;
