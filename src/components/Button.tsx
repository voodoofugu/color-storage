import { memo } from "react";

import SVGIcon from "./SVGIcon";

type SvgIdT = "picker" | "copy" | "plus" | "drag";

type ButtonT = {
  className?: string;
  svgID?: SvgIdT;
  color?: string;
  text?: string;
  bgColor?: boolean;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
};

function Button({
  className,
  svgID,
  color,
  text,
  bgColor,
  children,
  onClick,
  onMouseDown,
}: ButtonT) {
  return (
    <button
      className={`btn${className ? ` ${className}` : ""}`}
      style={{ ...(bgColor && color && { background: color }) }}
      onClick={onClick && onClick}
      onMouseDown={onMouseDown && onMouseDown}
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
