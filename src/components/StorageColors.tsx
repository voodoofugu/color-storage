import { useRef, useCallback, useState, useMemo, useEffect } from "react";
import { MorphScroll } from "morphing-scroll";

import { state, actions } from "../../nexusConfig.ts";

import useDragImage from "../hooks/useDragImage";

import Button from "./Button";

import sanitizeInputName from "../helpers/sanitizeInputName";

function resizeWidth(
  el: HTMLElement,
  maxWidth: React.MutableRefObject<number>
) {
  const controller = new AbortController();
  const { signal } = controller;
  const rect = el.getBoundingClientRect();
  if (!maxWidth.current) maxWidth.current = rect.width;

  document.addEventListener(
    "mousemove",
    (moveEvent) => {
      document.body.style.cursor = "ew-resize";

      el.style.width = `${Math.min(
        Math.max(moveEvent.clientX - rect.left, 181),
        maxWidth.current + 2
      )}px`;
      el.style.transition = "unset";
    },
    { signal }
  );

  document.addEventListener(
    "mouseup",
    () => {
      controller.abort();
      document.body.style.removeProperty("cursor");
      el.style.removeProperty("transition");

      // выравниваем ширину
      // кажется лучше использовать 220 вместо maxWidth.current
      const elWidth = el.getBoundingClientRect().width;
      if (elWidth <= 202 && elWidth !== 181) {
        el.style.width = "181px";
      } else if (elWidth >= 203 && elWidth !== maxWidth.current) {
        el.style.width = `${maxWidth.current}px`;
      }
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

  // state:
  const [_, forceUpdate] = useState<number>(0); // для принудительного обновления
  const triggerUpdate = () => {
    forceUpdate((x) => (typeof x === "number" && x < 1000 ? x + 1 : 0));
  };

  // refs
  const resizeWrap = useRef<HTMLDivElement | null>(null);
  const maxWidth = useRef(0);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // update refs
  const activePalette = useRef(
    colorStorage.length ? Object.keys(colorStorage[0])[0] : ""
  );
  const newPaletteName = useRef("");

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
      ...colorStorage.find((p) => Object.keys(p)[0] === activePalette.current)![
        activePalette.current
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
      colorStorage[currentPaletteId][activePalette.current][dragItem.current!]
    );
    const leaveEl = document.querySelector(`.clear-btn`);
    leaveEl!.classList.remove("onDragEnter");
    removeWidth();
  }, [currentPaletteId, activePalette.current, colorStorage, removeWidth]);

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

  const renameHandler = useCallback(() => {
    newPaletteName.current = activePalette.current;
    triggerUpdate();

    const enterEl = document.querySelector(
      `.palette-input`
    ) as HTMLInputElement;
    if (!enterEl) return;

    enterEl!.focus();
  }, [newPaletteName.current, activePalette.current]);

  // effects
  useEffect(() => {
    activePalette.current = colorStorage.length
      ? Object.keys(colorStorage[currentPaletteId])[0]
      : "";

    triggerUpdate();
  }, [currentPaletteId, JSON.stringify(colorStorage)]);

  // variables
  const paletteMenu = useMemo(() => {
    return (
      <>
        <select
          className="palette-select"
          value={activePalette.current}
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

        <input
          className="palette-input"
          type="text"
          value={newPaletteName.current}
          onChange={(e) => {
            newPaletteName.current = sanitizeInputName(e.target.value);
            triggerUpdate();
          }}
          onFocus={() => {
            newPaletteName.current = activePalette.current;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const activeElement = document.activeElement as HTMLElement;
              activeElement!.blur();
            }
          }}
          onBlur={() => {
            if (
              newPaletteName.current &&
              newPaletteName.current !== activePalette.current
            ) {
              actions.paletteRename(newPaletteName.current);
            }
          }}
        />
      </>
    );
  }, [
    JSON.stringify(colorStorage),
    activePalette.current,
    newPaletteName.current,
  ]);

  // const colorButtonsArray = useMemo(() => {
  //   const currentPalette =
  //     colorStorage[currentPaletteId][activePalette.current];

  //   return currentPalette ? currentPalette : [];
  // }, [JSON.stringify(colorStorage), activePalette.current, currentPaletteId]);

  const colorDefaultButtons = useCallback((colorButtonsArray: string[]) => {
    if (colorButtonsArray.length < 4) {
      const defaultButtonsCount = 4 - colorButtonsArray.length;

      return Array.from({ length: defaultButtonsCount }, (_, index) => (
        <Button key={`default-${index}`} className="storage-btn default" />
      ));
    }
  }, []);

  const colorButtons = useCallback(
    (colorButtonsArray: string[]) => {
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
    },
    [mainColor, handelOnDragStart, handleDrop, onDragOver]
  );

  const scrollWithButtons = useMemo(() => {
    if (colorStorage.length > 0) {
      return colorStorage.map((palette, index) => {
        const [name, colors] = Object.entries(palette)[0];
        return (
          <MorphScroll
            className="color-scroll"
            key={name}
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
              key="add"
              className={`storage-btn add-color${
                failedColorAdding ? " failed" : ""
              }`}
              svgID="plus"
              onClick={addColor}
            />
            {colorButtons(colors)}
            {colorDefaultButtons(colors)}
          </MorphScroll>
        );
      });
    }

    return null;
  }, [
    JSON.stringify(colorStorage),
    failedColorAdding,
    addColor,
    colorButtons,
    colorDefaultButtons,
  ]);

  return colorStorage.length > 0 ? (
    <div className="storage-box">
      <Button
        className="clear-btn"
        onDrop={clearBtnOnDrop}
        onDragEnter={clearBtnOnEnter}
        onDragLeave={clearBtnOnDragLeave}
        onDragOver={onDragOver}
        onClick={clearBtnOnClick}
        svgID="trash"
      />

      <div className="container">
        <div className="menu-wrap">
          <div className="menu">{paletteMenu}</div>

          <Button svgID="plus" className="menu-btn" onClick={newGroup} />
          <Button
            className="menu-btn text"
            text="rename"
            onClick={renameHandler}
          />
        </div>

        <div className="scroll-wrap" ref={resizeWrap}>
          <div className="scroll">
            <MorphScroll
              className="palette-scroll"
              progressTrigger={{
                wheel: true,
                progressElement: <div className="scroll-thumb" />,
              }}
              size="auto"
              objectsSize="size"
              gap={10}
              render={{ type: "virtual" }}
            >
              {scrollWithButtons}
            </MorphScroll>
          </div>

          <Button className="drag" svgID="drag" onMouseDown={onMove} />
        </div>
      </div>
    </div>
  ) : (
    <div className="storage-box empty">
      <div className="container">
        <div className="menu-wrap">
          <Button
            svgID="plus"
            className="menu-btn"
            text="add palette"
            onClick={newGroup}
          />
        </div>
      </div>
    </div>
  );
}

StorageColors.displayName = "StorageColors";
export default StorageColors;
