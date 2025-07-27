import { useCallback, useRef } from "react";

function useDragImage(style?: Partial<CSSStyleDeclaration>) {
  const ghostRef = useRef<HTMLElement | null>(null);

  const startDrag = useCallback(
    (e: React.DragEvent) => {
      const sourceEl = e.currentTarget as HTMLElement;
      const clone = sourceEl.cloneNode(true) as HTMLElement;

      // Обязательные стили
      Object.assign(clone.style, {
        ...style,
      });

      document.body.appendChild(clone);
      ghostRef.current = clone;

      // Обязательно задать размеры!
      const { width, height } = sourceEl.getBoundingClientRect();
      clone.style.width = `${width}px`;
      clone.style.height = `${height}px`;

      e.dataTransfer.setDragImage(clone, width / 2, height / 2);

      // Удалить после кадра
      requestAnimationFrame(() => {
        document.body.removeChild(clone);
        ghostRef.current = null;
      });
    },
    [style]
  );

  return startDrag;
}

export default useDragImage;
