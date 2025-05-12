document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ check.js loaded");

  chrome.storage.local.get(
    ["loggedIn", "userToken", "tokenExpiry", "refreshToken"],
    async (result) => {
      const now = Date.now();

      if (!result.loggedIn || !result.userToken || !result.tokenExpiry || !result.refreshToken) {
        console.log("Missing token info — redirecting to login");
        return redirectToLogin();
      }
      if (now < result.tokenExpiry - 60 * 1000) {
        console.log("Token still valid — redirecting to popup");
        return redirectToPopup();
      }
      console.log("⚠️ Token expired or about to expire — refreshing");

      try {
        const res = await fetch("http://localhost:3000/api/auth/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ refresh_token: result.refreshToken })
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("Refresh failed:", data.error);
          return redirectToLogin();
        }

        chrome.storage.local.set({
          userToken: data.token,
          refreshToken: data.refreshToken,
          tokenExpiry: Date.now() + data.expiresIn * 1000
        }, () => {
          console.log("Token refreshed — redirecting to popup");
          redirectToPopup();
        });

      } catch (err) {
        console.error("Error refreshing token:", err);
        redirectToLogin();
      }
    }
  );
});

function redirectToPopup() {
  window.location.href = "popup.html";
}

function redirectToLogin() {
  window.location.href = "login.html";
}
