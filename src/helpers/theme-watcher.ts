// script для background
function sendTheme() {
  const theme = matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  chrome.runtime.sendMessage({ type: "theme-changed", theme });
}

// Первичная отправка
sendTheme();

// Слушаем смену темы
matchMedia("(prefers-color-scheme: dark)").addEventListener(
  "change",
  sendTheme
);
