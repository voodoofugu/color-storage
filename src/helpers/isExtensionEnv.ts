function isExtensionEnv(): boolean {
  return typeof chrome !== "undefined" && !!chrome.runtime?.id;
}

export default isExtensionEnv;
