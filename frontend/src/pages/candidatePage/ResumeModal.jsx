import axios from "axios";

function ResumeModal({
  open,
  onClose,
  resumeName,
  setResumeName,
  resumeEmail,
  setResumeEmail,
  resumeText,
  setResumeText,
  resumeMsg,
  setResumeMsg
}) {
  if (!open) return null;

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
      <form
        style={{
          background: "#fff",
          padding: 32,
          borderRadius: 12,
          minWidth: 360,
          display: "flex",
          flexDirection: "column"
        }}
        onClick={e => e.stopPropagation()}
        onSubmit={e => {
          e.preventDefault();
          setResumeMsg('');
          axios.post('http://localhost:3000/api/candidate_resumes', {
            name: resumeName,
            email: resumeEmail,
            resume_text: resumeText
          }).then(() => {
            setResumeMsg('Resume submitted!');
            setResumeName('');
            setResumeEmail('');
            setResumeText('');
          }).catch(() => {
            setResumeMsg('Could not submit resume.');
          });
        }}
      >
        <h2 style={{ marginBottom: 16 }}>Add Resume/Profile</h2>
        <input
          type="text"
          value={resumeName}
          onChange={e => setResumeName(e.target.value)}
          placeholder="Your Name"
          required
          style={{ padding: 10, marginBottom: 14, borderRadius: 5, border: "1px solid #888" }}
        />
        <input
          type="email"
          value={resumeEmail}
          onChange={e => setResumeEmail(e.target.value)}
          placeholder="Your Email"
          required
          style={{ padding: 10, marginBottom: 14, borderRadius: 5, border: "1px solid #888" }}
        />
        <textarea
          value={resumeText}
          onChange={e => setResumeText(e.target.value)}
          placeholder="Paste your resume here"
          required
          style={{ minHeight: 120, padding: 10, marginBottom: 14, borderRadius: 5, border: "1px solid #888" }}
        />
        <button
          type="submit"
          style={{
            background: "#087f23",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 22px",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: 10
          }}
        >
          Submit Resume
        </button>
        {resumeMsg && (
          <div style={{ color: resumeMsg.includes('submitted') ? 'green' : 'red', marginTop: 8 }}>
            {resumeMsg}
          </div>
        )}
        <button
          type="button"
          style={{
            marginTop: 12,
            color: "#555",
            background: "#eee",
            border: "none",
            borderRadius: 8,
            padding: "8px 12px",
            fontWeight: 500,
            cursor: "pointer"
          }}
          onClick={onClose}
        >
          Close
        </button>
      </form>
    </div>
  );
}

export default ResumeModal;