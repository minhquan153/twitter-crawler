function formatDate(value) {
  if (!value) {
    return "Unknown time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function TweetCard({ tweet, onDelete }) {
  return (
    <article className="tweet-card">
      <div className="tweet-card-header">
        <div>
          <h3>{tweet.name || "Unknown author"}</h3>
          <p>{tweet.handle || "No handle"}</p>
        </div>

        <button type="button" onClick={() => onDelete(tweet._id)}>
          Delete
        </button>
      </div>

      <p className="tweet-content">{tweet.content}</p>

      <dl className="tweet-meta">
        <div>
          <dt>Posted</dt>
          <dd>{formatDate(tweet.postedAt) || tweet.time}</dd>
        </div>

        <div>
          <dt>Source</dt>
          <dd>{tweet.sourceUrl || "Unknown source"}</dd>
        </div>

        {tweet.tweetUrl && (
          <div>
            <dt>Tweet</dt>
            <dd>
              <a href={tweet.tweetUrl} target="_blank" rel="noreferrer">
                Open
              </a>
            </dd>
          </div>
        )}
      </dl>
    </article>
  );
}

export default TweetCard;
