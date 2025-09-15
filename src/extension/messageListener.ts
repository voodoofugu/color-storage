(function () {
  window.addEventListener("message", (e) => {
    if (e.source !== window) return; // только сообщения из этой страницы
    if (e.origin !== window.location.origin) return; // защита по origin
    const data = e.data;
    if (!data || data.__cs !== "color-storage") return; // простая сигнатура

    if (
      data.payment === "pending" ||
      data.payment === "success" ||
      data.payment === "cancel"
    ) {
      chrome.runtime.sendMessage({ ...data });
    }
  });
})();
