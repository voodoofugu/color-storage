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
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
};

function Button({
  className,
  data,
  svgID,
  color,
  text,
  bgColor,
  draggable,
  children,
  onDragStart,
  onDragEnter,
  onDragLeave,
  onDragEnd,
  onDragOver,
  onClick,
  onMouseDown,
}: ButtonT) {
  return (
    <button
      data-id={data}
      className={`btn${className ? ` ${className}` : ""}`}
      draggable={draggable}
      style={{ ...(bgColor && color && { background: color }) }}
      onDragStart={onDragStart && onDragStart}
      onDragEnter={onDragEnter && onDragEnter}
      onDragLeave={onDragLeave && onDragLeave}
      onDragEnd={onDragEnd && onDragEnd}
      onDragOver={onDragOver && onDragOver}
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
