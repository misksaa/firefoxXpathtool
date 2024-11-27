export async function getActiveTabURL() {
  let queryOptions = { active: true, lastFocusedWindow: true };

  // Use the browser API if available, otherwise fall back to chrome API
  const tabsAPI = window.browser?.tabs || chrome.tabs;

  try {
    let [tab] = await tabsAPI.query(queryOptions);
    return tab;
  } catch (error) {
    console.error("Error getting active tab:", error);
    return null;
  }
}
