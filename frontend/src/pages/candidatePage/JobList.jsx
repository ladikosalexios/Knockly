import React from "react";

function JobList({
  jobs,
  appliedJobs,
  fetchJobDetail,
  loading,
  error,
  query,
  setQuery,
  applicantEmail,
  setApplicantEmail
}) {
  return (
    <div>
      <h1>Job Listings</h1>
      <input
        type="email"
        value={applicantEmail}
        onChange={e => setApplicantEmail(e.target.value)}
        placeholder="Enter your email to track job applications"
        style={{
          padding: 10,
          width: "100%",
          maxWidth: 400,
          marginBottom: 20,
          borderRadius: 5,
          border: "1px solid #888"
        }}
      />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search by title, location, or skill"
        style={{
          padding: 10,
          width: "100%",
          maxWidth: 400,
          marginBottom: 30,
          borderRadius: 5,
          border: "1px solid #888"
        }}
      />
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && jobs.length === 0 && <p>No jobs found.</p>}
      {jobs
        .filter(job =>
          (job.job_description?.title && job.job_description.title.trim().length > 0) ||
          (job.title && job.title.trim().length > 0)
        )
        .map(job => (
        <div
          key={job.id}
          style={{margin: "20px 0", padding: 10, border: "1px solid #ccc", cursor: "pointer"}}
          onClick={() => fetchJobDetail(job.id)}
        >
          <h3 style={{ display: "flex", alignItems: "center" }}>
            {job.job_description?.title || job.title}
            {appliedJobs.includes(job.id) && (
              <span
                style={{
                  background: "#087f23",
                  color: "#fff",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  padding: "2px 10px",
                  marginLeft: 12,
                  verticalAlign: "middle",
                  letterSpacing: "0.5px"
                }}
              >
                Applied
              </span>
            )}
          </h3>
          <p><b>Company:</b> {job.company?.name}</p>
          <p><b>Location:</b> {job.job_description?.location || job.location} {(job.job_description?.is_remote || job.is_remote) && "(Remote)"}</p>
          <p>
            <b>Skills:</b>{" "}
            {job.job_description?.skills?.length
              ? job.job_description.skills.map(s => s.name).join(', ')
              : job.skills?.map(s => s.name).join(', ')}
          </p>
        </div>
      ))}
    </div>
  );
}

export default JobList;