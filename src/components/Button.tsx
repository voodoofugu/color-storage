import { memo, useState } from "react";
import SVGIcon from "./SVGIcon";

type SvgIdT =
  | "picker"
  | "copy"
  | "plus"
  | "drag"
  | "trash"
  | "settings"
  | "palette"
  | "sign"
  | "account"
  | "loader";

type ButtonT = {
  className?: string;
  ref?: React.Ref<HTMLButtonElement>;
  data?: string;
  svgID?: SvgIdT;
  color?: string;
  text?: string;
  bgColor?: boolean;
  draggable?: boolean;
  loader?: boolean;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLButtonElement>; // 👈 Добавили все стандартные события

function Button({
  className,
  ref,
  data,
  svgID,
  color,
  text,
  bgColor,
  draggable,
  loader,
  children,
  ...restProps // 👈 Сюда попадают все onDrag*, onClick и пр.
}: ButtonT) {
  const isHexWithAlpha = color?.match(/#([A-Fa-f0-9]{8})/);
  const [loading, setLoading] = useState(false);

  return (
    <button
      data-id={data}
      className={`btn${className ? ` ${className}` : ""}${
        bgColor && color && isHexWithAlpha ? " alpha" : ""
      }${loading ? " inFetch" : ""}`}
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
      {loading ? (
        <SVGIcon svgID="loader" />
      ) : (
        svgID && <SVGIcon svgID={svgID} />
      )}
      {children}
    </button>
  );
}

Button.displayName = "Button";
export default memo(Button);
export type { SvgIdT };
