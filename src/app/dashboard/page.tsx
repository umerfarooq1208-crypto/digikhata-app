'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, LogOut, UserPlus, Wallet, TrendingUp, TrendingDown, Box, ShoppingCart, Settings, Lock, Edit2, Trash2, Building } from 'lucide-react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  costPrice: number;
  salePrice: number;
  stock: number;
}

interface Sale {
  _id: string;
  productId: Product | string;
  quantity: number;
  profit: number;
  totalRevenue: number;
  date: string;
}

interface Customer {
  _id: string;
  name: string;
  phone: string;
  balance: number;
  updatedAt: string;
}

interface Business {
  _id: string;
  name: string;
  currency: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'parties' | 'stock'>('parties');
  
  // Businesses state
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Business manager modals
  const [showBusinessManager, setShowBusinessManager] = useState(false);
  const [showCreateBusinessModal, setShowCreateBusinessModal] = useState(false);
  const [showEditBusinessModal, setShowEditBusinessModal] = useState<Business | null>(null);

  // Form states
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [bName, setBName] = useState('');
  const [bCurrency, setBCurrency] = useState('Rs');

  // Password Change
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');

  // Stock Form
  const [pName, setPName] = useState('');
  const [pCost, setPCost] = useState('');
  const [pSale, setPSale] = useState('');
  const [pStock, setPStock] = useState('');

