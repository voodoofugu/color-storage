// класс для появления кнопки clear
const classChanger = (
  el: HTMLElement,
  minWidth: number,
  clearBtn: HTMLElement
) => {
  const width = parseFloat(el.style.width); // лучше чем clientWidth

  if (width <= minWidth + 4) {
    clearBtn.classList.add("view");
  } else if (clearBtn.classList.contains("view"))
    clearBtn.classList.remove("view");
};

function resizeWidth(
  el: HTMLElement,
  maxWidth: number,
  clearBtn: HTMLElement,
  clearBtnOnClick: () => void
) {
  const controller = new AbortController();
  const { signal } = controller;
  const rect = el.getBoundingClientRect();

  const minWidth = maxWidth - 40; // 224 - 40 (184);
  let clearReady = false;

  document.addEventListener(
    "mousemove",
    (moveEvent) => {
      document.body.style.cursor = "ew-resize";
      const moveX = moveEvent.clientX - rect.left;

      el.style.width = `${Math.min(
        Math.max(moveX, maxWidth - 100),
        maxWidth + 2
      )}px`;
      el.style.transition = "unset";

      classChanger(el, minWidth, clearBtn);

      // кнопка clear
      if (moveX < 80) {
        clearBtn.classList.remove("onDragEnter");
        clearBtn.classList.add("onClick");

        clearReady = true;
      }

      if (moveX >= 80) {
        clearBtn.classList.remove("onDragEnter");
        clearBtn.classList.remove("onClick");

        clearReady = false;
      }

      if (moveX < minWidth) {
        clearBtn.style.width = `${Math.min(
          Math.abs(moveX - minWidth) + 34,
          maxWidth - 130
        )}px`;
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
      const width = parseFloat(el.style.width);

      // выравниваем ширину
      if (width <= maxWidth && width !== minWidth) {
        el.style.width = `${minWidth}px`;
      } else if (width > maxWidth) {
        el.style.width = `${maxWidth}px`;
      }

      classChanger(el, minWidth, clearBtn);

      // кнопка clear
      if (parseFloat(clearBtn.style.width) < minWidth) {
        clearBtn.style.removeProperty("width");
      }

      if (clearReady) {
        clearBtnOnClick();
      }
    },
    { signal }
  );
}

export default resizeWidth;
