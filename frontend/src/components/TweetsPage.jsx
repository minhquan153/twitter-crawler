import { useCallback, useEffect, useState } from "react";
import {
  deleteAllTweets,
  deleteTweet,
  deleteTweets,
  listTweets,
} from "../api/tweets.api";
import Pagination from "./Pagination";
import TweetList from "./TweetList";
import TweetToolbar from "./TweetToolBar";

const DEFAULT_FILTERS = {
  search: "",
  handle: "",
  sourceUrl: "",
  fromDate: "",
  toDate: "",
  sort: "latest",
};

function TweetsPage({
  refreshKey = 0,
  crawlPanel,
  overviewPanel,
  onDataChange,
}) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [result, setResult] = useState({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const loadTweets = useCallback(async () => {
    const params = {
      page,
      limit,
      sort: filters.sort,
    };

    for (const key of ["search", "handle", "sourceUrl", "fromDate", "toDate"]) {
      if (filters[key]) {
        params[key] = filters[key];
      }
    }

    setLoading(true);
    setError("");

    try {
      const data = await listTweets(params);
      setResult(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    void Promise.resolve().then(loadTweets);
  }, [loadTweets, refreshKey]);

  function handleFilterChange(nextFilters) {
    setFilters(nextFilters);
    setPage(1);
    setSelectedIds(new Set());
  }

  function handleClearFilters() {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    setSelectedIds(new Set());
  }

  function handleSelectTweet(id, checked) {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (checked) {
        nextIds.add(id);
      } else {
        nextIds.delete(id);
      }

      return nextIds;
    });
  }

  function handleSelectCurrentPage(checked) {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      for (const tweet of result.data) {
        if (checked) {
          nextIds.add(tweet._id);
        } else {
          nextIds.delete(tweet._id);
        }
      }

      return nextIds;
    });
  }

  async function handleDeleteSelected() {
    const ids = [...selectedIds];
    const confirmed = window.confirm(`Delete ${ids.length} selected tweets?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteTweets(ids);
      setSelectedIds(new Set());

      if (result.data.length <= ids.length && page > 1) {
        setPage((value) => value - 1);
      } else {
        loadTweets();
      }

      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      setError(error.message);
    }
  }

  function getActiveDeleteFilters() {
    const activeFilters = {};

    for (const key of ["search", "handle", "sourceUrl", "fromDate", "toDate"]) {
      if (filters[key]) {
        activeFilters[key] = filters[key];
      }
    }

    return activeFilters;
  }

  async function handleDeleteAll() {
    const activeFilters = getActiveDeleteFilters();
    const hasFilters = Object.keys(activeFilters).length > 0;
    const targetText = hasFilters
      ? `${result.total} tweets matching current filters`
      : `all ${result.total} saved tweets`;
    const confirmed = window.confirm(`Delete ${targetText}?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteAllTweets(activeFilters);
      setSelectedIds(new Set());
      setPage(1);
      loadTweets();

      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleDeleteTweet(id) {
    const confirmed = window.confirm("Delete this tweet?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteTweet(id);

      if (result.data.length === 1 && page > 1) {
        setPage((value) => value - 1);
      } else {
        loadTweets();
      }

      setSelectedIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(id);
        return nextIds;
      });

      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      setError(error.message);
    }
  }

  const currentPageIds = result.data.map((tweet) => tweet._id);
  const selectedOnPage = currentPageIds.filter((id) => selectedIds.has(id));
  const allCurrentPageSelected =
    currentPageIds.length > 0 && selectedOnPage.length === currentPageIds.length;

  return (
    <section className="dashboard-grid">
      <div className="main-column">
        {overviewPanel}

        <section className="config-panel">
          <div className="tool-panel-heading">
            <div>
              <h2>Config Tweets</h2>
              <p>Search, filter, and sort saved tweets.</p>
            </div>
          </div>

          <TweetToolbar
            filters={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
            loading={loading}
          />
        </section>

        <section className="tweets-page">
          <div className="section-heading">
            <div>
              <h2>Tweets</h2>
              <p>
                {result.total} saved tweets
                {selectedIds.size > 0 ? ` - ${selectedIds.size} selected` : ""}
              </p>
            </div>

            <div className="tweet-selection-actions">
              <label className="tweet-select-all">
                <input
                  type="checkbox"
                  checked={allCurrentPageSelected}
                  disabled={loading || currentPageIds.length === 0}
                  onChange={(event) => handleSelectCurrentPage(event.target.checked)}
                />
                <span>Select page</span>
              </label>

              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={loading || selectedIds.size === 0}
              >
                Delete selected
              </button>

              <button
                type="button"
                onClick={handleDeleteAll}
                disabled={loading || result.total === 0}
              >
                Delete all
              </button>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <TweetList
            tweets={result.data}
            loading={loading}
            onDelete={handleDeleteTweet}
            selectedIds={selectedIds}
            onSelectChange={handleSelectTweet}
          />

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onPageChange={setPage}
            disabled={loading}
          />
        </section>
      </div>

      {crawlPanel}
    </section>
  );
}

export default TweetsPage;
