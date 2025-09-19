import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./components/App";
import StorageUpdater from "./components/StorageUpdater";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StorageUpdater>
      <App />
    </StorageUpdater>
  </StrictMode>
);
