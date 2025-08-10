function detectTheme() {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  chrome.runtime.sendMessage({
    type: "theme-changed",
    theme: isDark ? "dark" : "light",
  });
}

const media = window.matchMedia("(prefers-color-scheme: dark)");
media.addEventListener("change", detectTheme);

detectTheme(); // сразу отправляем при старте
