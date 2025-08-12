import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CustomerRepresentatives.css";
import { API_ENDPOINTS } from "../config/api";

const CustomerRepresentative = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    phoneNumber: "",
    password_hash: "",
  });
  const [auctionIdQA, setAuctionIdQA] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answerInput, setAnswerInput] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [passwordRequests, setPasswordRequests] = useState([]);
  const [passwordInputs, setPasswordInputs] = useState({});
  const [showPasswordRequests, setShowPasswordRequests] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const fetchAuctionQuestions = async () => {
    if (!auctionIdQA) {
      setError("Please enter an Auction ID");
      return;
    }

    setError("");
    setQuestions([]); // Clear previous questions
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching questions with token:", token); // Debug log

      // Fetch answered questions
      const answeredResponse = await fetch(
        `${API_ENDPOINTS.BASE_URL}/auth/auction-items/getallquessans/${auctionIdQA}`,
        {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!answeredResponse.ok) {
        throw new Error(
          `Failed to fetch answered questions: ${answeredResponse.statusText}`
        );
      }
      // Parse answered (handle 204/empty body)
      const answeredText = await answeredResponse.text();
      const answeredQuestions = answeredText ? JSON.parse(answeredText) : [];
      let combinedQuestions = Array.isArray(answeredQuestions)
        ? answeredQuestions
        : [];

      // Fetch unanswered questions
      try {
        const unansweredResponse = await fetch(
          `${API_ENDPOINTS.BASE_URL}/auth/auction-items/questions/unanswered/${auctionIdQA}`,
          {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!unansweredResponse.ok) {
          throw new Error(
            `Failed to fetch unanswered questions: ${unansweredResponse.statusText}`
          );
        }

        const unansweredText = await unansweredResponse.text();
        const unansweredQuestions = unansweredText
          ? JSON.parse(unansweredText)
          : [];
        const unansweredArray = Array.isArray(unansweredQuestions)
          ? unansweredQuestions
          : [];
        combinedQuestions = [...combinedQuestions, ...unansweredArray];
      } catch (unansweredError) {
        console.error("Error fetching unanswered questions:", unansweredError);
      }

      // Remove duplicates
      const uniqueQuestions = combinedQuestions.filter(
        (question, index, self) =>
          self.findIndex(
            (q) => String(q.questionId) === String(question.questionId)
          ) === index
      );

      setQuestions(uniqueQuestions);

      if (uniqueQuestions.length === 0) {
        setError("No questions found for this auction.");
      }
    } catch (err) {
      console.error("Error in fetchAuctionQuestions:", err);
    }
  };

  const handleAnswerSubmit = async (questionId, auctionId) => {
    if (!answerInput.trim()) {
      console.error("Please enter an answer");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_ENDPOINTS.BASE_URL}/auth/auction-items/update_answer/${questionId}/${auctionId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            answer: answerInput,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to submit answer");

      await fetchAuctionQuestions();
      setAnswerInput("");
      setSelectedQuestion(null);
      alert("Answer submitted successfully!");
    } catch (err) {
      console.error("Error submitting answer:", err);
    }
  };

  const handleCancelQA = () => {
    setAuctionIdQA("");
    setQuestions([]);
    setAnswerInput("");
    setSelectedQuestion(null);
    setError("");
  };

  const handleCancelSearch = () => {
    setUserId("");
    setUserData(null);
    setFormData({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      address: "",
      phoneNumber: "",
      password_hash: "",
    });
    setError("");
  };

  const fetchPasswordRequests = async () => {
    setError("");
    setPasswordRequests([]);
    setShowPasswordRequests(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.NULL_PASSWORDS, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        setError("There are no password requests.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch password requests");
      }

      const data = await response.json();
      setPasswordRequests(data);
      // Initialize password inputs for each user
      const initialPasswordInputs = data.reduce((acc, user) => {
        acc[user.user_id] = "";
        return acc;
      }, {});
      setPasswordInputs(initialPasswordInputs);

      if (data.length === 0) {
        setError("There are no password requests.");
      }
    } catch (err) {
      console.error("Error fetching password requests:", err);
      setError(err.message);
    }
  };

  const handlePasswordInputChange = (userId, value) => {
    setPasswordInputs({
      ...passwordInputs,
      [userId]: value,
    });
  };

  const handleSetPassword = async (userId) => {
    const password = passwordInputs[userId];
    if (!password || password.trim() === "") {
      alert("Please enter a password");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_ENDPOINTS.BASE_URL}/auth/pwd_change/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            password_hash: password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to set password");
      }

      alert("Password set successfully!");
      await fetchPasswordRequests(); // Refresh the list
    } catch (err) {
      console.error("Error setting password:", err);
      alert("Failed to set password. Please try again.");
    }
  };

  const handleCancelPasswordRequests = () => {
    setShowPasswordRequests(false);
    setPasswordRequests([]);
    setPasswordInputs({});
    setError("");
  };

  const renderQASection = () => (
    <div className="qa-management-section">
      <h2>Question & Answer Management</h2>

      <div className="search-section">
        <input
          type="text"
          placeholder="Enter Auction ID"
          value={auctionIdQA}
          onChange={(e) => setAuctionIdQA(e.target.value)}
        />
        <button onClick={fetchAuctionQuestions}>Load Questions</button>
        <button onClick={handleCancelQA}>Cancel</button>
      </div>

      {error && !showPasswordRequests && (
        <p className="error-message">{error}</p>
      )}

      {questions.length > 0 && (
        <div className="questions-list">
          {questions.map((q) => (
            <div key={q.questionId} className="question-item">
              <div className="question-content">
                <strong>Question:</strong> {q.question}
                {q.answer && (
                  <div className="existing-answer">
                    <strong>Current Answer:</strong> {q.answer}
                  </div>
                )}
              </div>

              {selectedQuestion === q.questionId ? (
                <div className="answer-form">
                  <textarea
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    placeholder="Type your answer here..."
                  />
                  <div className="answer-form-buttons">
                    <button
                      onClick={() =>
                        handleAnswerSubmit(q.questionId, auctionIdQA)
                      }
                      className="submit-answer-btn"
                    >
                      {q.answer ? "Update Answer" : "Submit Answer"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedQuestion(null);
                        setAnswerInput("");
                      }}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {!q.answer && (
                    <button
                      className="answer-btn"
                      onClick={() => {
                        setSelectedQuestion(q.questionId);
                        setAnswerInput("");
                      }}
                    >
                      Answer
                    </button>
                  )}
                  {q.answer && (
                    <button
                      className="edit-answer-btn"
                      onClick={() => {
                        setSelectedQuestion(q.questionId);
                        setAnswerInput(q.answer);
                      }}
                    >
                      Edit Answer
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPasswordRequestsSection = () => (
    <div className="password-requests-section">
      <h2>Password Reset Requests</h2>

      <div className="search-section">
        <button onClick={fetchPasswordRequests}>Password Requests</button>
        {showPasswordRequests && (
          <button onClick={handleCancelPasswordRequests}>Cancel</button>
        )}
      </div>

      {error && showPasswordRequests && (
        <p className="error-message">{error}</p>
      )}

      {showPasswordRequests && passwordRequests.length > 0 && (
        <div className="requests-list">
          {passwordRequests.map((user) => (
            <div key={user.user_id} className="request-item">
              <div className="request-content">
                <span>
                  <strong>User ID:</strong> {user.user_id}
                </span>
                <span>
                  <strong>Username:</strong> {user.username}
                </span>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={passwordInputs[user.user_id] || ""}
                  onChange={(e) =>
                    handlePasswordInputChange(user.user_id, e.target.value)
                  }
                />
                <button
                  onClick={() => handleSetPassword(user.user_id)}
                  className="set-password-btn"
                >
                  Set Password
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const handleSearch = async () => {
    if (!userId) {
      setError("Please enter a user ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_ENDPOINTS.BASE_URL}/auth/profile/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch user data");
      }

      const data = await response.json();
      setUserData(data);
      setFormData({
        username: data.username || "",
        email: data.email || "",
        firstName: data.first_name || "",
        lastName: data.last_name || "",
        address: data.address || "",
        phoneNumber: data.phone_number || "",
        password_hash: "",
      });
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const updateResponse = await fetch(
        `${API_ENDPOINTS.BASE_URL}/auth/editprofile/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            address: formData.address,
            phone_number: formData.phoneNumber,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      if (formData.password_hash) {
        console.log("Attempting to update password for user:", userId);
        const pwdResponse = await fetch(
          `${API_ENDPOINTS.BASE_URL}/auth/pwd_change/${userId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              password_hash: formData.password_hash,
            }),
          }
        );

        console.log("Password update response status:", pwdResponse.status);

        if (!pwdResponse.ok) {
          const errorData = await pwdResponse.json();
          console.error("Password update failed:", errorData);
          throw new Error(errorData.message || "Failed to update password");
        }
      }

      alert("User updated successfully!");
      await handleSearch();
    } catch (err) {
      console.error("Error updating user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>CUSTOMER REPRESENTATIVE PORTAL</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
      {renderQASection()}
      {renderPasswordRequestsSection()}
      <div className="profile-content">
        <h2>User Details</h2>
        <div className="search-section">
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search User"}
          </button>
          <button onClick={handleCancelSearch}>Cancel</button>
        </div>

        {error && !showPasswordRequests && !questions.length && (
          <p className="error-message">{error}</p>
        )}

        {userData && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>New Password (leave blank to keep current)</label>
              <input
                type="password"
                name="password_hash"
                value={formData.password_hash}
                onChange={handleChange}
                placeholder="Enter new password"
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update User"}
              </button>
              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CustomerRepresentative;
