// Логика иконки
let isActive = false;
let theme = "light";

function updateIcon() {
  const state = isActive ? "active" : "inactive";
  chrome.action.setIcon({
    path: {
      "16": `icons/${theme}-${state}-16.png`,
      "48": `icons/${theme}-${state}-48.png`,
      "128": `icons/${theme}-${state}-128.png`,
    },
  });
}

// При подключении popup
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "popup") {
    port.onMessage.addListener((msg) => {
      if (msg.type === "popup_opened") {
        isActive = true;
        updateIcon();
      }
    });

    port.onDisconnect.addListener(() => {
      isActive = false;
      updateIcon();

      // port.disconnect();
    });
  }
});

// слушаем сообщения
chrome.runtime.onMessage.addListener((message) => {
  // проверяем namespace
  if (message?.source !== "color-storage") return;

  // смена темы
  if (message.theme) {
    theme = message.theme;
    updateIcon();
  }

  // сообщения от сервера
  if (message.ok) {
    chrome.storage.local.set({ readyToFetch: true });
  }
});
