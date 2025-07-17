import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminJobForm from "./pages/adminPage/AdminJobForm";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  if (token) {
    return <AdminJobForm token={token} setToken={setToken} />;
  }

  return (
    <>
      {isSignup ? (
        <SignupPage setToken={setToken} setIsSignup={setIsSignup} />
      ) : (
        <LoginPage setToken={setToken} setIsSignup={setIsSignup} />
      )}
    </>
  );
}

export default App;