
function JobDetailModal({ job, onClose }) {

    if (!job || (!job.job_description && !job.title)) {
    return (
        <div style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.4)", display: "flex",
        justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
        <div style={{
            background: "#fff", padding: 32, borderRadius: 12, minWidth: 420,
            textAlign: "center", fontSize: 24, color: "#222"
        }}>
            Loading...
        </div>
        </div>
    );
    }

  const jd = job.job_description || {};

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: 32,
          borderRadius: 12,
          color: "#222",
          minWidth: 420,
          maxWidth: 540,
          boxShadow: "0 2px 20px #0004",
          position: "relative"
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            background: "#eee",
            color: "#222",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            padding: "4px 10px",
            cursor: "pointer"
          }}
        >
          Close
        </button>
        <h2>{jd.title || job.title}</h2>
        <p><b>Company:</b> {job.company?.name}</p>
        <p><b>Location:</b> {jd.location || job.location} {jd.is_remote || job.is_remote ? "(Remote)" : ""}</p>
        <p><b>Description:</b> {jd.description || job.description}</p>
        <p>
          <b>Skills:</b>{" "}
          {jd.skills?.length
            ? jd.skills.map(s => s.name).join(', ')
            : job.skills?.map(s => s.name).join(', ')
          }
        </p>
      </div>
    </div>
  );
}

export default JobDetailModal;