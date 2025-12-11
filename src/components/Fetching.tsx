import { useEffect, useState } from "react";

import createStorageSync from "../helpers/createStorageSync";
import { fetchDataServer, loadUser } from "../helpers/fetchDataServer";

import isExtensionEnv from "../extension/isExtensionEnv";
import nexus from "../../nexusConfig";

const mode = import.meta.env.MODE;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const checkData = async (attempt = 0) => {
  if (attempt > 10) return; // защита от бесконечности на 9 раз

  await delay(1000);
  await loadUser();

  if (!nexus.get("userData")) {
    checkData(attempt + 1);
  }
};

function Fetching({ children }: { children: React.ReactNode }) {
  // state
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  // nexus
  const themeSettings = nexus.use("themeSettings");
  const readyToFetch = nexus.use("readyToFetch");

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
    if (readyToFetch) checkData();
  }, [readyToFetch]);

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

  return isStorageLoaded ? children : null;
}

export default Fetching;
