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
  return (
    <button
      data-id={data}
      className={`btn${className ? ` ${className}` : ""}`}
      draggable={draggable}
      style={{ ...(bgColor && color && { background: color }) }}
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
