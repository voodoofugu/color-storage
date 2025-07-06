import { memo } from "react";

import SVGIcon from "./SVGIcon";

type ButtonT = {
  className?: string;
  svgID: "picker" | "copy";
  color?: string;
  onClick: () => void;
  children?: React.ReactNode;
};

function Button({ className, svgID, color, onClick, children }: ButtonT) {
  return (
    <button
      className={`btn${className ? ` ${className}` : ""}`}
      onClick={onClick}
    >
      {color && <div className="btn-bg" style={{ backgroundColor: color }} />}
      <SVGIcon svgID={svgID} />
      {children}
    </button>
  );
}

Button.displayName = "Button";
export default memo(Button);
