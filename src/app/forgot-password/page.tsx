'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // In this app, we'll fetch the user to show their specific question
    // Usually you shouldn't leak if an email exists, but for this ledger app it's better UX
    const res = await fetch(`/api/user-info?email=${email}`);
    const data = await res.json();
    
    if (res.ok) {
      setSecurityQuestion(data.securityQuestion);
      setStep(2);
    } else {
      setError(data.error || 'User not found');
    }
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, securityAnswer, newPassword }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (res.ok) {
      alert('Password reset successful! Please login.');
      router.push('/login');
    } else {
      setError(data.error || 'Incorrect answer');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Link href="/login" style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ArrowLeft size={20} /> Back to Login
      </Link>

      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>Reset Password</h1>
        <p style={{ color: 'var(--text-muted)' }}>Recover your account access.</p>
      </div>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {step === 1 ? (
        <form onSubmit={handleCheckEmail} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="Enter your email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <button type="submit" className="bg-red" disabled={loading} style={{ padding: '12px', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>
            {loading ? 'Checking...' : 'Next'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Security Question:</p>
            <p style={{ fontWeight: 'bold' }}>{securityQuestion}</p>
          </div>
          <input 
            placeholder="Your Answer" 
            value={securityAnswer} 
            onChange={(e) => setSecurityAnswer(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="New Password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="bg-red" disabled={loading} style={{ padding: '12px', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
}
