import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "../Components/Home";
import Login from "../Components/Login";
import Exams from "../Components/Exams";
import PrivateRoute from "../PrivateRoute";
import Questions from "../Components/Questions";

const Routing = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/privateRoute" element={<PrivateRoute />} />
        <Route path="/exam/:examId/questions" element={<Questions />} />
      </Routes>
    </Router>
  );
};

export default Routing;
