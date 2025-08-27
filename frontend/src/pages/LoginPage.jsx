import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

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
      await api.post("/users/sign_in", {
        user: {
          email: loginEmail,
          password: loginPassword
        }
      });

      setLocalMsg("Login successful! Redirecting...");
      setTimeout(() => navigate("/admin"), 700);
    } catch (err) {
      console.error(err);
      setLocalMsg("Login failed: " +
        (err.response?.data?.error || err.message));
    }
  };

  return (
    <form
      onSubmit={handleLocalLogin}
      style={{
        margin: "0 auto",
        padding: 32,
        background: "#121212",
        borderRadius: 12,
        width: 320,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 20px rgba(0,0,0,0.2)",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
      }}
    >
      <h2 style={{
        color: "#a8d0ff",
        background: "transparent",
        fontSize: 32,
        marginBottom: 24,
        fontWeight: 800,
        textAlign: "center",
        letterSpacing: "0.5px",
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
          border: "1.5px solid #a8d0ff",
          background: "#1e1e1e",
          color: "#fff",
          fontSize: 16,
          outline: "none"
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
          marginBottom: 16,
          borderRadius: 6,
          border: "1.5px solid #a8d0ff",
          background: "#1e1e1e",
          color: "#fff",
          fontSize: 16,
          outline: "none"
        }}
      />
      <button
        type="submit"
        style={{
          background: "#a8d0ff",
          color: "#000",
          border: "none",
          borderRadius: 8,
          padding: "12px 34px",
          fontWeight: 700,
          cursor: "pointer",
          fontSize: 18,
          marginBottom: 8,
          marginTop: 10,
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
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