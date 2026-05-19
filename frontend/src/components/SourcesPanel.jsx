import { useCallback, useEffect, useState } from "react";
import {
  createSource,
  deleteSource,
  listSources,
  runSourceNow,
  updateSource,
} from "../api/sources.api";
import CollapsibleSection from "./CollapsibleSection";

function formatDate(value) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatNextRun(source) {
  if (!source.enabled) {
    return "Paused";
  }

  if (!source.nextRunAt) {
    return "Not scheduled";
  }

  const nextRun = new Date(source.nextRunAt);

  if (Number.isNaN(nextRun.getTime())) {
    return source.nextRunAt;
  }

  if (nextRun <= new Date()) {
    return "Due now";
  }

  return formatDate(source.nextRunAt);
}

function SourcesPanel({ refreshKey = 0, onChange }) {
  const [sources, setSources] = useState([]);
  const [url, setUrl] = useState("");
  const [intervalMinutes, setIntervalMinutes] = useState(30);
  const [editingIntervalId, setEditingIntervalId] = useState("");
  const [intervalDraft, setIntervalDraft] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");

  const loadSources = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await listSources();
      setSources(result.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadSources);
  }, [loadSources, refreshKey]);

  function notifyChange() {
    if (onChange) {
      onChange();
    }
  }

  async function handleCreateSource(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await createSource({
        url,
        intervalMinutes: Number(intervalMinutes),
        enabled: true,
      });

      setUrl("");
      setIntervalMinutes(30);
      setShowCreateForm(false);
      await loadSources();
      notifyChange();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function runAction(id, action) {
    setActionId(id);
    setError("");

    try {
      await action();
      await loadSources();
      notifyChange();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionId("");
    }
  }

  function handleToggleEnabled(source) {
    runAction(source._id, () =>
      updateSource(source._id, {
        enabled: !source.enabled,
      }),
    );
  }

  function handleRunNow(source) {
    runAction(source._id, () => runSourceNow(source._id));
  }

  function startEditInterval(source) {
    setEditingIntervalId(source._id);
    setIntervalDraft(String(source.intervalMinutes));
  }

  function cancelEditInterval() {
    setEditingIntervalId("");
    setIntervalDraft("");
  }

  function saveInterval(source) {
    const nextInterval = Number(intervalDraft);

    if (!Number.isInteger(nextInterval) || nextInterval < 1) {
      return;
    }

    runAction(source._id, async () => {
      await updateSource(source._id, {
        intervalMinutes: nextInterval,
      });

      setEditingIntervalId("");
      setIntervalDraft("");
    });
  }

  function handleDeleteSource(source) {
    const confirmed = window.confirm(`Delete source ${source.url}?`);

    if (!confirmed) {
      return;
    }

    runAction(source._id, () => deleteSource(source._id));
  }

  return (
    <CollapsibleSection
      title="Auto Crawl Sources"
      summary={`${sources.length} saved - ${
        sources.filter((source) => source.enabled).length
      } enabled`}
      className="sources-panel"
      defaultOpen
    >
      <p className="section-note">Add, schedule, pause, and run saved sources.</p>

      <button
        className="secondary-action"
        type="button"
        onClick={() => setShowCreateForm((value) => !value)}
      >
        {showCreateForm ? "Hide form" : "+ Add source"}
      </button>

      {showCreateForm && (
        <form className="source-create-form" onSubmit={handleCreateSource}>
          <label className="source-create-field">
            <span>Source URL</span>
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://x.com/username"
              disabled={loading}
              required
            />
          </label>

          <label className="source-create-field">
            <span>Every minutes</span>
            <input
              type="number"
              min="1"
              max="1440"
              value={intervalMinutes}
              onChange={(event) => setIntervalMinutes(event.target.value)}
              disabled={loading}
            />
          </label>

          <button type="submit" disabled={loading || !url.trim()}>
            Add Source
          </button>
        </form>
      )}

      {error && <p className="error-message">{error}</p>}

      <div className="source-list">
        {sources.length === 0 && (
          <p className="empty-state">No sources configured.</p>
        )}

        {sources.map((source) => {
          const busy = actionId === source._id;
          const editingInterval = editingIntervalId === source._id;

          return (
            <details className="source-card" key={source._id}>
              <summary className="source-card-summary">
                <span className="source-url-compact">{source.url}</span>
                <span className={source.enabled ? "badge on" : "badge off"}>
                  {source.enabled ? "Enabled" : "Paused"}
                </span>
                <span className={`badge status-${source.lastStatus}`}>
                  {source.lastStatus}
                </span>
              </summary>

              <div className="source-main">
                <dl className="source-meta">
                  <div>
                    <dt>Last crawled</dt>
                    <dd>{formatDate(source.lastCrawledAt)}</dd>
                  </div>

                  <div>
                    <dt>Next run</dt>
                    <dd>{formatNextRun(source)}</dd>
                  </div>

                  <div>
                    <dt>Last error</dt>
                    <dd>{source.lastError || "None"}</dd>
                  </div>
                </dl>

                <div className="source-actions">
                  <div className="source-interval">
                    {editingInterval ? (
                      <>
                        <label>
                          <span>Interval minutes</span>
                          <input
                            type="number"
                            min="1"
                            max="1440"
                            value={intervalDraft}
                            disabled={busy}
                            onChange={(event) =>
                              setIntervalDraft(event.target.value)
                            }
                          />
                        </label>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => saveInterval(source)}
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={cancelEditInterval}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <p>Interval: every {source.intervalMinutes} minutes</p>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => startEditInterval(source)}
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={busy || !source.enabled}
                    onClick={() => handleRunNow(source)}
                  >
                    {busy
                      ? "Working..."
                      : source.enabled
                        ? "Run now"
                        : "Paused"}
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleToggleEnabled(source)}
                  >
                    {source.enabled ? "Pause" : "Resume"}
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDeleteSource(source)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}

export default SourcesPanel;
