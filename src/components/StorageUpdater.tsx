import { useMemo, useCallback, useState } from "react";

import useStorage from "../hooks/useStorage";
import type { StorageItemT } from "../hooks/useStorage";

import isExtensionEnv from "../extension/isExtensionEnv";

import { store } from "../../nexusConfig";

const mode = import.meta.env.MODE;

function StorageUpdater({ children }: { children: React.ReactNode }) {
  // store
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  // nexus
  const isPro = store.useNexus("isPro");
  const colorStorage = store.useNexus("colorStorage");
  const stableColorStorage = JSON.stringify(colorStorage);
  const paletteHidden = store.useNexus("paletteHidden");
  const themeSettings = store.useNexus("themeSettings");
  const userData = store.useNexus("userData");

  // hooks
  const storItem = useMemo<StorageItemT>(
    () => [
      {
        name: "paletteHidden",
        value: paletteHidden,
        type: "local",
        onLoad: (data) => {
          if (data) store.setNexus({ paletteHidden: data as boolean });
        },
      },
      {
        name: "colorStorage",
        value: colorStorage,
        type: "local",
        remove: !colorStorage.length,
        onLoad: (data) => {
          if (typeof data === "object" && !data?.length) return;
          store.setNexus({ colorStorage: data as Record<string, string[]>[] });
        },
      },
      {
        name: "pro",
        value: isPro,
        type: "local",
        onLoad: (data) => {
          if (data) store.setNexus({ isPro: data as boolean });
        },
      },
      {
        name: "themeSettings",
        value: themeSettings,
        type: mode === "production" ? "chrome-local" : "local",
        onLoad: (data) => {
          if (data)
            store.setNexus({
              themeSettings: data as "system" | "light" | "dark",
            });
        },
      },
      {
        name: "userData",
        value: userData,
        type: mode === "production" ? "chrome-local" : "local",
        onLoad: (data) => {
          if (!data) return;
          store.setNexus({ userData: data as Record<string, string> });
        },
      },
    ],
    [paletteHidden, stableColorStorage, isPro, themeSettings, userData]
  );

  const handleStorageUpdate = useCallback(() => {
    if (!isStorageLoaded) setIsStorageLoaded(true);

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

  // в callback обновляем флаг isStorageLoaded
  useStorage(storItem, handleStorageUpdate);

  return isStorageLoaded ? children : null;
}

export default StorageUpdater;
