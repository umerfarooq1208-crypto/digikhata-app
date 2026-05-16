'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, ShieldCheck, Lock } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const res = await fetch('/api/forgot-password/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' },
    });
    
    const data = await res.json();
    if (res.ok) {
      setMessage('A 6-digit code has been sent to your email.');
      setStep(2);
    } else {
      setError(data.error || 'Failed to send code');
    }
    setLoading(false);
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/forgot-password/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (res.ok) {
      alert('Password reset successful! Please login.');
      router.push('/login');
    } else {
      setError(data.error || 'Invalid code');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <Link href="/login" style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ArrowLeft size={20} /> Back to Login
      </Link>

      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>Forgot Password?</h1>
        <p style={{ color: 'var(--text-muted)' }}>We will send a reset code to your email.</p>
      </div>

      {error && <p style={{ color: 'red', textAlign: 'center', background: '#ffebee', padding: '10px', borderRadius: '8px' }}>{error}</p>}
      {message && <p style={{ color: 'green', textAlign: 'center', background: '#e8f5e9', padding: '10px', borderRadius: '8px' }}>{message}</p>}

      {step === 1 ? (
        <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <button type="submit" className="bg-red" disabled={loading} style={{ padding: '12px', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>
            {loading ? 'Sending Code...' : 'Send Reset Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyAndReset} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <ShieldCheck size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              placeholder="6-Digit Code" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              required 
              maxLength={6}
              style={{ paddingLeft: '40px', letterSpacing: '3px', fontWeight: 'bold' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="password" 
              placeholder="New Password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <button type="submit" className="bg-red" disabled={loading} style={{ padding: '12px', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>
            {loading ? 'Resetting...' : 'Update Password'}
          </button>
          <p onClick={() => setStep(1)} style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--primary)', cursor: 'pointer' }}>Didn't get code? Send again</p>
        </form>
      )}
    </div>
  );
}
