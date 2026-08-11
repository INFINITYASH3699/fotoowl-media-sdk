import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MediaProvider } from "media-react";
import { App } from "./App";
import "./styles/globals.css";

const apiKey = import.meta.env.VITE_PEXELS_API_KEY as string | undefined;

if (!apiKey) {
  // eslint-disable-next-line no-console
  console.error("❌ VITE_PEXELS_API_KEY is missing. Add it to apps/web/.env");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MediaProvider apiKey={apiKey ?? ""} enableDefaultLogger={true}>
        <App />
      </MediaProvider>
    </BrowserRouter>
  </React.StrictMode>
);
