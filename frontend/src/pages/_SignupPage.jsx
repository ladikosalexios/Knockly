import React, { useState } from "react";
import axios from "axios";

function SignupPage({ onSignupSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await axios.post("http://localhost:3000/api/users", {
        name,
        email,
        password,
        role: "admin",
      });
      setMsg("Signup successful! Logging in...");
      // Optionally, auto-login here (call onSignupSuccess with new user)
      onSignupSuccess(res.data);
    } catch (err) {
      setMsg("Signup failed. " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        margin: "40px auto", maxWidth: 380, padding: 32,
        background: "#fff", borderRadius: 8, boxShadow: "0 1px 8px #0002"
      }}
    >
      <h2>Admin Sign Up</h2>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Name"
        required
        style={{ width: "100%", padding: 10, marginBottom: 12 }}
      />
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        required
        style={{ width: "100%", padding: 10, marginBottom: 12 }}
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        required
        style={{ width: "100%", padding: 10, marginBottom: 12 }}
      />
      <button
        type="submit"
        style={{ width: "100%", padding: 12, background: "#007bff", color: "#fff", border: "none", borderRadius: 6 }}
      >
        Sign Up
      </button>
      {msg && <div style={{ color: msg.startsWith("Signup successful") ? "green" : "red", marginTop: 12 }}>{msg}</div>}
    </form>
  );
}

export default SignupPage;