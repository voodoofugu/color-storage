import { memo } from "react";

import SVGIcon from "./SVGIcon";

type SvgIdT = "picker" | "copy" | "plus" | "drag";

type ButtonT = {
  className?: string;
  svgID?: SvgIdT;
  color?: string;
  text?: string;
  bgColor?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
};

function Button({
  className,
  svgID,
  color,
  text,
  bgColor,
  onClick,
  children,
}: ButtonT) {
  return (
    <button
      className={`btn${className ? ` ${className}` : ""}`}
      {...(color && { "data-color": `${color}` })}
      style={{ ...(bgColor && color && { background: color }) }}
      onClick={onClick}
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
