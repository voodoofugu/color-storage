import { PickerIcon, CopyIcon, PlusIcon, DragIcon } from "../assets/svgIcons";
import type { SvgIdT } from "./Button";

type SVGIconT = {
  svgID: SvgIdT;
};

const SVGIcon = ({ svgID }: SVGIconT) => {
  return (
    <div className={`svgIcon ${svgID}`}>
      <svg id={`${svgID}`} viewBox="0 0 88 88">
        {svgID === "picker" ? (
          <PickerIcon />
        ) : svgID === "copy" ? (
          <CopyIcon />
        ) : svgID === "plus" ? (
          <PlusIcon />
        ) : (
          <DragIcon />
        )}
      </svg>
    </div>
  );
};

export default SVGIcon;
