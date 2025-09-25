import {
  PickerIcon,
  CopyIcon,
  PlusIcon,
  DragIcon,
  TrashIcon,
  SettingsIcon,
  PaletteIcon,
  SignIcon,
} from "../svg/svgIcons";
import type { SvgIdT } from "./Button";

type SVGIconT = {
  svgID: SvgIdT;
};

const SVGIcon = ({ svgID }: SVGIconT) => {
  return (
    <div className="svgIcon">
      <svg id={`${svgID}`} viewBox="0 0 88 88">
        {svgID === "picker" ? (
          <PickerIcon />
        ) : svgID === "copy" ? (
          <CopyIcon />
        ) : svgID === "plus" ? (
          <PlusIcon />
        ) : svgID === "drag" ? (
          <DragIcon />
        ) : svgID === "trash" ? (
          <TrashIcon />
        ) : svgID === "settings" ? (
          <SettingsIcon />
        ) : svgID === "palette" ? (
          <PaletteIcon />
        ) : svgID === "sign" ? (
          <SignIcon />
        ) : null}
      </svg>
    </div>
  );
};

export default SVGIcon;
