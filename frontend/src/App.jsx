import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from "axios"

function App() {
  const [count, setCount] = useState(0)
  const [jobs, setJobs] = useState([])
  const [query, setQuery] = useState("")

  useEffect(() => {
    // Debounce: wait for 400ms after typing before making API call
    const timeout = setTimeout(() => {
      axios.get("http://localhost:3001/api/jobs", { params: { q: query } })
        .then(res => setJobs(res.data))
        .catch(console.error)
    }, 400)

    return () => clearTimeout(timeout)
  }, [query])

  return (
    <div style={{marginTop: 40, padding: 32}}>
      <h1>Job Listings</h1>
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
      {jobs.length === 0 && <p>No jobs found.</p>}
      {jobs.map(job => (
        <div key={job.id} style={{margin: "20px 0", padding: 10, border: "1px solid #ccc"}}>
          <h3>{job.title}</h3>
          <p><b>Company:</b> {job.company?.name}</p>
          <p><b>Location:</b> {job.location} {job.is_remote && "(Remote)"}</p>
          <p><b>Skills:</b> {job.skills?.map(s => s.name).join(', ')}</p>
        </div>
      ))}
    </div>
  )
}

export default App