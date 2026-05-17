'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Phone, Download, Plus, Minus, Trash2, Edit2 } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  type: 'GAVE' | 'GOT';
  date: string;
}

interface Customer {
  _id: string;
  name: string;
  phone: string;
  balance: number;
  businessId?: {
    _id: string;
    name: string;
    currency: string;
  };
}

export default function CustomerDetails() {
  const { id } = useParams();
  const { status } = useSession();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState<{ show: boolean, type: 'GAVE' | 'GOT' | null }>({ show: false, type: null });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [editTran, setEditTran] = useState<Transaction | null>(null);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [customDate, setCustomDate] = useState('');

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && id) {
      fetchCustomer();
      fetchTransactions();
    }
  }, [status, id]);

  const fetchCustomer = async () => {
    const res = await fetch(`/api/customers/${id}`);
    const data = await res.json();
    setCustomer(data);
  };

  const fetchTransactions = async () => {
    const res = await fetch(`/api/transactions?customerId=${id}`);
    const data = await res.json();
    setTransactions(data);
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        customerId: id, 
        businessId: customer.businessId?._id || customer.businessId,
        amount: Number(amount), 
        description, 
        type: showModal.type,
        date: customDate || undefined
      }),
    });
    if (res.ok) {
      setShowModal({ show: false, type: null });
      setAmount('');
      setDescription('');
      setCustomDate('');
      fetchCustomer();
      fetchTransactions();
    }
  };

  const currency = customer?.businessId?.currency || 'Rs';

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Ledger Report: ${customer?.name}`, 10, 10);
    doc.text(`Balance: ${currency} ${customer?.balance}`, 10, 20);
    
    let y = 30;
    transactions.forEach((t) => {
      const date = new Date(t.date).toLocaleDateString();
      const line = `${date} - ${t.type}: ${currency} ${t.amount} (${t.description || 'No notes'})`;
      doc.text(line, 10, y);
      y += 10;
      if (y > 280) { doc.addPage(); y = 10; }
    });
    
    doc.save(`${customer?.name}_ledger.pdf`);
  };

  const handleDeleteCustomer = async () => {
    const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/dashboard');
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, phone: editPhone }),
    });
    if (res.ok) {
      setShowEditCustomer(false);
      fetchCustomer();
    }
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTran) return;
    const res = await fetch(`/api/transactions/${editTran._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount), description, date: customDate || undefined }),
    });
    if (res.ok) {
      setEditTran(null);
      setAmount('');
      setDescription('');
      setCustomDate('');
      fetchCustomer();
      fetchTransactions();
    }
  };

  const handleDeleteTransaction = async (tranId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    const res = await fetch(`/api/transactions/${tranId}`, { method: 'DELETE' });
    if (res.ok) {
      fetchCustomer();
      fetchTransactions();
    }
  };

  if (!customer) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

  return (
    <>
      <header className="header" style={{ paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link href="/dashboard" style={{ color: 'white' }}>
            <ArrowLeft size={24} />
          </Link>
          <div style={{ flex: 1 }} onClick={() => { setEditName(customer.name); setEditPhone(customer.phone); setShowEditCustomer(true); }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {customer.name} <Edit2 size={14} opacity={0.7} />
            </h1>
            <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>{customer.phone || 'No phone'}</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={downloadPDF} style={{ background: 'none', color: 'white' }}>
              <Download size={20} />
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} style={{ background: 'none', color: 'white' }}>
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div style={{ background: 'white', color: 'var(--text-main)', margin: '20px 0 0', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Net Balance</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: customer.balance >= 0 ? 'var(--secondary)' : 'var(--primary)' }}>
              {currency} {Math.abs(customer.balance).toLocaleString()}
            </p>
          </div>
          <p style={{ fontSize: '0.8rem', fontWeight: '500' }}>
            {customer.balance >= 0 ? 'You\'ll Get' : 'You\'ll Give'}
          </p>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
          <p>ENTRIES</p>
          <div style={{ display: 'flex', gap: '40px' }}>
            <p>YOU GAVE</p>
            <p>YOU GOT</p>
          </div>
        </div>

        {transactions.map((t) => (
          <div key={t._id} className="list-item" style={{ borderBottom: '1px solid var(--border)', cursor: 'default' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                {new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.description || 'No note'}</p>
              <button 
                onClick={() => { 
                  setEditTran(t); 
                  setAmount(t.amount.toString()); 
                  setDescription(t.description);
                  // Format date to YYYY-MM-DDTHH:MM for datetime-local input
                  const localDate = new Date(t.date);
                  const formattedDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                  setCustomDate(formattedDate);
                }}
                style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'none', padding: '5px 0', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Edit2 size={10} /> Edit Entry
              </button>
            </div>
            <div style={{ display: 'flex', gap: '20px', width: '180px', justifyContent: 'flex-end', alignItems: 'center' }}>
              <p style={{ color: 'var(--primary)', fontWeight: 'bold', width: '80px', textAlign: 'right' }}>
                {t.type === 'GAVE' ? `${currency} ${t.amount.toLocaleString()}` : ''}
              </p>
              <p style={{ color: 'var(--secondary)', fontWeight: 'bold', width: '80px', textAlign: 'right' }}>
                {t.type === 'GOT' ? `${currency} ${t.amount.toLocaleString()}` : ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '15px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: 'white', borderTop: '1px solid var(--border)' }}>
        <button 
          onClick={() => setShowModal({ show: true, type: 'GAVE' })}
          className="bg-red" 
          style={{ color: 'white', padding: '12px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Plus size={18} /> YOU GAVE
        </button>
        <button 
          onClick={() => setShowModal({ show: true, type: 'GOT' })}
          className="bg-green" 
          style={{ color: 'white', padding: '12px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Minus size={18} /> YOU GOT
        </button>
      </div>

      {showModal.show && (
        <div className="modal-overlay" onClick={() => { setShowModal({ show: false, type: null }); setCustomDate(''); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px', color: showModal.type === 'GAVE' ? 'var(--primary)' : 'var(--secondary)' }}>
              {showModal.type === 'GAVE' ? 'You Gave' : 'You Got'}
            </h2>
            <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="number"
                placeholder={`Amount (${currency})`} 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                required 
                autoFocus
                style={{ fontSize: '1.5rem', textAlign: 'center', fontWeight: 'bold' }}
              />
              <input 
                placeholder="Enter Note (Description)" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Entry Date & Time (Optional)</label>
                <input 
                  type="datetime-local" 
                  value={customDate} 
                  onChange={e => setCustomDate(e.target.value)} 
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              </div>
              <button type="submit" className={showModal.type === 'GAVE' ? 'bg-red' : 'bg-green'} style={{ padding: '12px', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>
                Save Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <Trash2 size={48} color="var(--primary)" style={{ marginBottom: '15px' }} />
            <h2 style={{ marginBottom: '10px' }}>Delete Customer?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              This will permanently delete <b>{customer.name}</b> and all their transaction history. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteCustomer}
                className="bg-red"
                style={{ flex: 1, padding: '12px', borderRadius: '8px', color: 'white', fontWeight: 'bold' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditCustomer && (
        <div className="modal-overlay" onClick={() => setShowEditCustomer(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>Edit Customer</h2>
            <form onSubmit={handleUpdateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Name" required />
              <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="Phone" />
              <button type="submit" className="bg-red" style={{ padding: '12px', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>Update Profile</button>
            </form>
          </div>
        </div>
      )}

      {editTran && (
        <div className="modal-overlay" onClick={() => { setEditTran(null); setCustomDate(''); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>Edit Entry</h2>
            <form onSubmit={handleUpdateTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" required />
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Note" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Entry Date & Time (Optional)</label>
                <input 
                  type="datetime-local" 
                  value={customDate} 
                  onChange={e => setCustomDate(e.target.value)} 
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => handleDeleteTransaction(editTran._id)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#ffebee', color: 'var(--primary)', fontWeight: 'bold' }}>Delete</button>
                <button type="submit" className="bg-red" style={{ flex: 1, padding: '12px', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
