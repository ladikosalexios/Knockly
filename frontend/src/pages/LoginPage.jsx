function LoginPage({
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  loginMsg,
  handleLogin
}) {
  return (
    <form
      onSubmit={handleLogin}
      style={{
        margin: "24px 0", padding: 20, background: "#fff", borderRadius: 8, boxShadow: "0 1px 4px #0001",
        maxWidth: 380
      }}
    >
      <h2>Login</h2>
      <input
        type="email"
        value={loginEmail}
        onChange={e => setLoginEmail(e.target.value)}
        placeholder="Email"
        required
        style={{ padding: 10, width: "100%", marginBottom: 10, borderRadius: 5, border: "1px solid #888" }}
      />
      <input
        type="password"
        value={loginPassword}
        onChange={e => setLoginPassword(e.target.value)}
        placeholder="Password"
        required
        style={{ padding: 10, width: "100%", marginBottom: 10, borderRadius: 5, border: "1px solid #888" }}
      />
      <button
        type="submit"
        style={{
          background: "#222", color: "#fff", border: "none", borderRadius: 8,
          padding: "10px 22px", fontWeight: 700, cursor: "pointer"
        }}
      >
        Login
      </button>
      {loginMsg && <div style={{ color: loginMsg.includes('Invalid') ? 'red' : 'green', marginTop: 8 }}>{loginMsg}</div>}
    </form>
  );
}

export default LoginPage;