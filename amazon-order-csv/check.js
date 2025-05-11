document.addEventListener("DOMContentLoaded", () => {
      chrome.storage.local.get(["loggedIn"], function(result) {
        if (result.loggedIn) {
          window.location.href = "popup.html";
        } else {
          window.location.href = "login.html";
        }
      });
    });