import { useEffect, useState } from "react";

import createStorageSync from "../helpers/createStorageSync";
import fetchDataServer from "../helpers/fetchDataServer";

import isExtensionEnv from "../extension/isExtensionEnv";

import nexus from "../../nexusConfig";

const mode = import.meta.env.MODE;

function Fetching({ children }: { children: React.ReactNode }) {
  // state
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  // nexus
  const themeSettings = nexus.use("themeSettings");

  // effects
  useEffect(() => {
    const type = mode === "production" ? "chrome-local" : "local";

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
      type: "theme",
      theme: isDark ? "dark" : "light",
    });

    if (themeSettings === "system") {
      if (isDark) {
        document.documentElement.setAttribute("data-theme", "dark");
        document.documentElement.style.colorScheme = "dark";
      } else {
        document.documentElement.removeAttribute("data-theme");
        document.documentElement.removeAttribute("style");
      }
    } else if (themeSettings === "light") {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.style.colorScheme = "light";
    } else if (themeSettings === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.style.colorScheme = "dark";
    }
  }, [themeSettings]);

  return isStorageLoaded ? children : null;
}

export default Fetching;
