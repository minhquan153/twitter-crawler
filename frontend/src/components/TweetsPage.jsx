import { useCallback, useEffect, useState } from "react";
import { deleteTweet, listTweets } from "../api/tweets.api";
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
  }

  function handleClearFilters() {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
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

      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      setError(error.message);
    }
  }

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
              <p>{result.total} saved tweets</p>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <TweetList
            tweets={result.data}
            loading={loading}
            onDelete={handleDeleteTweet}
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
