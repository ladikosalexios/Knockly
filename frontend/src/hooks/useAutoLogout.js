import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const useAutoLogout = (timeout = 10 * 60 * 1000) => {

  const navigate = useNavigate();

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        api.delete('/users/sign_out')
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