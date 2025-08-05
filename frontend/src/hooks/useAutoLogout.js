import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const useAutoLogout = (timeout = 10 * 60 * 1000) => {
    // const useAutoLogout = (timeout = 1 * 60 * 1000) => {

  const navigate = useNavigate();

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        axios.delete('http://localhost:3000/users/sign_out', { withCredentials: true })
          .then(() => {
            navigate('/logged-out');
          })
          .catch(err => {
            console.error('Auto logout error:', err);
            navigate('/logged-out'); // still redirect even if server errors
          });
      }, timeout);
    };

    const events = ['mousemove', 'keydown', 'click'];

    events.forEach(event =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer(); // start timer on mount

    return () => {
      clearTimeout(timer);
      events.forEach(event =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [navigate, timeout]);
};

export default useAutoLogout;