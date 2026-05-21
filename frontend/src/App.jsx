import { useState } from "react";
import "./App.css";
import CrawlForm from "./components/CrawlForm";
import CrawlRunHistory from "./components/CrawlRunHistory";
import CryptoReport from "./components/CryptoReport";
import ImportExportPanel from "./components/ImportExportPanel";
import SourcesPanel from "./components/SourcesPanel";
import StatsCards from "./components/StatsCards";
import TweetsPage from "./components/TweetsPage";

function App() {
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

  function refreshDashboard() {
    setDashboardRefreshKey((value) => value + 1);
  }

  return (
    <main className="dashboard">
      <section className="panel">
        <h1>Twitter Crawler</h1>

        <TweetsPage
          refreshKey={dashboardRefreshKey}
          onDataChange={refreshDashboard}
          overviewPanel={
            <>
              <div className="overview-actions">
                <button type="button" onClick={refreshDashboard}>
                  Refresh
                </button>
              </div>
              <StatsCards refreshKey={dashboardRefreshKey} />
              <CryptoReport refreshKey={dashboardRefreshKey} />
              <CrawlRunHistory refreshKey={dashboardRefreshKey} />
            </>
          }
          crawlPanel={
            <aside className="crawl-panel">
              <CrawlForm onSuccess={refreshDashboard} />
              <SourcesPanel
                refreshKey={dashboardRefreshKey}
                onChange={refreshDashboard}
              />
              <ImportExportPanel onImportComplete={refreshDashboard} />
            </aside>
          }
        />
      </section>
    </main>
  );
}

export default App;
