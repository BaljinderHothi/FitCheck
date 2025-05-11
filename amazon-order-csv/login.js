document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();

  // Fake login logic for now
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Simulate login success
  //we need to replace this with actual authentication logic
  // For now, we will just check if username is "user" and password is "pass"
  if (username === "user" && password === "pass") {
    chrome.storage.local.set({ loggedIn: true }, function () {
      window.location.href = "popup.html";
    });
  } else {
    alert("Invalid credentials");
  }
});
