import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom"; // ✅ add useSearchParams
import axios from "axios";

function AcceptInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // ✅ read mode param
  const mode = searchParams.get("mode");

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
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      return;
    }
    try {
      await axios.post(`/api/finalize_invite`, {
        token,
        password
      });

      setMessage("Account setup complete!");
      
      // ✅ Redirect based on mode
      setTimeout(() => {
        if (mode === "new_company") {
          navigate(`/create-company?token=${token}`);
        } else {
          navigate("/login");
        }
      }, 1000);
    } catch (err) {
      const apiMsg = err.response?.data?.error || "Error finalizing invite.";
      setMessage(apiMsg);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome to {company || "Looply"}</h2>
      <p>You're setting up an account for: <strong>{email}</strong></p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Choose a password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={!password || loading}>
          {loading ? "Submitting..." : "Create Account"}
        </button>
      </form>
      {message && <div style={{ marginTop: 12 }}>{message}</div>}
    </div>
  );
}

export default AcceptInvitePage;