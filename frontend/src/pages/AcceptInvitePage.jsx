import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function AcceptInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/accept_invite/${token}`)
      .then(res => {
        setEmail(res.data.email);
        setCompany(res.data.company_name);
        setLoading(false);
      })
      .catch(() => {
        setMessage("Invalid or expired invite.");
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/finalize_invite`, {
        token,
        password
      });
      setMessage("Account setup complete! You can now log in.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage("Error finalizing invite.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome to {company}</h2>
      <p>You're setting up an account for: <strong>{email}</strong></p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Choose a password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Create Account</button>
      </form>
      {message && <div style={{ marginTop: 12 }}>{message}</div>}
    </div>
  );
}

export default AcceptInvitePage;