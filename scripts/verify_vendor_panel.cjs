const fs = require('fs');

// We will use Chrome headless CLI to capture screenshots
// First let us get a valid token from the backend
(async () => {
  const loginRes = await fetch("http://localhost:5001/api/auth/vendor-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: "9876543210",
      storeName: "CONON Authorized Materials Store",
      name: "Master Supplier"
    })
  });
  const { token, user } = await loginRes.json();
  console.log("Got token for user:", user.name);

  // We can write an html helper or use Chrome with a small profile to test
})();
