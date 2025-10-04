import React, { useState, useEffect } from 'react';
import { adminSignup, fetchCurrencyForCountry } from '../../services/api';
import { COUNTRIES } from '../../constants';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';

interface SignupPageProps {
  onSignupSuccess: () => void;
  onNavigateToLogin: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignupSuccess, onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('US');
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getCurrency = async () => {
      if (country) {
        const fetchedCurrency = await fetchCurrencyForCountry(country);
        setCurrency(fetchedCurrency);
      }
    };
    getCurrency();
  }, [country]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await adminSignup({ name, email, password });
      onSignupSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to sign up.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card title="Create Admin Account" className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-center">{error}</p>}
          <Input id="name" label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input id="email" label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Input id="confirmPassword" label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <Select id="country" label="Country" value={country} onChange={(e) => setCountry(e.target.value)}>
            {Object.entries(COUNTRIES).map(([code, { name }]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </Select>
          <div className="text-sm text-gray-600 dark:text-gray-400">Your default currency will be: <span className="font-semibold">{currency}</span></div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
          <p className="text-center text-sm">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Login
            </button>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default SignupPage;
