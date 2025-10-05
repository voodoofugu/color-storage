import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./components/App";
import StorageUpdater from "./components/StorageUpdater";
import FetchData from "./components/FetchData";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FetchData />
    <StorageUpdater>
      <App />
    </StorageUpdater>
  </StrictMode>
);
