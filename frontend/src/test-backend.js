// Test script to verify backend connectivity
const testBackend = async () => {
  const API_URL =
    process.env.REACT_APP_API_URL ||
    "https://vehicle-auction-system-backend.onrender.com";

  console.log("Testing backend connectivity...");
  console.log("API URL:", API_URL);

  try {
    // Test health endpoint
    const healthResponse = await fetch(`${API_URL}/health`);
    console.log("Health check status:", healthResponse.status);

    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log("Health check response:", healthData);
    }

    // Test CORS with a simple GET request
    const corsResponse = await fetch(`${API_URL}/auth/auction-items/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("CORS test status:", corsResponse.status);

    if (corsResponse.ok) {
      const corsData = await corsResponse.json();
      console.log(
        "CORS test successful, data received:",
        corsData.length,
        "items"
      );
    } else {
      console.error("CORS test failed:", corsResponse.statusText);
    }
  } catch (error) {
    console.error("Backend test failed:", error);
  }
};

// Export for use in components
export default testBackend;
