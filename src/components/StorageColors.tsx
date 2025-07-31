import { useRef, useCallback, useState, useMemo, useEffect } from "react";
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
        Math.max(moveEvent.clientX - rect.left, 181),
        maxWidth.current
      )}px`;
      el.style.animation = "unset";
    },
    { signal }
  );

  document.addEventListener(
    "mouseup",
    () => {
      controller.abort();
      document.body.style.removeProperty("cursor");
      el.style.removeProperty("animation");
    },
    { signal }
  );
}

function StorageColors() {
  // nexus
  const mainColor = state.useNexus("mainColor");
  const colorStorage = state.useNexus("colorStorage");
  const failedColorAdding = state.useNexus("failedColorAdding");
  const currentPaletteId = state.useNexus("currentPaletteId");
  // const allState = state.useNexus();

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
    actions.setNewPaletteColor(mainColor);
  };

  const newGroup = () => {
    actions.setNewPalette();
    actions.setCurrentPaletteId();
  };

  const onMove = useCallback(() => {
    if (!resizeWrap.current) return;
    resizeWidth(resizeWrap.current!, maxWidth);
  }, []);

  const paletteMenu = useCallback(() => {
    return (
      <select
        value={activePalette}
        onChange={(e) => {
          const selectedName = e.target.value;
          const selectedIndex = colorStorage.findIndex(
            (palette) => Object.keys(palette)[0] === selectedName
          );

          actions.setCurrentPaletteId(selectedIndex);
        }}
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

  const handelOnDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      dragItem.current = index;

      const enterEl = document.querySelector(`.scroll-wrap`) as HTMLDivElement;
      enterEl!.style.width = `181px`;

      startDrag(e);
    },
    [startDrag]
  );

  const removeWidth = useCallback(() => {
    const enterEl = document.querySelector(`.scroll-wrap`) as HTMLDivElement;
    enterEl!.style.removeProperty("width");
  }, []);

  const handleDrop = useCallback(() => {
    removeWidth();

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

    actions.setNewColorsOrder(newColors);
  }, [currentPaletteId, colorStorage, removeWidth]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const clearBtnOnDrop = useCallback(() => {
    actions.clearColor(
      colorStorage[currentPaletteId][activePalette][dragItem.current!]
    );
    const leaveEl = document.querySelector(`.clear-btn`);
    leaveEl!.classList.remove("onDragEnter");
    removeWidth();
  }, [currentPaletteId, activePalette, colorStorage, removeWidth]);

  const clearBtnOnEnter = useCallback(() => {
    const enterEl = document.querySelector(`.clear-btn`);
    enterEl!.classList.add("onDragEnter");
  }, []);

  const clearBtnOnDragLeave = useCallback(() => {
    const leaveEl = document.querySelector(`.clear-btn`);
    leaveEl!.classList.remove("onDragEnter");
  }, []);

  const clearBtnOnClick = useCallback(() => {
    actions.deleteCurrentPalette(currentPaletteId!);
    removeWidth();
  }, [removeWidth, currentPaletteId]);

  // effects
  useEffect(() => {
    setActivePalette(Object.keys(colorStorage[currentPaletteId])[0]);
  }, [currentPaletteId, colorStorage.length]);

  // variables
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
        className={`storage-btn${color === mainColor ? " active" : ""}`}
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
        onDragOver={onDragOver}
        onDragLeave={() => {
          dragOverItem.current = null;
          document
            .querySelector(`[data-id="${index}"]`)!
            .classList.remove("dragEnter");
        }}
        onClick={() => actions.setActiveColor(color)}
      />
    ));
  }, [colorButtonsArray, mainColor, handelOnDragStart, handleDrop, onDragOver]);

  return (
    <div className="storage-box">
      <Button
        className="clear-btn"
        onDrop={clearBtnOnDrop}
        onDragEnter={clearBtnOnEnter}
        onDragLeave={clearBtnOnDragLeave}
        onDragOver={onDragOver}
        onClick={clearBtnOnClick}
      />

      <div className="container">
        <div className="menu-wrap">
          <div className="menu">{paletteMenu()}</div>

          <Button svgID="plus" className="menu-btn" onClick={newGroup} />
          <Button className="menu-btn text" text="rename" onClick={() => {}} />
        </div>

        <div className="scroll-wrap" ref={resizeWrap}>
          <div className="scroll">
            <MorphScroll
              // className="scroll-component"
              size="auto"
              objectsSize={30}
              gap={11}
              progressTrigger={{
                wheel: true,
                progressElement: <div className="scroll-thumb" />,
              }}
              wrapperAlign={["start", "center"]}
              edgeGradient={{ size: 20 }}
              direction="x"
              scrollBarOnHover
              wrapperMargin={[10, 0]}
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
