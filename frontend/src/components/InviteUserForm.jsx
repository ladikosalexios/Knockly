import { useState } from "react";
import axios from "axios";

function InviteUserForm() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/invite_user", {
        email,
      }, {
        withCredentials: true
    });
      setMsg(`Invite created! Share this link: ${res.data.invite_url}`);
      setEmail("");
    } catch (err) {
      setMsg("Error: " + err.response.data.errors?.join(", "));
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