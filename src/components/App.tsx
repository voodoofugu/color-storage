import { useEffect, useRef, useState, useCallback, useMemo } from "react";

import "../styles/App.scss";
import "../styles/animations.scss";

import {
  hexToRgb,
  hexToHsl,
  hslToHex,
  hslToRgb,
  formatColor,
} from "../helpers/colorFormatter";
import findClosestColorPosition from "../helpers/findClosestColorPosition";
import handleCanvasClick from "../helpers/handleCanvasClick";

import ColorSlider from "./ColorSlider";
import Button from "./Button";

function App() {
  // State:
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, forceUpdate] = useState<number>(0); // для принудительного обновления
  const triggerUpdate = () => {
    forceUpdate((x) => (typeof x === "number" && x < 1000 ? x + 1 : 0));
  };

  // Refs:
  const paletteCanvasRef = useRef<HTMLCanvasElement>(null);
  const hueCanvasRef = useRef<HTMLCanvasElement>(null);
  const alphaCanvasRef = useRef<HTMLCanvasElement>(null);

  const color = useRef<string>("#ffffff");
  const hueColor = useRef<string>("hsl(0, 100%, 50%)");
  const paletteThumbXY = useRef({ x: 0, y: 0 });
  const hueThumbX = useRef(0);
  const alphaThumbX = useRef(0);
  const colorFormat = useRef<"hex" | "rgb" | "hsl">("hex");
  const alpha = useRef(1);
  const animation = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Variables:
  const colorWithAlpha = useMemo(() => {
    return formatColor(color.current, colorFormat.current, alpha.current);
  }, [color.current, colorFormat.current, alpha.current]);

  const onChangeColor = (e: React.ChangeEvent<HTMLSelectElement>) => {
    colorFormat.current = e.target.value as "hex" | "rgb" | "hsl";

    triggerUpdate();
  };

  const thumbPositionPalette = useMemo(() => {
    return `${paletteThumbXY.current.x}, ${paletteThumbXY.current.y}`;
  }, [paletteThumbXY.current.x, paletteThumbXY.current.y]);

  // Functions:
  const pickColor = useCallback(async () => {
    try {
      // @ts-expect-error нет типа EyeDropper в TypeScript
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();

      color.current = result.sRGBHex;
      alpha.current = 1;
      alphaThumbX.current = 0;
      await navigator.clipboard.writeText(result.sRGBHex);

      // Обновляем цветовой круг
      const { h } = hexToHsl(result.sRGBHex);
      hueColor.current = `hsl(${h}, 100%, 50%)`;

      // Ждём следующего рендера (обновление useEffect)
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const canvas = paletteCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const { width, height } = canvas;
      const xy = findClosestColorPosition(ctx, width, height, result.sRGBHex);
      paletteThumbXY.current = xy;
      hueThumbX.current = Math.round((h / 360) * width);

      triggerUpdate();
    } catch (e) {
      console.error("Error picking color", e);
    }
  }, []);

  const clearAnimation = () => {
    if (animation.current !== null) {
      clearTimeout(animation.current);
      animation.current = null;
    }
  };

  const copyColor = useCallback(() => {
    navigator.clipboard.writeText(colorWithAlpha);

    const copyBtn = document.querySelector(".copy");
    if (copyBtn) {
      copyBtn.classList.add("copied");

      clearAnimation();

      animation.current = window.setTimeout(() => {
        copyBtn.classList.remove("copied");
      }, 300);
    }
  }, [colorWithAlpha]);

  const handlePaletteClick = useCallback((e: React.MouseEvent) => {
    handleCanvasClick(e, {
      canvasRef: paletteCanvasRef,
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

  const handleHueClick = useCallback((e: React.MouseEvent) => {
    handleCanvasClick(e, {
      canvasRef: hueCanvasRef,
      cursorDuringDrag: "ew-resize",
      onMove: (e: MouseEvent, rect: DOMRect) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { h, s, l } = hexToHsl(color.current);
        const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width - 1);
        if (x === hueThumbX.current) return;

        const hueValue = (x / rect.width) * 360;

        hueThumbX.current = x;
        hueColor.current = `hsl(${Math.round(hueValue)}, 100%, 50%)`;
        color.current = hslToHex(hueValue, s, l);

        triggerUpdate();
      },
    });
  }, []);

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

  // Effects:
  useEffect(() => {
    const canvas = paletteCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const { width, height } = canvas;

    const borderOffset = 1 / width;
    const borderOffsetY = 1 / height;

    // Конвертируем hueColor.current из HSL в RGB
    const hslMatch = hueColor.current.match(
      /hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/
    );
    if (!hslMatch) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, hStr, sStr, lStr] = hslMatch;
    const h = parseInt(hStr, 10);
    const s = parseInt(sStr, 10);
    const l = parseInt(lStr, 10);
    const { r, g, b } = hslToRgb(h, s, l);

    // 1. Горизонтальный градиент: от белого к цвету
    const whiteHueGradient = ctx.createLinearGradient(0, 0, width, 0);

    whiteHueGradient.addColorStop(0, `rgba(255, 255, 255, 1)`);
    whiteHueGradient.addColorStop(borderOffset, `rgba(255, 255, 255, 1)`);
    whiteHueGradient.addColorStop(
      1 - borderOffset,
      `rgba(${r}, ${g}, ${b}, 1)`
    );
    whiteHueGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 1)`);

    ctx.fillStyle = whiteHueGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Вертикальный градиент: прозрачный → чёрный
    const blackGradient = ctx.createLinearGradient(0, 0, 0, height);
    blackGradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
    blackGradient.addColorStop(borderOffsetY, `rgba(0, 0, 0, 0)`);
    blackGradient.addColorStop(1 - borderOffsetY, `rgba(0, 0, 0, 1)`);
    blackGradient.addColorStop(1, `rgba(0, 0, 0, 1)`);

    ctx.fillStyle = blackGradient;
    ctx.fillRect(0, 0, width, height);
  }, [hueColor.current]);

  useEffect(() => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    const gradient = ctx.createLinearGradient(0, 0, width, 0);

    const borderOffset = 1 / width;

    for (let i = 0; i <= 360; i += 60) {
      const stop = i / 360;

      const start = Math.max(0, stop - borderOffset / 2);
      const end = Math.min(1, stop + borderOffset / 2);

      const { r, g, b } = hslToRgb(i, 100, 50); // s=100%, l=50%
      const rgba = `rgba(${r}, ${g}, ${b}, 1)`;

      gradient.addColorStop(start, rgba);
      gradient.addColorStop(end, rgba);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }, []);

  useEffect(() => {
    const canvas = alphaCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;

    // Шаг клеток (чекерборда)
    const step = 3;

    // 1. Рисуем шахматный фон (checkerboard)
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const isDark = (x / step + y / step) % 2 === 0;
        ctx.fillStyle = isDark ? "#ccc" : "#fff";
        ctx.fillRect(x, y, step, step);
      }
    }

    // 2. Накладываем градиент color → transparent
    const { r, g, b } = hexToRgb(color.current);
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }, [color.current]);

  useEffect(() => {
    return () => {
      clearAnimation();
    };
  }, []);

  // Render:
  return (
    <div className="content">
      <div className="title">Color Storage</div>

      <div className="canvasBox">
        <ColorSlider
          className="paletteWrap"
          ref={paletteCanvasRef}
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
          <Button svgID="picker" onClick={pickColor} />
          <Button
            className="copy"
            svgID="copy"
            color={colorWithAlpha}
            onClick={copyColor}
          />
        </div>

        <div className="color-wrap">
          <div className="select">
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

          <div className="color-box">{colorWithAlpha}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
