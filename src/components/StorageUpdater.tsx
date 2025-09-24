import { useMemo, useCallback, useState } from "react";

import useStorage from "../hooks/useStorage";
import type { StorageItemT } from "../hooks/useStorage";

import isExtensionEnv from "../extension/isExtensionEnv";

import { state } from "../../nexusConfig";

function StorageUpdater({ children }: { children: React.ReactNode }) {
  // state
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  // nexus-state
  const isPro = state.useNexus("isPro");
  const colorStorage = state.useNexus("colorStorage");
  const stableColorStorage = JSON.stringify(colorStorage);
  const paletteHidden = state.useNexus("paletteHidden");
  const themeSettings = state.useNexus("themeSettings");

  // hooks
  const storItem = useMemo<StorageItemT>(
    () => [
      {
        name: "paletteHidden",
        value: paletteHidden,
        type: "local",
        onLoad: (data) => {
          if (data) state.setNexus({ paletteHidden: data as boolean });
        },
      },
      {
        name: "colorStorage",
        value: colorStorage,
        type: "local",
        remove: !colorStorage.length,
        onLoad: (data) => {
          if (typeof data === "object" && !data?.length) return;
          state.setNexus({ colorStorage: data as Record<string, string[]>[] });
        },
      },
      {
        name: "pro",
        value: isPro,
        type: "local",
        onLoad: (data) => {
          if (data) state.setNexus({ isPro: data as boolean });
        },
      },
      // {
      //   name: "theme",
      //   value: theme,
      //   type: "chrome-local",
      //   onLoad: (data) => {
      //     console.log("data", data);
      //     if (!data) {
      //       document.documentElement.removeAttribute("data-theme");
      //       document.documentElement.removeAttribute("style");

      //       return;
      //     }

      //     document.documentElement.setAttribute("data-theme", data as string);
      //     document.documentElement.style.colorScheme = data as string;
      //   },
      // },
      {
        name: "userData",
        type: "chrome-local",
        readOnly: true,
        onLoad: (data) => {
          if (!data) return;
          state.setNexus({ userData: data as Record<string, string> });
        },
      },
    ],
    [paletteHidden, stableColorStorage, isPro]
  );

  const handleStorageUpdate = useCallback(() => {
    if (!isStorageLoaded) setIsStorageLoaded(true);

    // Синхронизация темы
    if (!isExtensionEnv()) return;

    // сообщения в background
    const port = chrome.runtime.connect({ name: "popup" });
    port.postMessage({ type: "popup_opened" });

    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    chrome.runtime.sendMessage({
      type: "theme",
      theme: isDark ? "dark" : "light",
    });

    if (isDark) {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.removeAttribute("style");
    }
  }, []);

  // в callback обновляем флаг isStorageLoaded
  useStorage(storItem, handleStorageUpdate);

  return isStorageLoaded ? children : null;
}

export default StorageUpdater;
