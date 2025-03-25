import React, { useEffect } from "react";
import "../CSS/Exams.css";
import PrivateRoute from "../PrivateRoute";
import { useNavigate } from "react-router-dom";
const Exams = () => {
  const navigate = useNavigate();
  async function fetchUserInfo() {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/privateRoute");
      return;
    }
    try {
      const response = await fetch(
        `https://imtahan-4zd9.onrender.com/auth/me?token=${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(token);
      const userData = await response.json();

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
      const response = await fetch("https://imtahan-4zd9.onrender.com/exams/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const exams = await response.json();
        const examsList = document.getElementById("examsList");
        examsList.innerHTML =
          "<h2>Your Exams:</h2>" +
          exams
            .map((exam) => `<p>${exam.name} - Time: ${exam.time}</p>`)
            .join("");
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
  return (
    <div>
      <h1>Exams Page</h1>
      <p>
        Welcome, <span id="userName">Loading...</span>!
      </p>
      <div id="examsList"></div>
    </div>
  );
};

export default Exams;
