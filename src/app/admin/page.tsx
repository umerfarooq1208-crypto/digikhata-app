'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Users, Trash2, Database, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface UserStats {
  _id: string;
  name: string;
  email: string;
  role: string;
  customerCount: number;
  productCount: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && session) {
      if ((session.user as any).role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchUsers();
      }
    }
  }, [status, session]);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    if (res.ok) setUsers(data);
    setLoading(false);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`CRITICAL: Delete user "${userName}" and ALL their data? This cannot be undone.`)) return;
    
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    
    if (res.ok) {
      alert('User deleted successfully');
      fetchUsers();
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Admin Panel...</div>;

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <header className="header" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link href="/dashboard" style={{ color: 'white' }}><ArrowLeft size={24} /></Link>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>Admin Control Center</h1>
            <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>Database Management & User Control</p>
          </div>
        </div>
      </header>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <Users size={24} color="var(--primary)" />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px' }}>Total Users</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{users.length}</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <Database size={24} color="var(--secondary)" />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px' }}>System Status</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4caf50' }}>Healthy</p>
          </div>
        </div>

        <h2 style={{ fontSize: '1rem', marginBottom: '15px', color: 'var(--text-muted)' }}>REGISTERED USERS</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {users.map(user => (
            <div key={user._id} style={{ background: 'white', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ fontWeight: 'bold' }}>{user.name}</p>
                  {user.role === 'admin' && <span style={{ fontSize: '0.65rem', background: '#e3f2fd', color: '#1976d2', padding: '2px 6px', borderRadius: '4px' }}>ADMIN</span>}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</p>
                <p style={{ fontSize: '0.75rem', marginTop: '5px' }}>
                  <b>{user.customerCount}</b> Customers | <b>{user.productCount}</b> Products
                </p>
              </div>
              
              {user.role !== 'admin' && (
                <button 
                  onClick={() => handleDeleteUser(user._id, user.name)}
                  style={{ background: '#ffebee', color: 'var(--primary)', border: 'none', padding: '10px', borderRadius: '8px' }}
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        {users.length === 0 && <p style={{ textAlign: 'center', padding: '40px' }}>No users found.</p>}
        
        <div style={{ marginTop: '30px', padding: '20px', background: '#fff3e0', borderRadius: '12px', border: '1px solid #ffe0b2', display: 'flex', gap: '15px' }}>
          <ShieldAlert size={24} color="#f57c00" />
          <div>
            <p style={{ fontWeight: 'bold', color: '#e65100' }}>Admin Security Tip</p>
            <p style={{ fontSize: '0.8rem', color: '#6d4c41' }}>Deletion is permanent. Always verify the user identity before deleting their digital ledger data.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
