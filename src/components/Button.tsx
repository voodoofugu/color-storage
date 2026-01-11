import { memo, useState, forwardRef } from "react";

import SVGIcon from "./SVGIcon";
import type { SvgIdT } from "./SVGIcon";

type ButtonT = {
  className?: string;
  data?: string;
  svgID?: SvgIdT;
  color?: string;
  text?: string;
  bgColor?: boolean;
  draggable?: boolean;
  loader?: boolean;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLButtonElement>; // 👈 Добавили все стандартные события

const Button = memo(
  forwardRef<HTMLButtonElement, ButtonT>(function Button(
    {
      className,
      data,
      svgID,
      color,
      text,
      bgColor,
      draggable,
      loader = true,
      children,
      ...restProps // 👈 Сюда попадают все onDrag*, onClick и пр.
    }: ButtonT,
    ref
  ) {
    const isHexWithAlpha = color?.match(/#([A-Fa-f0-9]{8})/);
    const [loading, setLoading] = useState(false);
    const checkLoading = loader && loading;

    return (
      <button
        data-id={data}
        className={`btn${className ? ` ${className}` : ""}${
          bgColor && color && isHexWithAlpha ? " alpha" : ""
        }${checkLoading ? " inFetch" : ""}`}
        ref={ref}
        draggable={draggable}
        style={{
          ...(bgColor &&
            color && {
              background: color,
            }),
        }}
        {...restProps} // 👈 Прокидываем все события и прочие атрибуты
        onClick={(e) => {
          const result = restProps.onClick?.(e);

          if (
            result &&
            typeof (result as Promise<unknown>).finally === "function"
          ) {
            setLoading(true);
            (result as Promise<unknown>).finally(() => {
              setLoading(false);
            });
          }
        }}
      >
        {color && !bgColor && (
          <div className="btn-bg" style={{ backgroundColor: color }} />
        )}
        {text && <div className="text">{text}</div>}
        {checkLoading ? (
          <SVGIcon svgID="loader" />
        ) : (
          svgID && (
            <SVGIcon
              key={svgID} // Добавляем key для перерисовки иконки при изменении svgID
              svgID={svgID}
            />
          )
        )}
        {children}
      </button>
    );
  })
);

Button.displayName = "Button";
export default Button;
export type { SvgIdT };
