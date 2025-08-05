import { useNavigate } from 'react-router-dom';

const LoggedOutPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', backgroundColor: '#1e1e1e', color: '#fff'
    }}>
      <h1 style={{ marginBottom: 20, color: '#a8d0ff' }}>You've been logged out due to inactivity</h1>
      <button
        onClick={() => navigate('/login')}
        style={{
          padding: '10px 20px', borderRadius: 8,
          backgroundColor: '#a8d0ff', border: 'none',
          color: '#000', fontWeight: 600, cursor: 'pointer'
        }}
      >
        Go to Login
      </button>
    </div>
  );
};

export default LoggedOutPage;