import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://192.168.0.133:8000/auth/login",
        { username, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { access_token, refresh } = response.data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("refresh_token", refresh);
      console.log("Login Successful");
      navigate("/exams");

      setSuccess("Login Successful!");
      setPassword("");
    } catch (err) {
      console.log(err.response || err.message);

      if (err.response) {
        setError(
          err.response.data.detail || "Giriş uğursuz oldu, yenidən cəhd edin."
        );
      } else {
        setError(
          "Serverə qoşulmaq mümkün olmadı. Zəhmət olmasa internet bağlantınızı yoxlayın."
        );
      }
      setPassword("");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">İmtahan Portalı</h2>

        {success && (
          <p className="text-green-500 text-sm text-center">{success}</p>
        )}

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Username daxil edin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700">Şifrə</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Şifrə daxil edin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition cursor-pointer"
          >
            Daxil Ol
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
