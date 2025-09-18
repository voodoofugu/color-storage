import { useEffect, useRef, useState, useCallback, useMemo } from "react";

import { state, actions } from "../../nexusConfig.ts";

import "../styles/App.scss";
import "../styles/animations.scss";
import "../styles/elements.scss";
import "../styles/popup.scss";

import { hexToHsl, hslToHex, formatColor } from "../helpers/colorFormatter";
import findClosestColorPosition from "../helpers/findClosestColorPosition";
import handleCanvasClick from "../helpers/handleCanvasClick";
import {
  drawColorCanvas,
  drawHueCanvas,
  drawAlphaCanvas,
} from "../helpers/allCanvases";
import isExtensionEnv from "../extension/isExtensionEnv";

import ColorSlider from "./ColorSlider";
import Button from "./Button";
import StorageColors from "./StorageColors";
import PopupWindow from "./PopupWindow";

function App() {
  // State:
  const [_, forceUpdate] = useState<number>(0); // для принудительного обновления
  const triggerUpdate = () => {
    forceUpdate((x) => (typeof x === "number" && x < 1000 ? x + 1 : 0));
  };

  // Refs:
  const colorCanvasRef = useRef<HTMLCanvasElement>(null);
  const hueCanvasRef = useRef<HTMLCanvasElement>(null);
  const alphaCanvasRef = useRef<HTMLCanvasElement>(null);

  const color = useRef<string>("#ffffff");
  const hueColor = useRef<string>("hsl(0, 100%, 50%)");
  const paletteThumbXY = useRef({ x: 0, y: 0 });
  const hueThumbX = useRef(0);
  const alphaThumbX = useRef(0);
  const colorFormat = useRef<"hex" | "rgb" | "hsl">("hex");
  const alpha = useRef(1);
  const isColorCanvasReady = useRef(false);

  // nexus-state
  const activeColor = state.useNexus("activeColor");
  const copiedColorFlag = state.useNexus("copiedColorFlag");
  const paletteHidden = state.useNexus("paletteHidden");
  const colorStorage = state.useNexus("colorStorage");

  // error
  const errorText = (text: string) => {
    console.error(`Color Storage:\n${text}`);
  };

  // Variables:
  const { hex, activeAlpha } = useMemo(() => {
    // если есть alpha
    if (activeColor.length === 9) {
      const hexAlpha = activeColor.slice(7, 9);
      const activeAlpha =
        Math.round((parseInt(hexAlpha, 16) / 255) * 100) / 100;
      const hex = activeColor.slice(0, 7);

      return { hex, activeAlpha };
    }

    return { hex: activeColor, activeAlpha: 1 };
  }, [activeColor]);

  const colorWithAlpha = useMemo(() => {
    return formatColor(color.current, colorFormat.current, alpha.current);
  }, [color.current, colorFormat.current, alpha.current]);

  const hexColorWithAlpha = useMemo(() => {
    return formatColor(color.current, "hex", alpha.current);
  }, [color.current, alpha.current]);

  const onChangeColor = (e: React.ChangeEvent<HTMLSelectElement>) => {
    colorFormat.current = e.target.value as "hex" | "rgb" | "hsl";

    triggerUpdate();
  };

  const thumbPositionPalette = useMemo(() => {
    return `${paletteThumbXY.current.x}, ${paletteThumbXY.current.y}`;
  }, [paletteThumbXY.current.x, paletteThumbXY.current.y]);

  // Functions:
  function waitForCanvasReady() {
    return new Promise<void>((resolve) => {
      const check = () => {
        if (isColorCanvasReady.current) {
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      check();
    });
  }

  const getColor = async (hexColor: string, fromPick = true) => {
    color.current = hexColor;

    const canvas = colorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (fromPick) {
      alpha.current = 1;
      alphaThumbX.current = 0;
    }
    // Обновляем цветовой круг

    const { h } = hexToHsl(hexColor);
    const newHueColor = `hsl(${h}, 100%, 50%)`;

    if (newHueColor !== hueColor.current) {
      hueColor.current = newHueColor;
      isColorCanvasReady.current = false;

      triggerUpdate();

      // Ждём следующего обновления canvas
      await waitForCanvasReady();
      hueThumbX.current = Math.round((h / 360) * canvas.width);
    }

    paletteThumbXY.current = findClosestColorPosition(ctx!, hexColor);

    triggerUpdate();
  };

  const pickColor = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    btn.classList.add("active");

    try {
      // @ts-expect-error нет типа EyeDropper в TypeScript
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();

      if (result && result.sRGBHex) {
        try {
          await navigator.clipboard.writeText(result.sRGBHex);
        } catch {
          errorText("Error copying color to clipboard");
        }

        await getColor(result.sRGBHex);
      }
    } catch (e) {
      errorText(`Error picking color: ${e}`);
    }

    btn.classList.remove("active");
  };

  const copyColor = useCallback(() => {
    navigator.clipboard
      .writeText(colorWithAlpha as string)
      .then(() => {
        // Показать "copied" только если всё прошло успешно
        actions.setStateWithTimeout("copiedColorFlag", true, 300);
      })
      .catch((e) => {
        errorText(`Clipboard write failed: ${e}`);
      });
  }, [colorWithAlpha]);

  const handlePaletteClick = useCallback((e: React.MouseEvent) => {
    handleCanvasClick(e, {
      canvasRef: colorCanvasRef,
      cursorDuringDrag: "all-scroll",
      onMove: (e: MouseEvent, rect: DOMRect, ctx: CanvasRenderingContext2D) => {
        const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width - 1);
        const y = Math.min(Math.max(e.clientY - rect.top, 0), rect.height - 1);
        if (x === paletteThumbXY.current.x && y === paletteThumbXY.current.y)
          return;

        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const hex = `#${[pixel[0], pixel[1], pixel[2]]
          .map((v) => v.toString(16).padStart(2, "0"))
          .join("")}`;

        paletteThumbXY.current = { x, y };
        color.current = hex;

        triggerUpdate();
      },
    });
  }, []);

  const handleHueClick = useCallback(
    (e: React.MouseEvent) => {
      handleCanvasClick(e, {
        canvasRef: hueCanvasRef,
        cursorDuringDrag: "ew-resize",
        onMove: (e: MouseEvent, rect: DOMRect) => {
          const { h: _, s, l } = hexToHsl(color.current);
          const x = Math.min(
            Math.max(e.clientX - rect.left, 0),
            rect.width - 1
          );
          if (x === hueThumbX.current) return;

          const hueValue = (x / rect.width) * 360;

          hueThumbX.current = x;
          hueColor.current = `hsl(${Math.round(hueValue)}, 100%, 50%)`;
          color.current = hslToHex(hueValue, s, l);

          triggerUpdate();
        },
      });
    },
    [color.current]
  );

  const handleAlphaClick = useCallback((e: React.MouseEvent) => {
    handleCanvasClick(e, {
      canvasRef: alphaCanvasRef,
      cursorDuringDrag: "ew-resize",
      onMove: (e: MouseEvent, rect: DOMRect) => {
        const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width - 1);
        if (x === alphaThumbX.current) return;

        alphaThumbX.current = x;
        alpha.current = Math.round(((rect.width - x) / rect.width) * 100) / 100;

        triggerUpdate();
      },
    });
  }, []);

  const openSettings = () => actions.popupOpen("settingsWindow");

  const paletteViewingHandler = () => {
    state.setNexus((prev) => ({ paletteHidden: !prev.paletteHidden }));
  };

  // Effects:
  // рисуем Canvas
  useEffect(() => {
    drawColorCanvas(colorCanvasRef.current!, hueColor.current);

    isColorCanvasReady.current = true;
    triggerUpdate();
  }, [hueColor.current]);

  useEffect(() => {
    drawHueCanvas(hueCanvasRef.current!);
  }, []);

  useEffect(() => {
    drawAlphaCanvas(alphaCanvasRef.current!, color.current);
  }, [color.current]);
  // ------------

  useEffect(() => {
    // обновляем цвет в nexus-state
    actions.setMainColor(hexColorWithAlpha);
  }, [hexColorWithAlpha]);

  useEffect(() => {
    if (!hex) return;

    // обновляем alpha при изменении activeColor
    if (activeAlpha !== alpha.current) {
      const canvas = alphaCanvasRef.current;
      if (!canvas) return;

      alpha.current = activeAlpha;
      alphaThumbX.current = Math.round((1 - activeAlpha) * canvas.width);
    }

    // обновляем палитру при изменении activeColor
    getColor(hex, false);

    actions.setActiveColor("");
  }, [hex, activeAlpha]);

  // эффекты для расширения
  useEffect(() => {
    // проверяем что мы в окружении для расширения
    if (!isExtensionEnv()) return;

    const port = chrome.runtime.connect({ name: "popup" });
    port.postMessage({ type: "popup_opened" });

    // Синхронизация темы
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    chrome.runtime.sendMessage({
      type: "theme",
      theme: isDark ? "dark" : "light",
    });
  }, []);

  useEffect(() => {
    if (!isExtensionEnv()) return;

    chrome.storage.local.get(["payment"], (result) => {
      if (result.payment === "success") {
        state.setNexus({ isPro: true });
        actions.popupOpen("payment-success");
      } else if (result.payment === "cancel") {
        actions.popupOpen("payment-cancelled");
      } else if (result.payment === "pending") {
        actions.popupOpen("payment-notFinished");
      }

      chrome.storage.local.remove(["payment"]);
    });
  }, []);

  // Render:
  return (
    <div
      className={`content${paletteHidden ? " palette-hidden" : ""}${
        colorStorage.length ? " witch-palettes" : ""
      }`}
    >
      <Button
        className={`palette flat header-btn${paletteHidden ? " active" : ""}`}
        svgID="palette"
        onClick={paletteViewingHandler}
      />
      <div className="title">Color Storage</div>
      <Button
        className="settings flat header-btn"
        svgID="settings"
        onClick={openSettings}
      />

      <div className="canvasBox">
        <ColorSlider
          className="paletteWrap"
          ref={colorCanvasRef}
          onMouseDown={handlePaletteClick}
          thumbPosition={thumbPositionPalette}
          canvasSize="224, 100"
          thumbColor={color.current}
        />

        <ColorSlider
          className="colorWrap"
          ref={hueCanvasRef}
          onMouseDown={handleHueClick}
          thumbPosition={`${hueThumbX.current}`}
          canvasSize="224, 6"
          thumbColor={hueColor.current}
        />

        <ColorSlider
          className="fillWrap"
          ref={alphaCanvasRef}
          onMouseDown={handleAlphaClick}
          thumbPosition={`${alphaThumbX.current}`}
          canvasSize="224, 6"
        />
      </div>

      <div className="btn-box">
        <div className="btn-wrap">
          <Button className="picker" svgID="picker" onClick={pickColor} />
          <Button
            className={`copy${copiedColorFlag ? " copied" : ""}`}
            svgID="copy"
            color={colorWithAlpha as string}
            onClick={copyColor}
          />
        </div>

        <div className="color-wrap">
          <div className="select-box">
            <select
              className="color-format"
              value={colorFormat.current}
              onChange={onChangeColor}
            >
              <option value="hex">HEX</option>
              <option value="rgb">RGB</option>
              <option value="hsl">HSL</option>
            </select>
            <div className={`alpha${alpha.current < 1 ? " active" : ""}`}>
              A
            </div>
          </div>

          <div className="color-box">{colorWithAlpha as string}</div>
        </div>
      </div>

      <StorageColors />
      <PopupWindow />
    </div>
  );
}

App.displayName = "App";
export default App;
