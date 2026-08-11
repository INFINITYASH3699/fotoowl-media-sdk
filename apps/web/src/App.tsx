import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { EventLog } from "./components/EventLog";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { ReelsPage } from "./pages/ReelsPage";
import { DocsPage } from "./pages/DocsPage";

export function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/reels" element={<ReelsPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/docs/:slug" element={<DocsPage />} />
        </Routes>
      </main>
      <EventLog />
    </div>
  );
}
