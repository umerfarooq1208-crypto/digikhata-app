'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus, Search, LogOut, Download, UserPlus } from 'lucide-react';
import Link from 'next/link';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  balance: number;
  updatedAt: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchCustomers();
    }
  }, [status]);

  const fetchCustomers = async () => {
    const res = await fetch('/api/customers');
    const data = await res.json();
    setCustomers(data);
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, phone: newPhone }),
    });
    if (res.ok) {
      setShowAddModal(false);
      setNewName('');
      setNewPhone('');
      fetchCustomers();
    }
  };

  const totalToGet = customers.reduce((acc, c) => acc + (c.balance > 0 ? c.balance : 0), 0);
  const totalToGive = customers.reduce((acc, c) => acc + (c.balance < 0 ? Math.abs(c.balance) : 0), 0);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone?.includes(search)
  );

  if (status === 'loading') return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

  return (
    <>
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>DigiKhata</h1>
            <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Hi, {session?.user?.name}</p>
          </div>
          <button onClick={() => signOut()} style={{ background: 'none', color: 'white' }}>
            <LogOut size={20} />
          </button>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <p className="label">You will give</p>
            <p className="value">Rs {totalToGive.toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <p className="label">You will get</p>
            <p className="value" style={{ color: '#81c784' }}>Rs {totalToGet.toLocaleString()}</p>
          </div>
        </div>
      </header>

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search Customers" 
            style={{ width: '100%', paddingLeft: '40px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ flex: 1 }}>
          {filteredCustomers.map((customer) => (
            <Link href={`/customer/${customer._id}`} key={customer._id} className="list-item">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="avatar">{customer.name[0].toUpperCase()}</div>
                <div className="item-info">
                  <p className="item-name">{customer.name}</p>
                  <p className="item-date">{new Date(customer.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="item-balance">
                <p className={`balance-val ${customer.balance >= 0 ? 'text-green' : 'text-red'}`}>
                  Rs {Math.abs(customer.balance).toLocaleString()}
                </p>
                <p className="balance-label">{customer.balance >= 0 ? 'You\'ll Get' : 'You\'ll Give'}</p>
              </div>
            </Link>
          ))}
          {filteredCustomers.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>No customers found</p>
          )}
        </div>
      </div>

      <button className="fab" onClick={() => setShowAddModal(true)}>
        <UserPlus size={20} />
        Add Customer
      </button>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>Add New Customer</h2>
            <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                placeholder="Customer Name" 
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
                required 
              />
              <input 
                placeholder="Phone Number (Optional)" 
                value={newPhone} 
                onChange={e => setNewPhone(e.target.value)} 
              />
              <button type="submit" className="bg-red" style={{ padding: '12px', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>
                Save Customer
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
