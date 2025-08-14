const PickerIcon = () => {
  return (
    <g className="svgLine">
      <path d="M30.67,63.58l-7.27,1.45c-.66.13-1.25-.45-1.11-1.11l1.45-7.27c.1-.5.34-.95.7-1.31l23.01-23.01,7.54,7.54-23.01,23.01c-.36.36-.81.6-1.31.7Z"></path>
      <rect
        x="43.93"
        y="34.4"
        width="15.99"
        height="1.99"
        transform="translate(40.23 -26.35) rotate(45)"
      ></rect>
      <path
        d="M58.04,21.59h0c2.08,0,3.77,1.69,3.77,3.77v11.59h-7.53v-11.59c0-2.08,1.69-3.77,3.77-3.77Z"
        transform="translate(37.7 -32.47) rotate(45)"
      ></path>
    </g>
  );
};

const CopyIcon = () => {
  return (
    <g className="svgLine">
      <rect x={26} y={22} width={28} height={36} />
      <path d="M34,66h22c3.31,0,6-2.69,6-6v-30" />
    </g>
  );
};

const PlusIcon = () => {
  return (
    <g className="svgLine">
      <path d="M44 66V22" />
      <path d="M66 44H22" />
    </g>
  );
};

const DragIcon = () => {
  return (
    <g className="svgLine">
      <line x1="58" y1="66" x2="58" y2="22" />
      <line x1="30" y1="66" x2="30" y2="22" />
    </g>
  );
};

const TrashIcon = () => {
  return (
    <g className="svgLine">
      <g className="cap">
        <path d="M38 22C38 20.8954 38.8954 20 40 20H50C51.1046 20 52 20.8954 52 22V27H38V22Z" />
        <path d="M26 31C26 28.7909 27.7909 27 30 27H60C62.2091 27 64 28.7909 64 31V35C64 35.5523 63.5523 36 63 36H27C26.4477 36 26 35.5523 26 35V31Z" />
      </g>
      <path d="M29 36H61L59.7243 63.1875C59.6242 65.3214 57.865 67 55.7287 67H34.2713C32.135 67 30.3758 65.3214 30.2757 63.1875L29 36Z" />
      <path d="M37 42V59.2552" />
      <path d="M45 42V59.2552" />
      <path d="M53 42V59.2552" />
    </g>
  );
};

export { PickerIcon, CopyIcon, PlusIcon, DragIcon, TrashIcon };
