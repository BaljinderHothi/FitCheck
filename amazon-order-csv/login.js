console.log("✅ login.js is running");

document.getElementById("login-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  console.log("Sending login fetch...");
  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    console.log("Got response:", response.status);
    const data = await response.json();
    console.log("Login response data:", data);
  
    if (!response.ok) {
      alert(data.error || "Login failed");
      return;
    }
  
    chrome.storage.local.set({
      loggedIn: true,
      userToken: data.token,
      userId: data.user.id
    }, () => {
      console.log("✅ Set storage complete"); // Check if this logs at all
    
      chrome.runtime.lastError
        ? console.error("Storage error:", chrome.runtime.lastError)
        : console.log("User authenticated:", data.user.id);
    
      chrome.storage.local.get(["userToken", "userId"], (result) => {
        console.log("✅ Retrieved after saving:", result);
      });
    
      window.location.href = "popup.html";
    });
    
  } catch (err) {
    console.error("Login error:", err);
    alert("Login request failed");
  }
});
