// "use client"
// import { useEffect, useState } from "react"
// import axios from "axios"

// export default function JobsPage() {
//   const [jobs, setJobs] = useState([])

//   useEffect(() => {
//     axios.get("http://localhost:3000/api/jobs") // or 3000 if Rails is on default port
//       .then(res => setJobs(res.data))
//       .catch(console.error)
//   }, [])

//   return (
//     <div>
//       <h2>Job Listings</h2>
//       {jobs.map(job => (
//         <div key={job.id} style={{margin: "20px 0", padding: 10, border: "1px solid #ccc"}}>
//           <h3>{job.title}</h3>
//           <p><b>Company:</b> {job.company?.name}</p>
//           <p><b>Location:</b> {job.location} {job.is_remote && "(Remote)"}</p>
//           <p><b>Skills:</b> {job.skills?.map(s => s.name).join(', ')}</p>
//         </div>
//       ))}
//     </div>
//   )
// }
