import { useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

function CreateCompanyPage() {
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [msg, setMsg] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (companyName.trim().length < 2) {
      setMsg("Company name must be at least 2 characters long.");
      return;
    }

    const token = searchParams.get("token");

    try {
      const response = await axios.post("/api/companies", {
        name: companyName,
        industry,
        token
      });
      setMsg(response.data.message || "Company created successfully!");
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      setMsg("Error: " + (err.response?.data?.error || "Something went wrong"));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Create Your Company</h2>
      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Company Name"
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Industry"
          value={industry}
          onChange={e => setIndustry(e.target.value)}
          style={{ marginTop: 12 }}
        />
        <button type="submit">Finish Setup</button>
      </form>
      {msg && <div style={{ marginTop: 12 }}>{msg}</div>}
    </div>
  );
}

export default CreateCompanyPage;