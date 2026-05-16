'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Phone, Download, Plus, Minus } from 'lucide-react';
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
}

export default function CustomerDetails() {
  const { id } = useParams();
  const { status } = useSession();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState<{ show: boolean, type: 'GAVE' | 'GOT' | null }>({ show: false, type: null });
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && id) {
      fetchCustomer();
      fetchTransactions();
    }
  }, [status, id]);

  const fetchCustomer = async () => {
    const res = await fetch('/api/customers');
    const data = await res.json();
    const current = data.find((c: Customer) => c._id === id);
    setCustomer(current);
  };

  const fetchTransactions = async () => {
    const res = await fetch(`/api/transactions?customerId=${id}`);
    const data = await res.json();
    setTransactions(data);
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        customerId: id, 
        amount: Number(amount), 
        description, 
        type: showModal.type 
      }),
    });
    if (res.ok) {
      setShowModal({ show: false, type: null });
      setAmount('');
      setDescription('');
      fetchCustomer();
      fetchTransactions();
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Ledger Report: ${customer?.name}`, 10, 10);
    doc.text(`Balance: Rs ${customer?.balance}`, 10, 20);
    
    let y = 30;
    transactions.forEach((t, i) => {
      const date = new Date(t.date).toLocaleDateString();
      const line = `${date} - ${t.type}: Rs ${t.amount} (${t.description || 'No notes'})`;
      doc.text(line, 10, y);
      y += 10;
      if (y > 280) { doc.addPage(); y = 10; }
    });
    
    doc.save(`${customer?.name}_ledger.pdf`);
  };

  if (!customer) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

  return (
    <>
      <header className="header" style={{ paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link href="/dashboard" style={{ color: 'white' }}>
            <ArrowLeft size={24} />
          </Link>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{customer.name}</h1>
            <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>{customer.phone || 'No phone'}</p>
          </div>
          <button onClick={downloadPDF} style={{ background: 'none', color: 'white' }}>
            <Download size={20} />
          </button>
        </div>

        <div style={{ background: 'white', color: 'var(--text-main)', margin: '20px 0 0', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Net Balance</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: customer.balance >= 0 ? 'var(--secondary)' : 'var(--primary)' }}>
              Rs {Math.abs(customer.balance).toLocaleString()}
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
          <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: '500' }}>{new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.description || 'No note'}</p>
            </div>
            <div style={{ display: 'flex', gap: '20px', width: '180px', justifyContent: 'flex-end', alignItems: 'center' }}>
              <p style={{ color: 'var(--primary)', fontWeight: 'bold', width: '80px', textAlign: 'right' }}>
                {t.type === 'GAVE' ? `Rs ${t.amount.toLocaleString()}` : ''}
              </p>
              <p style={{ color: 'var(--secondary)', fontWeight: 'bold', width: '80px', textAlign: 'right' }}>
                {t.type === 'GOT' ? `Rs ${t.amount.toLocaleString()}` : ''}
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
        <div className="modal-overlay" onClick={() => setShowModal({ show: false, type: null })}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px', color: showModal.type === 'GAVE' ? 'var(--primary)' : 'var(--secondary)' }}>
              {showModal.type === 'GAVE' ? 'You Gave' : 'You Got'}
            </h2>
            <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="number"
                placeholder="Amount (Rs)" 
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
              <button type="submit" className={showModal.type === 'GAVE' ? 'bg-red' : 'bg-green'} style={{ padding: '12px', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>
                Save Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
