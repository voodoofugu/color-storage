(function () {
  window.addEventListener("message", (e) => {
    if (e.source !== window) return; // только сообщения из этой страницы
    if (e.origin !== window.location.origin) return; // защита по origin

    const data = e.data;
    if (!data || data.source !== "color-storage") return; // простая сигнатура

    chrome.runtime.sendMessage({ ...data });
  });
})();
