import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthContext } from './AuthContext';

type LoginPayload = { name: string; email: string };

const LoginWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { login } = React.useContext(AuthContext)!;  // use context

  const handleLogin = (userData: LoginPayload) => {
    login(userData);        // ✅ save user in context
    navigate('/');          // ✅ redirect to home
  };

  const handleClose = () => {
    navigate('/');          // ✅ close → go home
  };

  return <LoginPage onLogin={handleLogin} onClose={handleClose} />;
};

export default LoginWrapper;
