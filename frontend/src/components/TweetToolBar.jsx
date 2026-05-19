function TweetToolbar({ filters, onChange, onClear, loading }) {
  function updateField(field, value) {
    onChange({
      ...filters,
      [field]: value,
    });
  }

  return (
    <form className="tweet-toolbar" onSubmit={(event) => event.preventDefault()}>
      <input
        type="search"
        value={filters.search}
        onChange={(event) => updateField("search", event.target.value)}
        placeholder="Search content"
        //disabled={loading}
      />

      <input
        type="search"
        value={filters.handle}
        onChange={(event) => updateField("handle", event.target.value)}
        placeholder="Handle"
        //disabled={loading}
      />

      <input
        type="url"
        value={filters.sourceUrl}
        onChange={(event) => updateField("sourceUrl", event.target.value)}
        placeholder="Source URL"
        //disabled={loading}
      />

      <input
        type="date"
        value={filters.fromDate}
        onChange={(event) => updateField("fromDate", event.target.value)}
        //disabled={loading}
      />

      <input
        type="date"
        value={filters.toDate}
        onChange={(event) => updateField("toDate", event.target.value)}
        //disabled={loading}
      />

      <select
        value={filters.sort}
        onChange={(event) => updateField("sort", event.target.value)}
        //disabled={loading}
      >
        <option value="latest">Latest posted</option>
        <option value="oldest">Oldest posted</option>
        <option value="recentlyCrawled">Recently crawled</option>
        <option value="oldestCrawled">Oldest crawled</option>
      </select>

      <button type="button" onClick={onClear} disabled={loading}>
        Clear
      </button>
    </form>
  );
}

export default TweetToolbar;
