type CanvasClickOptions = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  cursorDuringDrag: string;
  onMove: (e: MouseEvent, rect: DOMRect, ctx: CanvasRenderingContext2D) => void;
};

const handleCanvasClick = (
  e: React.MouseEvent,
  { canvasRef, cursorDuringDrag, onMove }: CanvasClickOptions
) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const controller = new AbortController();
  const signal = controller.signal;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  const handleMove = (moveEvent: MouseEvent) => {
    onMove(moveEvent, rect, ctx);
  };

  const handleUp = () => {
    controller.abort();
    canvas.style.cursor = "";
    document.body.style.cursor = "default";
  };

  window.addEventListener("mousemove", handleMove, { signal });
  window.addEventListener("mouseup", handleUp, { signal });

  // Вызываем сразу при клике (без ожидания движения)
  handleMove(e.nativeEvent);

  canvas.style.cursor = cursorDuringDrag;
  document.body.style.cursor = cursorDuringDrag;
};

export default handleCanvasClick;