  // Sale Form
  const [selProdId, setSelProdId] = useState('');
  const [sQty, setSQty] = useState('');
  const [customSaleDate, setCustomSaleDate] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchBusinesses();
    }
  }, [status]);

  const fetchBusinesses = async (selectId?: string) => {
    const res = await fetch('/api/businesses');
    const data = await res.json();
    if (res.ok && data.length > 0) {
      setBusinesses(data);
      
      // Determine which business is active
      const savedId = selectId || localStorage.getItem('activeBusinessId');
      const found = data.find((b: Business) => b._id === savedId) || data[0];
      
      setActiveBusiness(found);
      localStorage.setItem('activeBusinessId', found._id);
      fetchData(found._id);
    }
  };

  const fetchData = async (bId: string) => {
    const [cRes, pRes, sRes] = await Promise.all([
      fetch(`/api/customers?businessId=${bId}`),
      fetch(`/api/products?businessId=${bId}`),
      fetch(`/api/sales?businessId=${bId}`)
    ]);
    const [cData, pData, sData] = await Promise.all([cRes.json(), pRes.json(), sRes.json()]);
    setCustomers(Array.isArray(cData) ? cData : []);
    setProducts(Array.isArray(pData) ? pData : []);
    setSales(Array.isArray(sData) ? sData : []);
  };

  const handleSwitchBusiness = (business: Business) => {
    setActiveBusiness(business);
    localStorage.setItem('activeBusinessId', business._id);
    fetchData(business._id);
    setShowBusinessManager(false);
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: bName, currency: bCurrency }),
    });
    const data = await res.json();
    if (res.ok) {
      setBName('');
      setBCurrency('Rs');
      setShowCreateBusinessModal(false);
      fetchBusinesses(data._id);
    }
  };

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditBusinessModal) return;
    const res = await fetch(`/api/businesses/${showEditBusinessModal._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: bName, currency: bCurrency }),
    });
    if (res.ok) {
      setBName('');
      setBCurrency('Rs');
      setShowEditBusinessModal(null);
      fetchBusinesses(activeBusiness?._id);
    }
  };

  const handleDeleteBusiness = async (bId: string, bName: string) => {
    if (businesses.length <= 1) {
      alert('You must have at least one business!');
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete "${bName}" and ALL of its customers, sales, and products? This cannot be undone.`)) return;
    const res = await fetch(`/api/businesses/${bId}`, { method: 'DELETE' });
    if (res.ok) {
      setShowEditBusinessModal(null);
      fetchBusinesses();
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness) return;
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, phone: newPhone, businessId: activeBusiness._id }),
    });
    if (res.ok) {
      setShowAddModal(false);
      setNewName('');
      setNewPhone('');
      fetchData(activeBusiness._id);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness) return;
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: pName, 
        costPrice: Number(pCost), 
        salePrice: Number(pSale), 
        stock: Number(pStock),
        businessId: activeBusiness._id
      }),
    });
    if (res.ok) {
      setShowAddProductModal(false);
      setPName(''); setPCost(''); setPSale(''); setPStock('');
      fetchData(activeBusiness._id);
    }
  };

  const handleLogSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness) return;
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        productId: selProdId, 
        quantity: Number(sQty), 
        businessId: activeBusiness._id,
        date: customSaleDate || undefined
      }),
    });
    if (res.ok) {
      setShowSaleModal(false);
      setSelProdId(''); setSQty(''); setCustomSaleDate('');
      fetchData(activeBusiness._id);
    } else {
      const errData = await res.json();
      alert(errData.error || 'Failed to log sale');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
    });
    if (res.ok) {
      alert('Password changed successfully!');
      setShowSettingsModal(false);
      setOldPass(''); setNewPass('');
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to change password');
    }
  };

  const currency = activeBusiness?.currency || 'Rs';

  const { totalToGet, totalToGive, netBalance } = useMemo(() => {
    const get = customers.reduce((acc, c) => acc + (c.balance > 0 ? c.balance : 0), 0);
    const give = customers.reduce((acc, c) => acc + (c.balance < 0 ? Math.abs(c.balance) : 0), 0);
    return {
      totalToGet: get,
      totalToGive: give,
      netBalance: get - give
    };
  }, [customers]);

  const { totalProfit, dailyProfit, totalStockValue } = useMemo(() => {
    const totalP = sales.reduce((acc, s) => acc + s.profit, 0);
    const today = new Date().toISOString().split('T')[0];
    const dailyP = sales.filter(s => s.date && s.date.startsWith(today)).reduce((acc, s) => acc + s.profit, 0);
    const stockVal = products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
    return { totalProfit: totalP, dailyProfit: dailyP, totalStockValue: stockVal };
  }, [sales, products]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone?.includes(search)
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (status === 'loading' || !activeBusiness) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

  return (
    <>
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div onClick={() => setShowBusinessManager(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={28} style={{ opacity: 0.9 }} />
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {activeBusiness.name} <span style={{ fontSize: '0.7rem', padding: '1px 6px', background: 'rgba(255,255,255,0.25)', borderRadius: '10px' }}>{currency}</span>
              </h1>
              <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Switch Business ⇆</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            {(session?.user as any)?.role === 'admin' && (
              <Link href="/admin" style={{ color: 'white', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                Admin Panel
              </Link>
            )}
            <button onClick={() => setShowSettingsModal(true)} style={{ background: 'none', color: 'white' }}>
              <Settings size={20} />
            </button>
            <button onClick={() => signOut()} style={{ background: 'none', color: 'white' }}>
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          <button 
            onClick={() => setActiveTab('parties')}
            style={{ 
              background: 'none', color: 'white', padding: '10px 0', 
              borderBottom: activeTab === 'parties' ? '3px solid white' : 'none',
              fontWeight: activeTab === 'parties' ? 'bold' : 'normal',
              flex: 1
            }}
          >
            Parties
          </button>
          <button 
            onClick={() => setActiveTab('stock')}
            style={{ 
              background: 'none', color: 'white', padding: '10px 0', 
              borderBottom: activeTab === 'stock' ? '3px solid white' : 'none',
              fontWeight: activeTab === 'stock' ? 'bold' : 'normal',
              flex: 1
            }}
          >
            Stock
          </button>
        </div>

        {activeTab === 'parties' ? (
          <>
            <div className="summary-cards">
              <div className="summary-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                  <TrendingDown size={14} color="#ff8a80" />
                  <p className="label">You Give</p>
                </div>
                <p className="value">{currency} {totalToGive.toLocaleString()}</p>
              </div>
              <div className="summary-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                  <TrendingUp size={14} color="#81c784" />
                  <p className="label">You Get</p>
                </div>
                <p className="value">{currency} {totalToGet.toLocaleString()}</p>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              marginTop: '15px', 
              padding: '15px', 
              borderRadius: '12px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div>
                <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>Total Net Balance (Hisab)</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{currency} {netBalance.toLocaleString()}</p>
              </div>
              <Wallet size={24} opacity={0.8} />
            </div>
          </>
        ) : (
          <>
            <div className="summary-cards">
              <div className="summary-card">
                <p className="label">Daily Profit</p>
                <p className="value" style={{ color: '#81c784' }}>{currency} {dailyProfit.toLocaleString()}</p>
              </div>
              <div className="summary-card">
                <p className="label">Total Profit</p>
                <p className="value">{currency} {totalProfit.toLocaleString()}</p>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', marginTop: '15px', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>Total Stock Value (Cost)</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{currency} {totalStockValue.toLocaleString()}</p>
              </div>
              <Box size={24} opacity={0.8} />
            </div>
          </>
        )}
      </header>

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder={activeTab === 'parties' ? "Search Customers" : "Search Products"}
            style={{ width: '100%', paddingLeft: '40px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ flex: 1 }}>
          {activeTab === 'parties' ? (
            filteredCustomers.map((customer) => (
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
                    {currency} {Math.abs(customer.balance).toLocaleString()}
                  </p>
                  <p className="balance-label">{customer.balance >= 0 ? 'You\'ll Get' : 'You\'ll Give'}</p>
                </div>
              </Link>
            ))
          ) : (
            filteredProducts.map((product) => (
              <div key={product._id} className="list-item" style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="avatar" style={{ background: '#e8f5e9' }}><Box size={20} /></div>
                  <div className="item-info">
                    <p className="item-name">{product.name}</p>
                    <p className="item-date">Stock: {product.stock} | Sale: {currency} {product.salePrice}</p>
                  </div>
                </div>
                <div className="item-balance">
                  <p className="balance-val text-green">
                    {currency} {(product.salePrice - product.costPrice).toLocaleString()}
                  </p>
                  <p className="balance-label">Profit / Item</p>
                </div>
              </div>
            ))
          )}
          {(activeTab === 'parties' ? filteredCustomers : filteredProducts).length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>No items found</p>
          )}
        </div>
      </div>

      {activeTab === 'parties' ? (
        <button className="fab" onClick={() => setShowAddModal(true)}>
          <UserPlus size={20} />
          Add Customer
        </button>
      ) : (
        <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px' }}>
          <button className="fab" onClick={() => setShowAddProductModal(true)} style={{ position: 'static', transform: 'none' }}>
            <Box size={20} /> Add Item
          </button>
          <button className="fab" onClick={() => setShowSaleModal(true)} style={{ position: 'static', transform: 'none', background: 'var(--secondary)' }}>
            <ShoppingCart size={20} /> Sale
          </button>
        </div>
      )}

      {/* Business Manager Modal */}
      {showBusinessManager && (
        <div className="modal-overlay" onClick={() => setShowBusinessManager(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={22} color="var(--primary)" /> Manage Businesses
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
              {businesses.map(b => (
                <div key={b._id} style={{
                  padding: '12px 15px', 
                  borderRadius: '10px', 
                  border: `1.5px solid ${activeBusiness?._id === b._id ? 'var(--primary)' : 'var(--border)'}`,
                  background: activeBusiness?._id === b._id ? '#ffebee' : 'white',
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: 'pointer'
                }} onClick={() => handleSwitchBusiness(b)}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: activeBusiness?._id === b._id ? 'var(--primary)' : 'inherit' }}>{b.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Currency: {b.currency}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      setShowEditBusinessModal(b);
                      setBName(b.name);
                      setBCurrency(b.currency);
                    }} style={{ background: 'none', color: 'var(--text-muted)' }}>
                      <Edit2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { setShowCreateBusinessModal(true); setBName(''); setBCurrency('Rs'); }} className="bg-red" style={{ width: '100%', padding: '12px', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>
              ➕ Create New Business
            </button>
          </div>
        </div>
      )}

      {/* Create Business Modal */}
      {showCreateBusinessModal && (
        <div className="modal-overlay" onClick={() => setShowCreateBusinessModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>Create New Business</h2>
            <form onSubmit={handleCreateBusiness} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input placeholder="Business Name" value={bName} onChange={e => setBName(e.target.value)} required />
              <input placeholder="Currency Symbol (e.g. Rs, $, AED)" value={bCurrency} onChange={e => setBCurrency(e.target.value)} required />
              <button type="submit" className="bg-red" style={{ padding: '12px', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>
                Create Business
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Business Modal */}
      {showEditBusinessModal && (
        <div className="modal-overlay" onClick={() => setShowEditBusinessModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>Edit Business</h2>
            <form onSubmit={handleUpdateBusiness} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input placeholder="Business Name" value={bName} onChange={e => setBName(e.target.value)} required />
              <input placeholder="Currency Symbol" value={bCurrency} onChange={e => setBCurrency(e.target.value)} required />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => handleDeleteBusiness(showEditBusinessModal._id, showEditBusinessModal.name)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#ffebee', color: 'var(--primary)', fontWeight: 'bold' }}>
                  <Trash2 size={16} style={{ display: 'inline', marginRight: '4px' }} /> Delete
                </button>
                <button type="submit" className="bg-red" style={{ flex: 1, padding: '12px', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {showAddProductModal && (
        <div className="modal-overlay" onClick={() => setShowAddProductModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>Add New Product / Item</h2>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input placeholder="Item Name" value={pName} onChange={e => setPName(e.target.value)} required />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" placeholder={`Cost Price (${currency})`} value={pCost} onChange={e => setPCost(e.target.value)} required style={{ flex: 1 }} />
                <input type="number" placeholder={`Sale Price (${currency})`} value={pSale} onChange={e => setPSale(e.target.value)} required style={{ flex: 1 }} />
              </div>
              <input type="number" placeholder="Initial Stock" value={pStock} onChange={e => setPStock(e.target.value)} required />
              <button type="submit" className="bg-red" style={{ padding: '12px', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>
                Save Item
              </button>
            </form>
          </div>
        </div>
      )}

      {showSaleModal && (
        <div className="modal-overlay" onClick={() => { setShowSaleModal(false); setCustomSaleDate(''); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>Log New Sale</h2>
            <form onSubmit={handleLogSale} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <select 
                value={selProdId} 
                onChange={e => setSelProdId(e.target.value)} 
                required
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
              >
                <option value="">Select Item</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock})</option>
                ))}
              </select>
              <input type="number" placeholder="Quantity" value={sQty} onChange={e => setSQty(e.target.value)} required />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sale Date & Time (Optional)</label>
                <input 
                  type="datetime-local" 
                  value={customSaleDate} 
                  onChange={e => setCustomSaleDate(e.target.value)} 
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              </div>

              <button type="submit" className="bg-green" style={{ padding: '12px', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>
                Log Sale & Profit
              </button>
            </form>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Lock size={20} color="var(--primary)" />
              <h2 style={{ margin: 0 }}>Security Settings</h2>
            </div>
            
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Change Account Password</p>
              <input 
                type="password" 
                placeholder="Current Password" 
                value={oldPass} 
                onChange={e => setOldPass(e.target.value)} 
                required 
              />
              <input 
                type="password" 
                placeholder="New Password" 
                value={newPass} 
                onChange={e => setNewPass(e.target.value)} 
                required 
              />
              <button type="submit" className="bg-red" style={{ padding: '12px', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>
                Update Password
              </button>
            </form>

            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
            
            <button 
              onClick={() => signOut()}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'none', fontWeight: 'bold' }}
            >
              Logout Account
            </button>
          </div>
        </div>
      )}
    </>
  );
}
