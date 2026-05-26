import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./components/App";
import Fetching from "./components/Fetching";
import nexus from "../nexusConfig";

// эмуляция реакции background
if (import.meta.env.DEV) {
  window.addEventListener("message", (e) => {
    const allowedOrigins = new Set([
      window.location.origin,
      "http://localhost:4000",
    ]);
    if (!allowedOrigins.has(e.origin)) return;

    const data = e.data;
    if (!data || data.source !== "color-storage") return;

    if (data.ok) {
      localStorage.setItem("readyToFetch", "true");
      nexus.set({ readyToFetch: true });
      console.log("Background received message:", data);
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Fetching>
      <App />
    </Fetching>

    {import.meta.env.DEV && (
      <button
        style={{ position: "absolute", bottom: "20px", left: "20px" }}
        onClick={() => {
          window.postMessage(
            { source: "color-storage", ok: true },
            window.location.origin
          );
        }}
      >
        Post Massage
      </button>
    )}
  </StrictMode>
);
