import { useState } from "react";
import Sidebar    from "./components/layout/Sidebar";
import Topbar     from "./components/layout/Topbar";
import Dashboard  from "./pages/Dashboard";
import Market     from "./pages/Market";
import AIPage     from "./pages/AIPage";
import News       from "./pages/News";
import Alerts     from "./pages/Alerts";
import Reports    from "./pages/Reports";

const PAGES = { dashboard: Dashboard, market: Market, ai: AIPage, news: News, alerts: Alerts, reports: Reports };

export default function App() {
  const [page, setPage] = useState("dashboard");
  const Page = PAGES[page] || Dashboard;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gridTemplateRows:"56px 1fr", minHeight:"100vh", background:"#0a0a0a" }}>
      <Topbar />
      <Sidebar activePage={page} onNavigate={setPage} />
      <main style={{ overflowY:"auto", padding:"24px", background:"#0a0a0a" }}>
        <Page />
      </main>
    </div>
  );
}
