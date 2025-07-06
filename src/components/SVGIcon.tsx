import { PickerIcon, CopyIcon } from "../assets/svgIcons";

type SVGIconT = {
  svgID: "picker" | "copy";
};

const SVGIcon = ({ svgID }: SVGIconT) => {
  return (
    <div className={`svgIcon ${svgID}`}>
      <svg id={`${svgID}`} viewBox="0 0 88 88">
        {svgID === "picker" ? <PickerIcon /> : <CopyIcon />}
      </svg>
    </div>
  );
};

export default SVGIcon;
