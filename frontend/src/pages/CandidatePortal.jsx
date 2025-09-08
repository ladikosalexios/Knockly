import React, { useEffect, useState } from "react";

function CandidatePortal() {
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [profile, setProfile] = useState({ name: "", email: "" });
  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    if (token) {
      fetch("/api/candidate_session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setProfile(data);
          loadData();
        });
    }
  }, [token]);

  const loadData = () => {
    fetch("/api/candidates/applications", { credentials: "include" })
      .then((res) => res.json())
      .then(setApplications);
    fetch("/api/candidates/interviews", { credentials: "include" })
      .then((res) => res.json())
      .then(setInterviews);
  };

  const updateProfile = (e) => {
    e.preventDefault();
    fetch(`/api/applicant_profiles/${profile.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(profile),
    });
  };

  const requestWithdrawal = (id) => {
    fetch(`/api/job_applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: "withdrawn" }),
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Candidate Portal</h2>
      <section>
        <h3>Profile</h3>
        <form onSubmit={updateProfile}>
          <input
            type="text"
            value={profile.name || ""}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Name"
          />
          <input
            type="email"
            value={profile.email || ""}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            placeholder="Email"
          />
          <button type="submit">Update Profile</button>
        </form>
      </section>
      <section>
        <h3>Applications</h3>
        <ul>
          {applications.map((app) => (
            <li key={app.id}>
              {app.job.title} - {app.status}
              <button onClick={() => requestWithdrawal(app.id)}>Withdraw</button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Upcoming Interviews</h3>
        <ul>
          {interviews.map((iv) => (
            <li key={iv.id}>
              {new Date(iv.scheduled_at).toLocaleString()} - {iv.location}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default CandidatePortal;
