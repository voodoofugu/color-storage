import { useRef, useCallback, useState, useMemo } from "react";
import { MorphScroll } from "morphing-scroll";

import { state, actions } from "../../nexusConfig.ts";

import Button from "./Button";

function resizeWidth(
  el: HTMLElement,
  maxWidth: React.MutableRefObject<number>
) {
  const controller = new AbortController();
  const { signal } = controller;

  document.addEventListener(
    "mousemove",
    (moveEvent) => {
      document.body.style.cursor = "ew-resize";

      const rect = el.getBoundingClientRect();
      if (!maxWidth.current) maxWidth.current = rect.width;

      el.style.width = `${Math.min(
        Math.max(moveEvent.clientX - rect.left, 180),
        maxWidth.current
      )}px`;
    },
    { signal }
  );

  document.addEventListener(
    "mouseup",
    () => {
      controller.abort();
      document.body.style.removeProperty("cursor");
    },
    { signal }
  );
}

function StorageColors() {
  const mainColor = state.useNexus("mainColor");
  const colorStorage = state.useNexus("colorStorage");
  const failedColorAdding = state.useNexus("failedColorAdding");
  const activeColor = state.useNexus("activeColor");
  // const allState = state.useNexus();
  // console.log("allState", allState);

  const [activePalette, setActivePalette] = useState(
    Object.keys(colorStorage[0])[0]
  );

  const addColor = () => {
    actions.setNewPaletteColor(activePalette, mainColor);
  };

  const newGroup = () => {
    const paletteName = `palette-${colorStorage.length + 1}`;
    actions.setNewPalette(paletteName);
    setActivePalette(paletteName);
  };

  const resizeWrap = useRef<HTMLDivElement | null>(null);
  const maxWidth = useRef(0);

  const onMove = useCallback(() => {
    if (!resizeWrap.current) return;
    resizeWidth(resizeWrap.current!, maxWidth);
  }, []);

  const paletteMenu = useCallback(() => {
    return (
      <select
        value={activePalette}
        onChange={(e) => setActivePalette(e.target.value)}
      >
        {colorStorage.map((palette, index) => {
          const paletteName = Object.keys(palette)[0];

          return (
            <option key={index} value={paletteName}>
              {paletteName}
            </option>
          );
        })}
      </select>
    );
  }, [colorStorage, activePalette]);

  const colorButtonsArray = useMemo(() => {
    const currentPalette = colorStorage.find(
      (palette) => Object.keys(palette)[0] === activePalette
    );

    return currentPalette ? Object.values(currentPalette)[0] : [];
  }, [colorStorage, activePalette]);

  const colorDefaultButtons = useMemo(() => {
    if (colorButtonsArray.length < 4) {
      const defaultButtonsCount = 4 - colorButtonsArray.length;

      return Array.from({ length: defaultButtonsCount }, (_, index) => (
        <Button key={`default-${index}`} className="storage-btn default" />
      ));
    }
  }, [colorButtonsArray]);

  const colorButtons = useMemo(() => {
    return colorButtonsArray.map((color, index) => (
      <Button
        key={index}
        className={`storage-btn${color === activeColor ? " active" : ""}`}
        color={color}
        bgColor
        onClick={() => actions.setActiveColor(color)}
      />
    ));
  }, [colorButtonsArray, activeColor]);

  return (
    <div className="storage-box">
      <div className="container">
        <div className="menu-wrap">
          <div className="menu">{paletteMenu()}</div>

          <Button
            svgID="plus"
            className="menu-btn"
            onClick={() => newGroup()}
          />
          <Button className="menu-btn text" text="rename" onClick={() => {}} />
        </div>

        <div className="scroll-wrap" ref={resizeWrap}>
          <div className="scroll">
            <MorphScroll
              // className="scroll"
              size="auto"
              objectsSize={30}
              gap={10}
              progressTrigger={{
                wheel: true,
                progressElement: <div className="scroll-thumb" />,
              }}
              wrapperAlign={["start", "center"]}
              edgeGradient={{ size: 32 }}
              direction="x"
              scrollBarOnHover
              wrapperMargin={[4, 0]}
            >
              {/* <Button
                className="storage-btn add-color"
                svgID="plus"
                onClick={() => {}}
              />
              <Button
                className="storage-btn"
                color="#fbff00"
                bgColor
                onClick={() => countUp()}
              />
              <Button className="storage-btn default" />
              <Button className="storage-btn default" />
              <Button className="storage-btn default" /> */}

              <Button
                key={0}
                className={`storage-btn add-color${
                  failedColorAdding ? " failed" : ""
                }`}
                svgID="plus"
                onClick={addColor}
              />
              {colorButtons}
              {colorDefaultButtons}
            </MorphScroll>
          </div>

          <Button className="drag" svgID="drag" onMouseDown={onMove} />
        </div>
      </div>
    </div>
  );
}

StorageColors.displayName = "StorageColors";
export default StorageColors;
