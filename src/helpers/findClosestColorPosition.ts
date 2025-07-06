import { hexToRgb } from "./colorFormatter";

function findClosestColorPosition(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  targetHex: string
) {
  const { r: tr, g: tg, b: tb } = hexToRgb(targetHex);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let bestDist = Infinity;
  let bestXY = { x: 0, y: 0 };

  const step = 2; // ⬅ ускорение за счёт пропуска пикселей

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const dist = Math.abs(tr - r) + Math.abs(tg - g) + Math.abs(tb - b);

      if (dist < bestDist) {
        bestDist = dist;
        bestXY = { x, y };
      }

      if (bestDist === 0) return bestXY;
    }
  }

  return bestXY;
}

export default findClosestColorPosition;
