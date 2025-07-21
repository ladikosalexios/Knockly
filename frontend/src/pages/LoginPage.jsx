import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage({
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  loginMsg,
}) {
  const [localMsg, setLocalMsg] = useState("");
  const navigate = useNavigate();

  // Handles the login logic and navigation
  const handleLocalLogin = async (e) => {
    e.preventDefault();
    setLocalMsg("");
    try {
      // Backend login endpoint (adjust as needed)
      await axios.post("http://localhost:3000/users/sign_in", {
        user: {
          email: loginEmail,
          password: loginPassword
        }
      }, { withCredentials: true });

      setLocalMsg("Login successful! Redirecting...");
      setTimeout(() => navigate("/admin"), 700);
    } catch (err) {
      setLocalMsg("Login failed: " +
        (err.response?.data?.error || err.message));
    }
  };

  return (
    <form
      onSubmit={handleLocalLogin}
      style={{
        margin: "24px 0",
        padding: 32,
        background: "#181818",
        borderRadius: 12,
        boxShadow: "0 1px 16px #0002",
        maxWidth: 400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2 style={{
        color: "#fff",
        background: "transparent",
        fontSize: 32,
        marginBottom: 24,
        fontWeight: 800,
        letterSpacing: "0.02em",
      }}>
        Login
      </h2>
      <input
        type="email"
        value={loginEmail}
        onChange={e => setLoginEmail(e.target.value)}
        placeholder="Email"
        required
        style={{
          padding: 14,
          width: "100%",
          marginBottom: 16,
          borderRadius: 6,
          border: "1.5px solid #2c2c2c",
          background: "#232323",
          color: "#fff",
          fontSize: 18,
        }}
      />
      <input
        type="password"
        value={loginPassword}
        onChange={e => setLoginPassword(e.target.value)}
        placeholder="Password"
        required
        style={{
          padding: 14,
          width: "100%",
          marginBottom: 18,
          borderRadius: 6,
          border: "1.5px solid #2c2c2c",
          background: "#232323",
          color: "#fff",
          fontSize: 18,
        }}
      />
      <button
        type="submit"
        style={{
          background: "#fff",
          color: "#232323",
          border: "none",
          borderRadius: 8,
          padding: "12px 34px",
          fontWeight: 700,
          cursor: "pointer",
          fontSize: 20,
          marginBottom: 8,
          marginTop: 10,
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseOver={e => {
          e.target.style.background = "#444";
          e.target.style.color = "#fff";
        }}
        onMouseOut={e => {
          e.target.style.background = "#fff";
          e.target.style.color = "#232323";
        }}
      >
        Login
      </button>
      {(localMsg || loginMsg) && (
        <div
          style={{
            color: (localMsg || loginMsg).toLowerCase().includes("fail") || (localMsg || loginMsg).toLowerCase().includes("invalid") ? "#e66" : "#42e669",
            marginTop: 8,
            fontWeight: 600,
            textAlign: "center"
          }}
        >
          {localMsg || loginMsg}
        </div>
      )}
    </form>
  );
}

export default LoginPage;