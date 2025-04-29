import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
    setMessage("");
    setForm({ username: "", email: "", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (isLogin) {
      try {
        const response = await axios.post(
          "https://peter-kanyi-potato.hf.space/token",
          new URLSearchParams({
            username: form.username,
            password: form.password,
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        const token = response.data.access_token;
        if (token) {
          localStorage.setItem("token", token);
          setMessage("Login successful!");
          navigate("/model");
        } else {
          setError("Login failed. No token received.");
        }
      } catch (err) {
        setError("Login failed. Please check your credentials.");
      }
    } else {
      try {
        await axios.post("https://peter-kanyi-potato.hf.space/signup", {
          username: form.username,
          email: form.email,
          password: form.password,
        });
        setMessage("Signup successful! You can now log in.");
        setIsLogin(true);
      } catch (err) {
        setError("Signup failed. Username or email might already exist.");
      }
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        {error && <p className="error-msg">{error}</p>}
        {message && <p className="success-msg">{message}</p>}

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />

        {!isLogin && (
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
        )}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>

        <p className="link-text">
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <span className="form-toggle" onClick={toggleForm}>
                Sign up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span className="form-toggle" onClick={toggleForm}>
                Log in
              </span>
            </>
          )}
        </p>

        <p className="link-text">
          Just browsing?{" "}
          <span className="form-toggle" onClick={() => navigate("/#/home")}>
            Go to Home
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
