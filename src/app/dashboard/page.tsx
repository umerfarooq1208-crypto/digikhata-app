'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, LogOut, Download, UserPlus, Wallet, TrendingUp, TrendingDown, Box, ShoppingCart, History } from 'lucide-react';
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

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'parties' | 'stock'>('parties');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Stock Form
  const [pName, setPName] = useState('');
  const [pCost, setPCost] = useState('');
  const [pSale, setPSale] = useState('');
  const [pStock, setPStock] = useState('');

  // Sale Form
  const [selProdId, setSelProdId] = useState('');
  const [sQty, setSQty] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    const [cRes, pRes, sRes] = await Promise.all([
      fetch('/api/customers'),
      fetch('/api/products'),
      fetch('/api/sales')
    ]);
    const [cData, pData, sData] = await Promise.all([cRes.json(), pRes.json(), sRes.json()]);
    setCustomers(cData);
    setProducts(pData);
    setSales(sData);
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
      fetchData();
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: pName, costPrice: Number(pCost), salePrice: Number(pSale), stock: Number(pStock) }),
    });
    if (res.ok) {
      setShowAddProductModal(false);
      setPName(''); setPCost(''); setPSale(''); setPStock('');
      fetchData();
    }
  };

  const handleLogSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: selProdId, quantity: Number(sQty) }),
    });
    if (res.ok) {
      setShowSaleModal(false);
      setSelProdId(''); setSQty('');
      fetchData();
    }
  };

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
    const dailyP = sales.filter(s => s.date.startsWith(today)).reduce((acc, s) => acc + s.profit, 0);
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
                <p className="value">Rs {totalToGive.toLocaleString()}</p>
              </div>
              <div className="summary-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                  <TrendingUp size={14} color="#81c784" />
                  <p className="label">You Get</p>
                </div>
                <p className="value">Rs {totalToGet.toLocaleString()}</p>
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
                <p style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>Rs {netBalance.toLocaleString()}</p>
              </div>
              <Wallet size={24} opacity={0.8} />
            </div>
          </>
        ) : (
          <>
            <div className="summary-cards">
              <div className="summary-card">
                <p className="label">Daily Profit</p>
                <p className="value" style={{ color: '#81c784' }}>Rs {dailyProfit.toLocaleString()}</p>
              </div>
              <div className="summary-card">
                <p className="label">Total Profit</p>
                <p className="value">Rs {totalProfit.toLocaleString()}</p>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', marginTop: '15px', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>Total Stock Value (Cost)</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>Rs {totalStockValue.toLocaleString()}</p>
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
                    Rs {Math.abs(customer.balance).toLocaleString()}
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
                    <p className="item-date">Stock: {product.stock} | Sale: Rs {product.salePrice}</p>
                  </div>
                </div>
                <div className="item-balance">
                  <p className="balance-val text-green">
                    Rs {(product.salePrice - product.costPrice).toLocaleString()}
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
                <input type="number" placeholder="Cost Price" value={pCost} onChange={e => setPCost(e.target.value)} required style={{ flex: 1 }} />
                <input type="number" placeholder="Sale Price" value={pSale} onChange={e => setPSale(e.target.value)} required style={{ flex: 1 }} />
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
        <div className="modal-overlay" onClick={() => setShowSaleModal(false)}>
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
              <button type="submit" className="bg-green" style={{ padding: '12px', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>
                Log Sale & Profit
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
