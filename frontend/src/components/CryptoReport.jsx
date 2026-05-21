import { useCallback, useEffect, useState } from "react";
import { getCryptoReport } from "../api/cryptoReport.api";
import CollapsibleSection from "./CollapsibleSection";

function formatNumber(value, digits = 2) {
  return Number(value || 0).toFixed(digits);
}

function CryptoReport({ refreshKey = 0 }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getCryptoReport();
      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadReport);
  }, [loadReport, refreshKey]);

  const summary = loading
    ? "Loading crypto sentiment"
    : `${rows.length} tracked coins`;

  return (
    <CollapsibleSection
      title="Crypto Sentiment Report"
      summary={summary}
      className="crypto-report"
    >
      {error && <p className="error-message">{error}</p>}

      <div className="report-table-wrap">
        <table className="report-table">
          <thead>
            <tr>
              <th>Coin</th>
              <th>Total</th>
              <th>Positive</th>
              <th>Negative</th>
              <th>Neutral</th>
              <th>Unknown</th>
              <th>Main Sentiment</th>
              <th>Score</th>
              <th>Hot Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.asset}>
                <td>{row.asset}</td>
                <td>{row.total}</td>
                <td>{row.positive}</td>
                <td>{row.negative}</td>
                <td>{row.neutral}</td>
                <td>{row.unknown}</td>
                <td>
                  <span className={`sentiment-badge ${row.mainSentiment}`}>
                    {row.mainSentiment}
                  </span>
                </td>
                <td>{formatNumber(row.sentimentScore)}</td>
                <td>{formatNumber(row.hotScore)}</td>
              </tr>
            ))}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan="9">No crypto assets found in saved tweets.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </CollapsibleSection>
  );
}

export default CryptoReport;
