import { useState } from 'react';
import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import AcceptInvitePage from './pages/AcceptInvitePage';
import AdminJobForm from './pages/AdminJobForm';
import DashboardLayout from './components/DashboardLayout';
import JobApplicantsPage from './components/JobApplicantsPage';
import JobApplicationPage from './components/JobApplicationPage';
import CreateCompanyPage from './pages/CreateCompanyPage';
import PublicJobBoard from './pages/PublicJobBoard';
import LoggedOutPage from './pages/LogoutPage';
import PrivateRoute from './components/PrivateRoute';

function HomePage() {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      gap: 16,
      background: "#1e1e1e",
      color: "#fff"
    }}>
      <h1>Welcome to Looply</h1>
      <p>Visit a company's job board:</p>
      <a href="/acme-inc" style={{ color: "#a8d0ff", fontWeight: 600 }}>Go to Acme Inc Job Board</a>
    </div>
  );
}

function App() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMsg] = useState('');

  return (
    <Routes>
      <Route path="/admin" element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }>
        <Route path="/admin-job-form" element={
          <PrivateRoute>
            <AdminJobForm />
          </PrivateRoute>
        } />
      </Route>
      <Route path="/admin/jobs/:id/edit" element={
        <PrivateRoute>
          <AdminJobForm />
        </PrivateRoute>
      } />
      <Route path="/admin/jobs/:id/applicants" element={
        <PrivateRoute>
          <JobApplicantsPage />
        </PrivateRoute>
      } />
      <Route path="/jobs/:id/apply" element={<JobApplicationPage />} />
      <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />
      <Route path="/create-company" element={<CreateCompanyPage />} />
      <Route path="/:companySlug" element={<PublicJobBoard />} />
      <Route path="/logged-out" element={<LoggedOutPage />} />
      <Route path="/login" element={
        <LoginPage
          loginEmail={loginEmail}
          setLoginEmail={setLoginEmail}
          loginPassword={loginPassword}
          setLoginPassword={setLoginPassword}
          loginMsg={loginMsg}
        />
      } />
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}

export default App;