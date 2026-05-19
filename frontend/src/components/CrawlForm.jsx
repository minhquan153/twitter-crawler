import { useState } from "react";
import { crawlX } from "../api/crawl.api";
import CollapsibleSection from "./CollapsibleSection";

const DEFAULT_URL = "https://x.com/home";

function CrawlForm({ onSuccess }) {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  async function runCrawl() {
    setLoading(true);
    setError("");
    setSummary(null);

    try {
      const result = await crawlX(url);
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

  return (
    <CollapsibleSection
      title="Crawl Link"
      summary={url}
      className="manual-crawl"
      actions={
        <button type="button" onClick={runCrawl} disabled={loading}>
          {loading ? "Crawling..." : "Crawl X"}
        </button>
      }
    >
      <p className="section-note">Run a manual crawl from your X session.</p>

      <label className="crawl-field">
        <span>Custom source</span>
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://x.com/home"
          disabled={loading}
          required
        />
      </label>

      {error && <p className="error-message">{error}</p>}

      {summary && (
        <div className="crawl-summary">
          <span>Crawled: {summary.crawled}</span>
          <span>Inserted: {summary.inserted}</span>
          <span>Matched: {summary.matched}</span>
          <span>Modified: {summary.modified}</span>
        </div>
      )}
    </CollapsibleSection>
  );
}

export default CrawlForm;
