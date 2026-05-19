import TweetCard from "./TweetCard";

function TweetList({ tweets, loading, onDelete }) {
  if (loading && tweets.length === 0) {
    return <p className="empty-state">Loading tweets...</p>;
  }

  if (tweets.length === 0) {
    return <p className="empty-state">No tweets found.</p>;
  }

  return (
    <div className="tweet-list">
      {tweets.map((tweet) => (
        <TweetCard key={tweet._id} tweet={tweet} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default TweetList;
