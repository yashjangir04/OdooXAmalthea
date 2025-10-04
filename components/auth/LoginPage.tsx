
import React, { useState } from 'react';
import { login } from '../../services/api';
import { User } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Input } from '../common/Input';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onNavigateToSignup: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToSignup }) => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await login(email, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Failed to login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card title="Login to Your Account" className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500 text-center">{error}</p>}
          <Input
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Hint: Any password works for this demo"
          />
          <div className="flex items-center justify-between">
            <a href="#" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
              Forgot password?
            </a>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          <p className="text-center text-sm">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToSignup}
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Sign up
            </button>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
