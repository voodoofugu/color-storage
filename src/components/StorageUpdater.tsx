import { useMemo, useCallback, useState } from "react";

import useStorage from "../hooks/useStorage";
import type { StorageItemT } from "../hooks/useStorage";

import isExtensionEnv from "../extension/isExtensionEnv";

import nexus from "../../nexusConfig";

const mode = import.meta.env.MODE;

function StorageUpdater({ children }: { children: React.ReactNode }) {
  // nexus
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  // nexus
  const isPro = nexus.use("isPro");
  const colorStorage = nexus.use("colorStorage");
  const stableColorStorage = JSON.stringify(colorStorage);
  const paletteHidden = nexus.use("paletteHidden");
  const themeSettings = nexus.use("themeSettings");
  const userData = nexus.use("userData");

  // hooks
  const storItem = useMemo<StorageItemT>(
    () => [
      {
        name: "paletteHidden",
        value: paletteHidden,
        type: "local",
        onLoad: (data) => {
          if (data) nexus.set({ paletteHidden: data as boolean });
        },
      },
      {
        name: "colorStorage",
        value: colorStorage,
        type: "local",
        remove: !colorStorage.length,
        onLoad: (data) => {
          if (typeof data === "object" && !data?.length) return;
          nexus.set({ colorStorage: data as Record<string, string[]>[] });
        },
      },
      {
        name: "pro",
        value: isPro,
        type: "local",
        onLoad: (data) => {
          if (data) nexus.set({ isPro: data as boolean });
        },
      },
      {
        name: "themeSettings",
        value: themeSettings,
        type: mode === "production" ? "chrome-local" : "local",
        onLoad: (data) => {
          if (data)
            nexus.set({
              themeSettings: !data
                ? "system"
                : (data as "system" | "light" | "dark" | null),
            });
        },
      },
      {
        name: "userData",
        value: userData,
        type: mode === "production" ? "chrome-local" : "local",
        onLoad: (data) => {
          if (!data) return;
          nexus.set({ userData: data as Record<string, string> });
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
