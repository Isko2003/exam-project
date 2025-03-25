import React from "react";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");

  return isAuthenticated ? (
    children
  ) : (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Not Authorized</h1>
      <p>Please log in to access this page.</p>
    </div>
  );
};

export default PrivateRoute;
