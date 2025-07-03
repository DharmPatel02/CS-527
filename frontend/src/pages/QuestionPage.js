import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./QuestionPage.css";
import { API_ENDPOINTS } from "../config/api";

const QuestionPage = () => {
  const { auctionId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const navigate = useNavigate();
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Fetch existing questions
  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `API_ENDPOINTS.AUCTION_ITEMS/getallquessans/${auctionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.status}`);
      }

      // Attempt to parse JSON, handle empty response
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];

      // If data is an empty array or null, set questions to empty array
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      // Handle specific JSON parsing errors or other errors
      if (
        err.message.includes("Unexpected end of JSON input") ||
        err.message.includes("Failed to fetch questions")
      ) {
        setQuestions([]); // Treat as no questions
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auctionId) {
      fetchQuestions();
    } else {
      setError("Invalid auction ID");
      setLoading(false);
    }
  }, [auctionId]);

  // Handle question submission
  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `API_ENDPOINTS.AUCTION_ITEMS/insertquestion/${auctionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question: newQuestion,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit question");
      }

      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 2000);

      // Refresh questions list
      await fetchQuestions();
      setNewQuestion("");
      setShowForm(false);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  return (
    <div className="question-page">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back to Auction
      </button>
      {showSuccessPopup && (
        <div className="success-popup">Question submitted successfully!</div>
      )}
      <h1>Questions & Answers</h1>

      <button
        className="ask-question-btn"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "✖ Cancel" : "💬 Ask Your Question"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmitQuestion} className="question-form">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="What would you like to know about this auction item? Ask your question here..."
            required
          />
          {submitError && <div className="error">{submitError}</div>}
          <button type="submit" className="submit-question-btn">
            📤 Submit Question
          </button>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading questions...</div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : questions.length === 0 ? (
        <p className="no-questions">
          No questions have been asked about this auction item yet. Be the first
          to ask!
        </p>
      ) : (
        <div className="questions-list">
          {questions.map((q) => (
            <div key={q.question_id} className="question-item">
              <div className="question">
                <strong>Q:</strong> {q.question}
              </div>
              {q.answer && (
                <div className="answer">
                  <strong>A:</strong> {q.answer}
                </div>
              )}
              {!q.answer && (
                <div
                  className="answer"
                  style={{
                    background: "rgba(108, 117, 125, 0.1)",
                    borderColor: "#6c757d",
                    color: "#6c757d",
                  }}
                >
                  <em>Awaiting seller's response...</em>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionPage;
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import "./QuestionPage.css";

// const QuestionPage = () => {
//   const { auctionId } = useParams();
//   const [questions, setQuestions] = useState([]);
//   const [newQuestion, setNewQuestion] = useState("");
//   const [showForm, setShowForm] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [submitError, setSubmitError] = useState(null);
//   const navigate = useNavigate();
//   const [showSuccessPopup, setShowSuccessPopup] = useState(false);

//   // Fetch existing questions
//   const fetchQuestions = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(
//         `//API_ENDPOINTS.AUCTION_ITEMS/getallquessans/${auctionId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!response.ok) throw new Error("Failed to fetch questions");
//       const data = await response.json();

//       setQuestions(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchQuestions();
//   }, [auctionId]);

//   // Handle question submission
//   const handleSubmitQuestion = async (e) => {
//     e.preventDefault();
//     setSubmitError(null);

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         navigate("/login");
//         return;
//       }

//       const response = await fetch(
//         `API_ENDPOINTS.AUCTION_ITEMS/insertquestion/${auctionId}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             question: newQuestion,
//           }),
//         }
//       );
//       setShowSuccessPopup(true);
//       setTimeout(() => setShowSuccessPopup(false), 2000);
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to submit question");
//       }

//       // Refresh questions list
//       await fetchQuestions();
//       setNewQuestion("");
//       setShowForm(false);
//     } catch (err) {
//       setSubmitError(err.message);
//     }
//   };

//   return (
//     <div className="question-page">
//       <button onClick={() => navigate(-1)} className="back-button">
//         &larr; Back to Auction
//       </button>
//       {showSuccessPopup && (
//         <div className="success-popup">Question submitted successfully!</div>
//       )}
//       <h1>Questions & Answers</h1>

//       <button
//         className="ask-question-btn"
//         onClick={() => setShowForm(!showForm)}
//       >
//         {showForm ? "Cancel" : "Ask Your Question"}
//       </button>

