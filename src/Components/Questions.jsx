import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../CSS/Questions.css";

const Questions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [openAnswers, setOpenAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [questionFeedback, setQuestionFeedback] = useState({});
  const [user, setUser] = useState(null);

  const examKey = `exam_timer_${examId}`;
  const totalTime = 1000;

  const storedTime = localStorage.getItem(examKey);
  const initialTime = storedTime ? parseInt(storedTime, 10) : totalTime;

  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        localStorage.setItem(examKey, newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in.");
          setLoading(false);
          return;
        }

        const userResponse = await fetch(
          `https://imtahan-4zd9.onrender.com/auth/me?token=${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user");
        }
        const userData = await userResponse.json();
        setUser(userData);

        // console.log(userData);

        const questionsResponse = await fetch(
          "https://imtahan-4zd9.onrender.com/questions",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!questionsResponse.ok) {
          throw new Error(
            `Failed to fetch questions: ${questionsResponse.status}`
          );
        }
        const questionsData = await questionsResponse.json();

        const filteredQuestions = questionsData.filter(
          (question) => question.exam_id === parseInt(examId)
        );

        const answersResponse = await fetch(
          "https://imtahan-4zd9.onrender.com/answers",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!answersResponse.ok) {
          throw new Error(`Failed to fetch answers: ${answersResponse.status}`);
        }
        const answersData = await answersResponse.json();

        setQuestions(filteredQuestions);
        setAnswers(answersData);
      } catch (err) {
        setError(err.message);
        if (err.message.includes("401")) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId, navigate]);

  const getAnswersForQuestion = (questionId) => {
    return answers.filter((answer) => answer.question_id === questionId);
  };

  const isMultipleChoice = (questionId) => {
    const questionAnswers = getAnswersForQuestion(questionId);
    const correctAnswers = questionAnswers.filter((answer) => answer.score > 0);
    return correctAnswers.length > 1;
  };

  const handleAnswerClick = (questionId, answerId) => {
    if (isSubmitted) return;

    setSelectedAnswers((prev) => {
      const currentSelections = prev[questionId] || [];
      if (isMultipleChoice(questionId)) {
        if (currentSelections.includes(answerId)) {
          return {
            ...prev,
            [questionId]: currentSelections.filter((id) => id !== answerId),
          };
        } else {
          return {
            ...prev,
            [questionId]: [...currentSelections, answerId],
          };
        }
      } else {
        return {
          ...prev,
          [questionId]: [answerId],
        };
      }
    });
  };

  const handleOpenAnswerChange = (questionId, value) => {
    if (isSubmitted) return;
    setOpenAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleFinishExam = async () => {
    if (!user) {
      alert("User not authenticated. Please log in.");
      navigate("/login");
      return;
    }

    let score = 0;
    const feedback = {};
    const answers = [];

    questions.forEach((question) => {
      const questionAnswers = getAnswersForQuestion(question.id);

      if (questionAnswers.length > 0) {
        const selectedAnswerIds = selectedAnswers[question.id] || [];
        const correctAnswers = questionAnswers.filter(
          (answer) => answer.score > 0
        );
        const correctAnswerIds = correctAnswers.map((answer) => answer.id);

        let questionScore = 0;
        let isCorrect = false;

        if (isMultipleChoice(question.id)) {
          const selectedCorrect = selectedAnswerIds.filter((id) =>
            correctAnswerIds.includes(id)
          );
          const selectedIncorrect = selectedAnswerIds.filter(
            (id) => !correctAnswerIds.includes(id)
          );

          if (
            selectedCorrect.length === correctAnswerIds.length &&
            selectedIncorrect.length === 0 &&
            selectedAnswerIds.length > 0
          ) {
            questionScore = correctAnswers.reduce(
              (sum, answer) => sum + answer.score,
              0
            );
            isCorrect = true;
          }
        } else {
          if (selectedAnswerIds.length === 1) {
            const selectedAnswer = questionAnswers.find(
              (answer) => answer.id === selectedAnswerIds[0]
            );
            if (selectedAnswer && selectedAnswer.score > 0) {
              questionScore = selectedAnswer.score;
              isCorrect = true;
            }
          }
        }

        score += questionScore;
        feedback[question.id] = {
          isCorrect,
          score: questionScore,
        };

        selectedAnswerIds.forEach((answerId) => {
          const selectedAnswer = questionAnswers.find(
            (ans) => ans.id === answerId
          );
          answers.push({
            question_id: question.id,
            answer_id: answerId,
            user_answer: selectedAnswer ? selectedAnswer.content : "",
          });
        });
      } else {
        const openAnswer = openAnswers[question.id] || "";
        if (openAnswer) {
          answers.push({
            question_id: question.id,
            user_answer: openAnswer,
            answer_id: 12,
          });
        }
      }
    });

    setTotalScore(score);
    setQuestionFeedback(feedback);
    setIsSubmitted(true);

    try {
      const requestBody = {
        user_id: user.id,
        answer: answers,
      };
      console.log("Sending to backend:", JSON.stringify(requestBody, null, 2));
      const response = await fetch(
        "http://192.168.0.133:8000/user-answers/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Backend error response:", errorData);
        throw new Error("Failed to submit user answers");
      }

      alert("Exam finished successfully!");
    } catch (err) {
      console.error("Error submitting answers:", err);
      setError("Failed to finish exam: " + err.message);
    }
  };

  const handleBackToExams = () => {
    const confirmLeave = window.confirm(
      "İmtahandan çıxdığınız zaman geri dönə bilməyəcəksiniz"
    );
    if (confirmLeave) {
      navigate("/exams");
    }
  };

  if (loading) {
    return <div className="loading-message">Loading questions...</div>;
  }

  if (error) {
    return (
      <div className="questions-container">
        <div className="header">
          <h1>Exam {examId}</h1>
          <button className="back-btn" onClick={handleBackToExams}>
            Back to Exams
          </button>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="questions-container">
      <div className="header">
        <h1>Questions for Exam {examId}</h1>
        <p className="timer">Time Left: {formatTime(timeLeft)}</p>
        <button className="back-btn" onClick={handleBackToExams}>
          Back to Exams
        </button>
      </div>
      {isSubmitted && (
        <div className="score-summary">
          <h2>Total Score: {totalScore}</h2>
        </div>
      )}
      {questions.length === 0 ? (
        <p>No questions available for this exam.</p>
      ) : (
        <>
          <ul className="questions-list">
            {questions.map((question) => (
              <li key={question.id} className="question-item">
                <div className="question-header">
                  <p>{question.content}</p>
                  {isSubmitted && questionFeedback[question.id] && (
                    <span
                      className={`feedback ${
                        questionFeedback[question.id].isCorrect
                          ? "correct"
                          : "incorrect"
                      }`}
                    >
                      {questionFeedback[question.id].isCorrect
                        ? `Correct (Score: ${
                            questionFeedback[question.id].score
                          })`
                        : "Incorrect"}
                    </span>
                  )}
                </div>
                <div className="answers-section">
                  {getAnswersForQuestion(question.id).length === 0 ? (
                    <div className="open-question">
                      <h4>Write your code below:</h4>
                      <textarea
                        className="code-textarea resize-none"
                        rows="5"
                        placeholder="Enter your code here..."
                        value={openAnswers[question.id] || ""}
                        onChange={(e) =>
                          handleOpenAnswerChange(question.id, e.target.value)
                        }
                        disabled={isSubmitted}
                      />
                      <p className="open-question-note">
                        Bu sual müəllim tərəfindən yoxlanılacaq
                      </p>
                    </div>
                  ) : (
                    <>
                      <h4>
                        Answers
                        {isMultipleChoice(question.id)
                          ? " (Select all that apply)"
                          : ""}
                        :
                      </h4>
                      <ul className="answers-list">
                        {getAnswersForQuestion(question.id).map((answer) => (
                          <li
                            key={answer.id}
                            className={`answer-item ${
                              (selectedAnswers[question.id] || []).includes(
                                answer.id
                              )
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              handleAnswerClick(question.id, answer.id)
                            }
                          >
                            {answer.content} (Score: {answer.score})
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {isSubmitted ? (
            <button className="back-to-exams-btn" onClick={handleBackToExams}>
              Return to Exams
            </button>
          ) : (
            <button className="finish-exam-btn" onClick={handleFinishExam}>
              Finish Exam
            </button>
          )}
        </>
      )}
      <div className="time-left"></div>
    </div>
  );
};

export default Questions;
