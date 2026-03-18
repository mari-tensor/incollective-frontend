import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { auth } from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState('manager');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        if (password !== passwordConfirm) {
          setError('Passwords must match');
          return;
        }
        await auth.register({ username, password, password_confirm: passwordConfirm, role });
      }
      await login(username, password);
      navigate('/');
    } catch (err) {
      const d = err.response?.data;
      setError(d?.password?.[0] || d?.username?.[0] || d?.detail || 'Failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Documents</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {isRegister && (
            <>
              <input
                type="password"
                placeholder="Confirm password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="manager">Manager (create, edit, delete)</option>
                <option value="common">Common User (view, download)</option>
              </select>
            </>
          )}
          {error && <p className="error">{error}</p>}
          <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
        </form>
        <p className="toggle">
          <button type="button" className="link" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
        </p>
      </div>
    </div>
  );
}
