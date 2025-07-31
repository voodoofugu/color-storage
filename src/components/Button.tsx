import { memo } from "react";
import SVGIcon from "./SVGIcon";

type SvgIdT = "picker" | "copy" | "plus" | "drag";

type ButtonT = {
  className?: string;
  data?: string;
  svgID?: SvgIdT;
  color?: string;
  text?: string;
  bgColor?: boolean;
  draggable?: boolean;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLButtonElement>; // 👈 Добавили все стандартные события

function Button({
  className,
  data,
  svgID,
  color,
  text,
  bgColor,
  draggable,
  children,
  ...restProps // 👈 Сюда попадают все onDrag*, onClick и пр.
}: ButtonT) {
  const isHexWithAlpha = color?.match(/#([A-Fa-f0-9]{8})/);

  return (
    <button
      data-id={data}
      className={`btn${className ? ` ${className}` : ""}`}
      draggable={draggable}
      style={{
        ...(bgColor &&
          color && {
            background: isHexWithAlpha
              ? `
              conic-gradient(from 45deg at 60% 60%, transparent 180deg, ${color} 0deg),
              conic-gradient(from 45deg at 60% 60%, transparent 180deg, #ffffff 0deg),
              repeating-conic-gradient(#d1d1d1 0 25%, #0000 0 50%) 50% / 6px 6px,
              #ffffff
              `
              : color,
          }),
      }}
      {...restProps} // 👈 Прокидываем все события и прочие атрибуты
    >
      {color && !bgColor && (
        <div className="btn-bg" style={{ backgroundColor: color }} />
      )}
      {svgID && <SVGIcon svgID={svgID} />}
      {text && <div className="text">{text}</div>}
      {children}
    </button>
  );
}

Button.displayName = "Button";
export default memo(Button);
export type { SvgIdT };
