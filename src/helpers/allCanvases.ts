import { hslToRgb, hexToRgb } from "../helpers/colorFormatter";

function drawColorCanvas(colorCanvasRef: HTMLCanvasElement, hueColor: string) {
  const canvas = colorCanvasRef;
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  const { width, height } = canvas;

  const borderOffset = 1 / width;
  const borderOffsetY = 1 / height;

  // Конвертируем hueColor.current из HSL в RGB
  const hslMatch = hueColor.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
  if (!hslMatch) return;

  const [_, hStr, sStr, lStr] = hslMatch;
  const h = parseInt(hStr, 10);
  const s = parseInt(sStr, 10);
  const l = parseInt(lStr, 10);
  const { r, g, b } = hslToRgb(h, s, l);

  // 1. Горизонтальный градиент: от белого к цвету
  const whiteHueGradient = ctx.createLinearGradient(0, 0, width, 0);

  whiteHueGradient.addColorStop(0, `rgba(255, 255, 255, 1)`);
  whiteHueGradient.addColorStop(borderOffset, `rgba(255, 255, 255, 1)`);
  whiteHueGradient.addColorStop(1 - borderOffset, `rgba(${r}, ${g}, ${b}, 1)`);
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
}

function drawHueCanvas(hueCanvasRef: HTMLCanvasElement) {
  const canvas = hueCanvasRef;
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
}

function drawAlphaCanvas(alphaCanvasRef: HTMLCanvasElement, color: string) {
  const canvas = alphaCanvasRef;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { width, height } = canvas;

  // Шаг клеток
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
  const { r, g, b } = hexToRgb(color);
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

export { drawColorCanvas, drawHueCanvas, drawAlphaCanvas };
