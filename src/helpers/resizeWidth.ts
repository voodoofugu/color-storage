function resizeWidth(
  el: HTMLElement,
  maxWidth: React.MutableRefObject<number>
) {
  const controller = new AbortController();
  const { signal } = controller;
  const rect = el.getBoundingClientRect();
  if (!maxWidth.current) maxWidth.current = rect.width;

  const minWidth = 181;

  document.addEventListener(
    "mousemove",
    (moveEvent) => {
      document.body.style.cursor = "ew-resize";

      el.style.width = `${Math.min(
        Math.max(moveEvent.clientX - rect.left, minWidth),
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
      const elWidth = el.getBoundingClientRect().width;
      if (elWidth <= maxWidth.current && elWidth !== minWidth) {
        el.style.width = `${minWidth}px`;
      } else if (elWidth > maxWidth.current) {
        el.style.width = `${maxWidth.current}px`;
      }
    },
    { signal }
  );
}

export default resizeWidth;
