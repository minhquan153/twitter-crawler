import { useState } from "react";
import { exportTweets, importTweets } from "../api/tweets.api";
import CollapsibleSection from "./CollapsibleSection";

function pad(value) {
  return String(value).padStart(2, "0");
}

function buildExportFileName() {
  const now = new Date();

  const yyyy = now.getFullYear();
  const MM = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const HH = pad(now.getHours());
  const mm = pad(now.getMinutes());

  return `tweets-export-${yyyy}${MM}${dd}-${HH}${mm}.json`;
}

function getImportItems(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return null;
}

function ImportExportPanel({ onImportComplete }) {
  const [previewCount, setPreviewCount] = useState(0);
  const [payload, setPayload] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await exportTweets();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = buildExportFileName();
      link.click();

      URL.revokeObjectURL(url);
      setMessage(`Exported ${data.total} tweets.`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(event) {
    const file = event.target.files[0];

    setPayload(null);
    setPreviewCount(0);
    setMessage("");
    setError("");

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const items = getImportItems(data);

      if (!items) {
        setError("Invalid file. JSON must be an array or { data: [...] }.");
        return;
      }

      setPayload(data);
      setPreviewCount(items.length);
      setMessage(`Ready to import ${items.length} tweets.`);
    } catch {
      setError("Invalid file. Please choose a valid JSON file.");
    }
  }

  async function handleImport() {
    if (!payload) {
      setError("Please choose a valid JSON file first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await importTweets(payload);

      setMessage(
        `Imported ${result.total} items. Inserted: ${result.inserted}, matched: ${result.matched}, modified: ${result.modified}.`
      );

      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <CollapsibleSection
      title="Import / Export"
      summary={
        previewCount > 0 ? `${previewCount} items ready` : "Backup or restore JSON"
      }
      className="import-export-panel"
    >
      <p className="section-note">Backup tweets or restore them from JSON.</p>
      <div className="import-export-actions">
        <button type="button" onClick={handleExport} disabled={loading}>
          Export JSON
        </button>

        <label className="file-import-field">
          <span>Import JSON</span>
          <input
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>

        <button
          type="button"
          onClick={handleImport}
          disabled={loading || !payload}
        >
          Import {previewCount > 0 ? `${previewCount} items` : "file"}
        </button>
      </div>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </CollapsibleSection>
  );
}

export default ImportExportPanel;
