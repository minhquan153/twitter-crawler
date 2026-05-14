import "./App.css";
import CrawlForm from "./components/CrawlForm";

function App() {
  function reloadTweetList() {
    console.log("Reload tweet list after crawl");
  }

  return (
    <main className="dashboard">
      <section className="panel">
        <h1>Twitter Crawler</h1>
        <CrawlForm onSuccess={reloadTweetList} />
      </section>
    </main>
  );
}

export default App;
