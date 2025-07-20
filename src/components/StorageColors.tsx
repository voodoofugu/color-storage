import React, { useRef, useCallback } from "react";

// import useNexus from "../stateMachine/useNexus";
import { state, actions } from "../stateMachine/allStore";

import { MorphScroll } from "morphing-scroll";
import Button from "./Button";

// types for Redux DevTools
interface ReduxDevToolsConnection {
  send: (action: unknown, state: unknown) => void;
  init: (state: unknown) => void;
}
interface ReduxDevToolsExtension {
  connect(options: { name: string }): ReduxDevToolsConnection;
}
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: ReduxDevToolsExtension;
  }
}
// ----------------

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
  // const allStore = state.useNexus(); // react
  // const allStore = state.getNexus(); // node

  const count = state.useNexus("count"); // react
  // const count = state.getNexus().count; // node

  console.log("count", count);

  // const sum = state.useNexusSelector(
  //   (state) => state.count + state.count2,
  //   ["count", "count2"]
  // );
  // console.log("sum", sum);

  const countUp = () => {
    // state.setNexus({ count: state.getNexus().count + 1 });
    state.setNexus((prev) => ({
      count: prev.count + 1,
    }));

    // actions.increment();
    // actions.increment();
    // console.log("count", state.getNexus().count);

    // actions.incrementBy(20);
  };

  const resizeWrap = useRef<HTMLDivElement | null>(null);
  const maxWidth = useRef(0);

  const onMove = useCallback(() => {
    if (!resizeWrap.current) return;
    resizeWidth(resizeWrap.current!, maxWidth);
  }, []);

  // middleWare
  // const devtools = window.__REDUX_DEVTOOLS_EXTENSION__?.connect({
  //   name: "MyStore",
  // });
  // devtools?.init(state.getNexus());

  // state.nexusGate((_, next) => {
  //   devtools?.send?.({ type: "UPDATE" }, next);
  // });
  // ----------------

  return (
    <div className="storage-box">
      <div className="container">
        <div className="menu-wrap">
          <div className="menu">
            <select value="palette-1" onChange={() => {}}>
              <option value="palette-1">palette-1</option>
            </select>
          </div>

          <Button svgID="plus" className="menu-btn" onClick={() => {}} />
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
              edgeGradient
              direction="x"
              scrollBarOnHover
            >
              <Button
                className="storage-btn add-color"
                svgID="plus"
                onClick={() => {}}
              />
              <Button
                className="storage-btn"
                color="yellow"
                bgColor
                onClick={() => countUp()}
              />
              <Button
                className="storage-btn default"
                // color={colorWithAlpha}
                onClick={() => {}}
              />
              <Button
                className="storage-btn default"
                // color={colorWithAlpha}
                onClick={() => {}}
              />
              <Button
                className="storage-btn default"
                // color={colorWithAlpha}
                onClick={() => {}}
              />
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
