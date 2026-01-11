import {
  PickerIcon,
  CopyIcon,
  PlusIcon,
  DragIcon,
  TrashIcon,
  SettingsIcon,
  PaletteIcon,
  SignIcon,
  AccountIcon,
  LoaderIcon,
  UpdateIcon,
  CheckIcon,
} from "../svg/svgIcons";

const iconMap = {
  picker: PickerIcon,
  copy: CopyIcon,
  plus: PlusIcon,
  drag: DragIcon,
  trash: TrashIcon,
  settings: SettingsIcon,
  palette: PaletteIcon,
  sign: SignIcon,
  account: AccountIcon,
  loader: LoaderIcon,
  update: UpdateIcon,
  check: CheckIcon,
};

type SvgIdT = keyof typeof iconMap;

const SVGIcon = ({ svgID }: { svgID: SvgIdT }) => {
  const IconComponent = iconMap[svgID];

  return (
    <div className="svgIcon">
      <svg id={`${svgID}`} viewBox="0 0 88 88">
        {IconComponent && <IconComponent />}
      </svg>
    </div>
  );
};

export default SVGIcon;
export type { SvgIdT };
