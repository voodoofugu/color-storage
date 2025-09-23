import { useMemo, useCallback } from "react";

import useStorage from "../hooks/useStorage";
import type { StorageItemT } from "../hooks/useStorage";

import { state } from "../../nexusConfig";

function StorageUpdater({ children }: { children: React.ReactNode }) {
  // nexus-state
  const isPro = state.useNexus("isPro");
  const colorStorage = state.useNexus("colorStorage");
  const stableColorStorage = JSON.stringify(colorStorage);
  const paletteHidden = state.useNexus("paletteHidden");
  const isStorageLoaded = state.useNexus("isStorageLoaded");
  const theme = state.useNexus("theme");

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
      {
        name: "theme",
        value: theme,
        type: "chrome-local",
        onLoad: (data) => {
          if (data == "system") {
            document.documentElement.removeAttribute("data-theme");
            document.documentElement.removeAttribute("style");
            return;
          }

          document.documentElement.setAttribute("data-theme", data as string);
          document.documentElement.style.colorScheme = data as string;
        },
      },
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
    [paletteHidden, stableColorStorage, isPro, theme]
  );

  const handleStorageUpdate = useCallback(() => {
    if (isStorageLoaded) return;
    state.setNexus({ isStorageLoaded: true });
  }, []);

  // в callback обновляем флаг isStorageLoaded
  useStorage(storItem, handleStorageUpdate);

  return isStorageLoaded ? children : null;
}

export default StorageUpdater;
