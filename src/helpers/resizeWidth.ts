// класс для появления кнопки clear
const classChange = (
  el: HTMLElement,
  minWidth: number,
  clearBtn: HTMLElement
) => {
  const width = parseFloat(el.style.width); // лучше чем clientWidth

  if (width <= minWidth + 10) {
    clearBtn.classList.add("view");
  } else if (clearBtn.classList.contains("view"))
    clearBtn.classList.remove("view");
};

function resizeWidth(el: HTMLElement, maxWidth: number, clearBtn: HTMLElement) {
  const controller = new AbortController();
  const { signal } = controller;
  const rect = el.getBoundingClientRect();

  const minWidth = maxWidth - 40; // 224 - 40 (184);

  document.addEventListener(
    "mousemove",
    (moveEvent) => {
      document.body.style.cursor = "ew-resize";
      const x = moveEvent.clientX - rect.left;

      el.style.width = `${Math.min(Math.max(x, minWidth), maxWidth + 2)}px`;
      el.style.transition = "unset";

      classChange(el, minWidth, clearBtn);

      if (x < minWidth - 10) {
        // clearBtn.classList.add("onDragEnter"); дописать!!!
      }
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
      if (elWidth <= maxWidth && elWidth !== minWidth) {
        el.style.width = `${minWidth}px`;
      } else if (elWidth > maxWidth) {
        el.style.width = `${maxWidth}px`;
      }

      classChange(el, minWidth, clearBtn);
    },
    { signal }
  );
}

export default resizeWidth;
