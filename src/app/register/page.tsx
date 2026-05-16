'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, securityQuestion, securityAnswer }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (res.ok) {
      router.push('/login');
    } else {
      setError(data.error || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>Register</h1>
        <p style={{ color: 'var(--text-muted)' }}>Create your digital ledger account.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}
        <input 
          type="text" 
          placeholder="Full Name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input 
          type="email" 
          placeholder="Email Address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div style={{ marginTop: '10px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Security Question (for recovery)</p>
          <select 
            value={securityQuestion} 
            onChange={(e) => setSecurityQuestion(e.target.value)} 
            required
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}
          >
            <option value="">Select a question</option>
            <option value="What is your pet's name?">What is your pet's name?</option>
            <option value="What city were you born in?">What city were you born in?</option>
            <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
            <option value="What was your first car?">What was your first car?</option>
          </select>
        </div>
        <input 
          placeholder="Security Answer" 
          value={securityAnswer} 
          onChange={(e) => setSecurityAnswer(e.target.value)} 
          required 
        />
        <button 
          type="submit"
          className="bg-red"
          disabled={loading}
          style={{ padding: '12px', color: 'white', borderRadius: '8px', fontWeight: 'bold', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>
        Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Login</Link>
      </p>
    </div>
  );
}
