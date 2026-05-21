import TweetCard from "./TweetCard";

function TweetList({
  tweets,
  loading,
  onDelete,
  selectedIds,
  onSelectChange,
}) {
  if (loading && tweets.length === 0) {
    return <p className="empty-state">Loading tweets...</p>;
  }

  if (tweets.length === 0) {
    return <p className="empty-state">No tweets found.</p>;
  }

  return (
    <div className="tweet-list">
      {tweets.map((tweet) => (
        <TweetCard
          key={tweet._id}
          tweet={tweet}
          onDelete={onDelete}
          selected={selectedIds.has(tweet._id)}
          onSelectChange={onSelectChange}
        />
      ))}
    </div>
  );
}

export default TweetList;
