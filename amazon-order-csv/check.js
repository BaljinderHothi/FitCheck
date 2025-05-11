document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ check.js loaded");

  chrome.storage.local.get(["loggedIn"], function(result) {
    console.log("➡️ LoggedIn status:", result.loggedIn);
    
    if (result.loggedIn) {
      window.location.href = "popup.html";
    } else {
      window.location.href = "login.html";
    }
  });
});