//       {showForm && (
//         <form onSubmit={handleSubmitQuestion} className="question-form">
//           <textarea
//             value={newQuestion}
//             onChange={(e) => setNewQuestion(e.target.value)}
//             placeholder="Type your question here..."
//             required
//           />
//           {submitError && <div className="error">{submitError}</div>}
//           <button type="submit" className="submit-question-btn">
//             Submit Question
//           </button>
//         </form>
//       )}

//       {loading ? (
//         <div className="loading">Loading questions...</div>
//       ) : error ? (
//         <div className="error">Error: {error}</div>
//       ) : questions.length === 0 ? (
//         <p className="no-questions">No questions found for this auction.</p>
//       ) : (
//         <div className="questions-list">
//           {questions.map((q) => (
//             <div key={q.question_id} className="question-item">
//               <div className="question">
//                 <strong>Q:</strong> {q.question}
//               </div>
//               {q.answer && (
//                 <div className="answer">
//                   <strong>A:</strong> {q.answer}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default QuestionPage;
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import "./QuestionPage.css";

// const QuestionPage = () => {
//   const { auctionId } = useParams();
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await fetch(
//           `API_ENDPOINTS.AUCTION_ITEMS/getallquessans/${auctionId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (!response.ok) throw new Error("Failed to fetch questions");
//         const data = await response.json();
//         setQuestions(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchQuestions();
//   }, [auctionId]);

//   if (loading) return <div className="loading">Loading questions...</div>;
//   if (error) return <div className="error">Error: {error}</div>;

//   return (
//     <div className="question-page">
//       <button onClick={() => navigate(-1)} className="back-button">
//         &larr; Back to Auction
//       </button>

//       <h1>Questions & Answers</h1>

//       {questions.length === 0 ? (
//         <p className="no-questions">No questions found for this auction.</p>
//       ) : (
//         <div className="questions-list">
//           {questions.map((q) => (
//             <div key={q.question_id} className="question-item">
//               <div className="question">
//                 <strong>Q:</strong> {q.question} {/* Fixed field name */}
//               </div>
//               {q.answer && (
//                 <div className="answer">
//                   <strong>A:</strong> {q.answer}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default QuestionPage;
// // import React, { useEffect, useState } from "react";
// // import { useParams, useNavigate } from "react-router-dom";
// // import "./QuestionPage.css";

// // const QuestionPage = () => {
// //   const { auctionId } = useParams();
// //   const [questions, setQuestions] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     const fetchQuestions = async () => {
// //       try {
// //         const token = localStorage.getItem("token");
// //         const response = await fetch(
// //           `API_ENDPOINTS.AUCTION_ITEMS/getallquessans/${auctionId}`,
// //           {
// //             headers: {
// //               Authorization: `Bearer ${token}`,
// //             },
// //           }
// //         );

// //         if (!response.ok) throw new Error("Failed to fetch questions");
// //         const data = await response.json();
// //         setQuestions(data);
// //       } catch (err) {
// //         setError(err.message);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchQuestions();
// //   }, [auctionId]);
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import "./QuestionPage.css";

// const QuestionPage = () => {
//   const { auctionId } = useParams();
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           navigate("/login");
//           return;
//         }

//         const response = await fetch(
//           `API_ENDPOINTS.AUCTION_ITEMS/getallquessans/${auctionId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (!response.ok)
//           throw new Error(`HTTP error! status: ${response.status}`);
//         const data = await response.json();
//         setQuestions(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (auctionId) {
//       // Ensure auctionId exists
//       fetchQuestions();
//     } else {
//       setError("Invalid auction ID");
//       setLoading(false);
//     }
//   }, [auctionId, navigate]);

//   if (loading) return <div className="loading">Loading questions...</div>;
//   if (error) return <div className="error">Error: {error}</div>;

//   return (
//     <div className="question-page">
//       <button onClick={() => navigate(-1)} className="back-button">
//         &larr; Back to Auction
//       </button>

//       <h1>Questions & Answers</h1>

//       {questions.length === 0 ? (
//         <p className="no-questions">No questions found for this auction.</p>
//       ) : (
//         <div className="questions-list">
//           {questions.map((q) => (
//             <div key={q.questionId} className="question-item">
//               <div className="question">
//                 <strong>Q:</strong> {q.questionText}
//               </div>
//               {q.answer && (
//                 <div className="answer">
//                   <strong>A:</strong> {q.answer}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default QuestionPage;
