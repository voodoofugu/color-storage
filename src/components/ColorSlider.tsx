import { forwardRef, useRef, useImperativeHandle, memo } from "react";
import type { MouseEventHandler } from "react";

type Props = {
  className: string;
  onMouseDown: MouseEventHandler<HTMLDivElement | HTMLCanvasElement>;
  thumbPosition: string;
  canvasSize: string;
  thumbColor?: string;
};

const ColorSlider = forwardRef<HTMLCanvasElement, Props>(
  (
    {
      className,
      onMouseDown,
      thumbPosition,
      canvasSize,
      thumbColor = "#ffffff",
    },
    ref
  ) => {
    const localCanvasRef = useRef<HTMLCanvasElement>(null);

    // Пробрасываем реф наружу
    useImperativeHandle(ref, () => localCanvasRef.current!, []);

    const canvasSizeLocal = canvasSize.split(",").map((s) => parseInt(s));
    const thumbPositionLocal = thumbPosition.split(",").map((s) => parseInt(s));

    return (
      <div className={className}>
        <div
          className="thumb-wrap"
          style={{
            ...(thumbPositionLocal.length === 1
              ? { transform: `translateX(${thumbPositionLocal[0]}px)` }
              : {
                  transform: `translateX(${thumbPositionLocal[0]}px) translateY(${thumbPositionLocal[1]}px)`,
                }),
          }}
          onMouseDown={onMouseDown}
        >
          <div className="thumb" style={{ backgroundColor: thumbColor }} />
        </div>
        <canvas
          ref={localCanvasRef}
          onMouseDown={onMouseDown}
          className="canvas"
          width={canvasSizeLocal[0]}
          height={canvasSizeLocal[1] || canvasSizeLocal[0]}
        />
      </div>
    );
  }
);

ColorSlider.displayName = "ColorSlider";
export default memo(ColorSlider);
