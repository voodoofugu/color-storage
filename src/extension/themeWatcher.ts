function sendTheme() {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  chrome.runtime.sendMessage({
    source: "color-storage",
    type: "theme",
    theme: isDark ? "dark" : "light",
  });
}

// отправляем сразу при загрузке страницы
sendTheme();

// слушаем изменения
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", sendTheme);
