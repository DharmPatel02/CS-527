import React, { useState, useEffect } from "react";
import "./PasswordRequests.css";

const PasswordRequests = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/auth/null-passwords",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        setError("Failed to fetch password requests");
      }
    } catch (err) {
      setError("Error fetching requests");
    }
  };

  const handlePasswordUpdate = async (userId) => {
    const password = newPassword[userId];
    if (!password) {
      setError("Please enter a new password");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/update-password/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ password_hash: password }),
        }
      );

      if (response.ok) {
        setRequests(requests.filter((req) => req.userId !== userId));
        const updatedPasswords = { ...newPassword };
        delete updatedPasswords[userId];
        setNewPassword(updatedPasswords);
        setError("");
      } else {
        setError("Failed to update password");
      }
    } catch (err) {
      setError("Error updating password");
    }
  };

  return (
    <div className="password-requests-container">
      <h2>Password Reset Requests</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {requests.length === 0 ? (
        <p>No pending password reset requests</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Username</th>
              <th>New Password</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.userId}>
                <td>{request.userId}</td>
                <td>{request.username}</td>
                <td>
                  <input
                    type="password"
                    value={newPassword[request.userId] || ""}
                    onChange={(e) =>
                      setNewPassword({
                        ...newPassword,
                        [request.userId]: e.target.value,
                      })
                    }
                  />
                </td>
                <td>
                  <button onClick={() => handlePasswordUpdate(request.userId)}>
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PasswordRequests;


