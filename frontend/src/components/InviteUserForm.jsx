import { useState, useEffect } from "react";
import api from "../api";

function InviteUserForm() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [isLooplyAdmin, setIsLooplyAdmin] = useState(false);

  useEffect(() => {
    api.get("/api/users/me")
      .then(res => {
        setIsLooplyAdmin(res.data.is_looply_admin);
      })
      .catch(() => {
        setIsLooplyAdmin(false);
      });
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLooplyAdmin
        ? "/api/generate_invite"
        : "/api/invite_user";
      const payload = { email }; // Only email is required
      const res = await api.post(endpoint, payload);
      setMsg(`Invite created! Share this link: ${res.data.invite_url}`);
      setEmail("");
    } catch (err) {
      console.error(err);
      setMsg("Error: " + (err.response?.data?.errors?.join(", ") || "Unknown error"));
    }
  };

  return (
    <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input
        type="email"
        placeholder="Invitee's Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Invite User</button>
      {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
    </form>
  );
}

export default InviteUserForm;