import React, { useEffect, useState } from "react";
import "../CSS/Exams.css";
import PrivateRoute from "../PrivateRoute";
import { useNavigate } from "react-router-dom";
const Exams = () => {
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();
  async function fetchUserInfo() {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/privateRoute");
      return;
    }
    try {
      const response = await fetch(
        `http://192.168.0.133:8000/auth/me?token=${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(token);
      const userData = await response.json();
      setUser(userData.first_name);

      if (response.ok) {
        console.log(userData);
        // document.getElementById("userName").textContent = `${userData.first_name} ${userData.last_name}`;
      } else {
        throw new Error("Failed to fetch user info");
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchExams() {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://192.168.0.133:8000/exams/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const examsArr = await response.json();
        setExams(examsArr);
      } else {
        throw new Error("Failed to fetch exams");
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchUserInfo();
    fetchExams();
  }, []);

  const handleEnterExam = (id) => {
    navigate(`/exam/${id}/questions`);
  };

  return (
    <div className="exams-container">
      <div className="header">
        <h1>Exams</h1>
        <div>
          {user && <span className="user-info">Logged in as: {user}</span>}
          {/* <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button> */}
        </div>
      </div>
      {exams.length === 0 ? (
        <p>No exams available.</p>
      ) : (
        <ul className="exams-list">
          {exams.map((exam) => (
            <li key={exam.id} className="exam-item">
              <span>
                {exam.name} - {exam.time}
              </span>
              <button
                className="enter-exam-btn"
                onClick={() => handleEnterExam(exam.id)}
              >
                Enter Exam
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Exams;
