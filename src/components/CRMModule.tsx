import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Search, 
  Plus, 
  Star, 
  ShoppingBag, 
  Calendar, 
  Phone, 
  Mail, 
  UserCheck, 
  Check, 
  X,
  Tag,
  DollarSign
} from 'lucide-react';
import { CustomerProfile } from '../types';

interface CRMModuleProps {
  customers: CustomerProfile[];
  onAddCustomer: (customer: Omit<CustomerProfile, 'id' | 'purchaseHistory' | 'lifetimeValue' | 'totalOrders'>) => void;
  onUpdateNotes: (customerId: string, notes: string) => void;
}

export const CRMModule: React.FC<CRMModuleProps> = ({
  customers,
  onAddCustomer,
  onUpdateNotes
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(customers[0] || null);
  const [isNewCustModalOpen, setIsNewCustModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState<CustomerProfile['tier']>('Gold Runner');
  const [preferredCategory, setPreferredCategory] = useState<CustomerProfile['preferredCategory']>('Running');
  const [notes, setNotes] = useState('');

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCustomer({
      name,
      email,
      phone,
      tier,
      preferredCategory,
      lastVisit: '2026-09-18',
      notes,
      npsScore: 10
    });

    setIsNewCustModalOpen(false);
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.phone.includes(searchQuery);
    const matchesTier = selectedTier === 'All' || c.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  const totalVIPs = customers.filter(c => c.tier.includes('VIP') || c.tier.includes('Gold')).length;
  const avgNPS = (customers.reduce((sum, c) => sum + c.npsScore, 0) / customers.length).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5" />
              Client Relationship Management & VIP Service
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
              Sports & Fashion Loyalty
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-100">
            Maximize customer connection on the sales floor. Build long-term brand loyalty with personalized fit consulting and VIP perks.
          </p>
        </div>

        <button
          onClick={() => setIsNewCustModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register VIP Customer</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Loyalty Members</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{customers.length} Profiles</p>
          <p className="text-xs text-slate-500 mt-1">{totalVIPs} Tier-1 VIP & Gold Runners</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Customer NPS Rating</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{avgNPS} / 10</p>
          <p className="text-xs text-slate-500 mt-1">Exceptional sales floor service index</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Avg Lifetime Value</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ${Math.round(customers.reduce((s, c) => s + c.lifetimeValue, 0) / customers.length).toLocaleString()}
          </p>
          <p className="text-xs text-blue-600 mt-1">High repeat purchase frequency</p>
        </div>
      </div>

      {/* Main CRM Layout: Customer List (Left) + Detailed Profile Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: List & Search (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search VIPs by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['All', 'VIP Platinum', 'Gold Runner', 'Silver Club'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTier(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedTier === t
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[560px] overflow-y-auto">
            {filteredCustomers.map((cust) => {
              const isSelected = selectedCustomer?.id === cust.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{cust.name}</h4>
                      <p className={`text-xs mt-0.5 ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                        {cust.email}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cust.tier === 'VIP Platinum'
                        ? isSelected ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900'
                        : isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {cust.tier}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className={isSelected ? 'text-slate-300' : 'text-slate-600'}>
                      Prefers: <span className="font-semibold">{cust.preferredCategory}</span>
                    </span>
                    <span className={`font-bold ${isSelected ? 'text-amber-400' : 'text-emerald-600'}`}>
                      ${cust.lifetimeValue.toLocaleString()} LTV
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Detailed Profile & History (7 cols) */}
        <div className="lg:col-span-7">
          {selectedCustomer ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h3>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 border border-amber-500/30">
                      {selectedCustomer.tier}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> {selectedCustomer.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {selectedCustomer.phone}
                    </span>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-100 sm:pl-4">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Lifetime Spend</span>
                  <p className="text-xl font-bold text-slate-900">
                    ${selectedCustomer.lifetimeValue.toLocaleString()}
                  </p>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    {selectedCustomer.totalOrders} Completed Visits
                  </span>
                </div>
              </div>

              {/* Consultation & Fit Preferences Note */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-600" />
                    Manager Fit Notes & Personal Styling Profile
                  </span>
                  <span className="text-[11px] text-slate-400">Last visited: {selectedCustomer.lastVisit}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200">
                  "{selectedCustomer.notes}"
                </p>
              </div>

              {/* Purchase History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Past Store Transactions ({selectedCustomer.purchaseHistory.length})
                </h4>

                <div className="space-y-2">
                  {selectedCustomer.purchaseHistory.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{item.items}</p>
                          <p className="text-[11px] text-slate-400">{item.date} • In-store POS Terminal #02</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-900">${item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              Select a customer from the left list to view their complete profile and purchase history.
            </div>
          )}
        </div>
      </div>

      {/* New Customer Modal */}
      {isNewCustModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Register VIP Client</h3>
              <button
                onClick={() => setIsNewCustModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Adams"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="rachel@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Loyalty Tier</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as CustomerProfile['tier'])}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  >
                    <option value="VIP Platinum">VIP Platinum</option>
                    <option value="Gold Runner">Gold Runner</option>
                    <option value="Silver Club">Silver Club</option>
                    <option value="Standard Member">Standard Member</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Preferred Sports Line</label>
                  <select
                    value={preferredCategory}
                    onChange={(e) => setPreferredCategory(e.target.value as CustomerProfile['preferredCategory'])}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  >
                    <option value="Running">Running</option>
                    <option value="Training">Training</option>
                    <option value="Streetwear">Streetwear</option>
                    <option value="Basketball">Basketball</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Personal Fit & Styling Notes</label>
                <textarea
                  rows={3}
                  placeholder="Notes on shoe size, foot arch, favorite color stories, or competition dates..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCustModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  Save VIP Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
