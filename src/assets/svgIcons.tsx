const PickerIcon = () => {
  return (
    <g>
      <path
        className="svgLine"
        d="M30.67,63.58l-7.27,1.45c-.66.13-1.25-.45-1.11-1.11l1.45-7.27c.1-.5.34-.95.7-1.31l23.01-23.01,7.54,7.54-23.01,23.01c-.36.36-.81.6-1.31.7Z"
      ></path>
      <rect
        className="svgLine"
        x="43.93"
        y="34.4"
        width="15.99"
        height="1.99"
        transform="translate(40.23 -26.35) rotate(45)"
      ></rect>
      <path
        className="svgLine"
        d="M58.04,21.59h0c2.08,0,3.77,1.69,3.77,3.77v11.59h-7.53v-11.59c0-2.08,1.69-3.77,3.77-3.77Z"
        transform="translate(37.7 -32.47) rotate(45)"
      ></path>
    </g>
  );
};

const CopyIcon = () => {
  return (
    <g>
      <rect className="svgLine" x={26} y={22} width={28} height={36} />
      <path className="svgLine" d="M34,66h22c3.31,0,6-2.69,6-6v-30" />
    </g>
  );
};

export { PickerIcon, CopyIcon };
