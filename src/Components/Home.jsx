import React from "react";
import { Link } from "react-router-dom";
const Home = () => {
  return (
    <div>
      <p>Home</p>
      <Link to={"/login"}>
        <a href="" className="underline text-blue-400">
          Go to Login Page
        </a>
      </Link>
    </div>
  );
};

export default Home;
