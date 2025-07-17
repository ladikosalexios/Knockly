import AdminJobForm from './pages/AdminJobForm';
import SignupPage from './pages/SignupPage';
import { useState, useEffect } from 'react'
import './App.css'
import axios from "axios"
import LoginPage from './pages/LoginPage';

function App() {

  // --- AUTH STATE ---
  const [user, setUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMsg, setLoginMsg] = useState('');
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    console.log("[DEBUG] Current user object:", user);
    if (user) {
      console.log("[DEBUG] User role:", user.role);
    }
  }, [user]);

  // --- LOGIN HANDLER ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMsg('');
    try {
      const res = await axios.post('http://localhost:3000/users/sign_in', {
        user: { email: loginEmail, password: loginPassword }
      }, { withCredentials: true });
      setUser(res.data.user || res.data);
      setLoginEmail('');
      setLoginPassword('');
      setLoginMsg('Logged in!');
    } catch (err) {
      setLoginMsg('Invalid credentials');
    }
  };

  if (!user) {
    return (
      <div style={{marginTop: 40, padding: 32}}>
        {showSignup ? (
          <SignupPage onSignupSuccess={(user) => { setUser(user); setShowSignup(false); }} />
        ) : (
          <>
            <LoginPage
              loginEmail={loginEmail}
              setLoginEmail={setLoginEmail}
              loginPassword={loginPassword}
              setLoginPassword={setLoginPassword}
              loginMsg={loginMsg}
              handleLogin={handleLogin}
            />
            <button onClick={() => setShowSignup(true)} style={{ marginTop: 10 }}>Sign Up</button>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{marginTop: 40, padding: 32}}>
      <button
        onClick={async () => {
          console.log("[DEBUG] Logging out user:", user);
          try {
            await axios.delete('http://localhost:3000/users/sign_out', { withCredentials: true });
            console.log("[DEBUG] Backend logout successful.");
          } catch (e) {
            console.log("[DEBUG] Backend logout failed, proceeding with frontend logout anyway.");
          }
          setUser(null);
        }}
        style={{
          position: "absolute", top: 10, right: 10,
          background: "#aaa", color: "#222", borderRadius: 8, padding: "6px 16px"
        }}
      >
        Logout
      </button>
      {user.role === 'admin' && (
        <AdminJobForm user={user} />
      )}
    </div>
  )
}

export default App