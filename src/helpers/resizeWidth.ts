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
      const elWidth = el.getBoundingClientRect().width;
      if (elWidth <= maxWidth.current && elWidth !== 181) {
        el.style.width = "181px";
      } else if (elWidth >= maxWidth.current && elWidth !== maxWidth.current) {
        el.style.width = `${maxWidth.current}px`;
      }
    },
    { signal }
  );
}

export default resizeWidth;
