// CORS-specific test
const testCORS = async () => {
  const API_URL =
    process.env.REACT_APP_API_URL ||
    "https://vehicle-auction-system-backend.onrender.com";

  console.log("Testing CORS configuration...");
  console.log("API URL:", API_URL);
  console.log("Origin:", window.location.origin);

  try {
    // Test OPTIONS request (preflight)
    console.log("Testing OPTIONS preflight request...");
    const optionsResponse = await fetch(`${API_URL}/auth/signup`, {
      method: "OPTIONS",
      headers: {
        Origin: window.location.origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type, Authorization",
      },
    });

    console.log("OPTIONS response status:", optionsResponse.status);
    console.log("OPTIONS response headers:");
    optionsResponse.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    // Test actual POST request
    console.log("\nTesting actual POST request...");
    const postResponse = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: window.location.origin,
      },
      body: JSON.stringify({
        username: "test",
        password: "test123",
        email: "test@test.com",
        role: "buyer",
      }),
    });

    console.log("POST response status:", postResponse.status);
    console.log("POST response headers:");
    postResponse.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    if (postResponse.ok) {
      const data = await postResponse.text();
      console.log("POST response body:", data);
    } else {
      console.error("POST request failed:", postResponse.statusText);
    }
  } catch (error) {
    console.error("CORS test failed:", error);
  }
};

export default testCORS;
