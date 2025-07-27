import { useRef, useCallback, useState, useMemo } from "react";
import { MorphScroll } from "morphing-scroll";

import { state, actions } from "../../nexusConfig.ts";

import useDragImage from "../hooks/useDragImage";

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
  // nexus
  const mainColor = state.useNexus("mainColor");
  const colorStorage = state.useNexus("colorStorage");
  const failedColorAdding = state.useNexus("failedColorAdding");
  const activeColor = state.useNexus("activeColor");
  // const allState = state.useNexus();
  // console.log("allState", allState);

  // state
  const [activePalette, setActivePalette] = useState(
    Object.keys(colorStorage[0])[0]
  );

  // refs
  const resizeWrap = useRef<HTMLDivElement | null>(null);
  const maxWidth = useRef(0);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // hooks
  const startDrag = useDragImage({
    boxShadow:
      "inset 0 -1px 0 rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(0, 0, 0, 0.16)",
  });

  // functions
  const addColor = () => {
    actions.setNewPaletteColor(activePalette, mainColor);
  };

  const newGroup = () => {
    const paletteName = `palette-${colorStorage.length + 1}`;
    actions.setNewPalette(paletteName);
    setActivePalette(paletteName);
  };

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

  const handleDrop = useCallback(() => {
    if (
      dragItem.current === null ||
      dragOverItem.current === null ||
      dragItem.current === dragOverItem.current
    )
      return;

    const newColors = [
      ...colorStorage.find((p) => Object.keys(p)[0] === activePalette)![
        activePalette
      ],
    ];

    newColors.splice(
      dragOverItem.current,
      0,
      newColors.splice(dragItem.current, 1)[0]
    );

    document
      .querySelector(`[data-id="${dragOverItem.current}"]`)!
      .classList.remove("dragEnter");
    dragItem.current = null;
    dragOverItem.current = null;

    actions.setNewColorsOrder(activePalette, newColors);
  }, [colorStorage, activePalette]);

  const handelOnDragStart = useCallback((e: React.DragEvent, index: number) => {
    dragItem.current = index;

    startDrag(e);
  }, []);

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
        key={color}
        data={`${index}`}
        className={`storage-btn${color === activeColor ? " active" : ""}`}
        color={color}
        bgColor
        draggable
        onDragStart={(e) => handelOnDragStart(e, index)}
        onDragEnter={() => {
          dragOverItem.current = index;
          const enterEl = document.querySelector(`[data-id="${index}"]`);

          if (index !== dragItem.current) enterEl!.classList.add("dragEnter");
        }}
        onDragEnd={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => {
          dragOverItem.current = null;
          document
            .querySelector(`[data-id="${index}"]`)!
            .classList.remove("dragEnter");
        }}
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
              // className="scroll-component"
              size="auto"
              objectsSize={30}
              gap={10}
              progressTrigger={{
                wheel: true,
                progressElement: <div className="scroll-thumb" />,
              }}
              wrapperAlign={["start", "center"]}
              edgeGradient={{ size: 20 }}
              direction="x"
              scrollBarOnHover
              wrapperMargin={[14, 0]}
            >
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
