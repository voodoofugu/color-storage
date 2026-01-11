import { useEffect, useState } from "react";

import SVGIcon from "./SVGIcon";

import createStorageSync from "../helpers/createStorageSync";
import { fetchDataServer, loadUser } from "../helpers/request/fetchDataServer";

import isExtensionEnv from "../extension/isExtensionEnv";
import nexus from "../../nexusConfig";

const mode = import.meta.env.MODE;

function Fetching({ children }: { children: React.ReactNode }) {
  // state
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  // nexus
  const themeSettings = nexus.use("themeSettings");
  const readyToFetch = nexus.use("readyToFetch");
  const type = mode === "production" ? "chrome-local" : "local";

  // effects
  useEffect(() => {
    // обработка флага
    createStorageSync([
      {
        name: "readyToFetch",
        type,
      },
    ]);

    // загрузка данных
    if (readyToFetch) {
      nexus.set({ timestamp: Date.now() });
      loadUser();
    }
  }, [readyToFetch]);

  useEffect(() => {
    createStorageSync(
      [
        {
          name: "paletteHidden",
          type,
        },
        {
          name: "colorStorage",
          type,
        },
        {
          name: "isPro",
          type,
        },
        {
          name: "themeSettings",
          type,
        },
        {
          name: "userData",
          type,
        },
        {
          name: "timestamp",
          type,
        },
      ],
      "storage",
      () => {
        // загрузка данных
        fetchDataServer();
        setIsStorageLoaded(true);
      }
    );
  }, []);

  useEffect(() => {
    // Синхронизация темы
    if (!isExtensionEnv()) return;

    // сообщения в background
    const port = chrome.runtime.connect({ name: "popup" });
    port.postMessage({ type: "popup_opened" });

    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    // сообщение в background для смены иконки
    chrome.runtime.sendMessage({
      source: "color-storage",
      theme: isDark ? "dark" : "light",
    });
    const doc = document.documentElement;

    if (themeSettings === "system") {
      if (isDark) {
        doc.setAttribute("data-theme", "dark");
        doc.style.colorScheme = "dark";
      } else {
        doc.removeAttribute("data-theme");
        doc.removeAttribute("style");
      }
    } else if (themeSettings === "light") {
      doc.removeAttribute("data-theme");
      doc.style.colorScheme = "light";
    } else if (themeSettings === "dark") {
      doc.setAttribute("data-theme", "dark");
      doc.style.colorScheme = "dark";
    }
  }, [themeSettings]);

  return isStorageLoaded ? (
    children
  ) : (
    <div className="content">
      <div className="loaderWrap">
        <SVGIcon svgID="loader" />
      </div>
    </div>
  );
}

export default Fetching;
