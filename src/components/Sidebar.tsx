import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  Palette, 
  Users, 
  HeartHandshake, 
  ShieldCheck, 
  Store, 
  AlertCircle,
  Clock,
  X
} from 'lucide-react';
import { ModuleType } from '../types';

interface SidebarProps {
  currentModule: ModuleType;
  onSelectModule: (module: ModuleType) => void;
  isOpen: boolean;
  onClose: () => void;
  lowStockCount: number;
  pendingTransfersCount: number;
  pendingLeavesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  isOpen,
  onClose,
  lowStockCount,
  pendingTransfersCount,
  pendingLeavesCount
}) => {
  const navItems: { id: ModuleType; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; description: string }[] = [
    {
      id: 'dashboard',
      label: 'Command Center',
      icon: LayoutDashboard,
      description: 'KPIs, Commercial Ownership & Floor Status'
    },
    {
      id: 'inventory',
      label: 'Store Inventory',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      description: 'Stock Levels, Loss Prevention & Ledger'
    },
    {
      id: 'warehouse',
      label: 'Warehouse & Transfers',
      icon: Warehouse,
      badge: pendingTransfersCount > 0 ? pendingTransfersCount : undefined,
      description: 'Central DC, Bins & Same-Day Receiving'
    },
    {
      id: 'store-design',
      label: 'Interior & Exterior Design',
      icon: Palette,
      description: 'Visual Merchandising & Mall Directives'
    },
    {
      id: 'employment',
      label: 'HR & Staff Management',
      icon: Users,
      badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
      description: 'Schedules, MOD Shifts & Performance'
    },
    {
      id: 'crm',
      label: 'CRM & VIP Clients',
      icon: HeartHandshake,
      description: 'Customer History, Loyalty & Follow-ups'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">OmniRetail</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Store Suite
                </span>
              </div>
              <p className="text-xs text-slate-400">Store #104 • Metro Flagship</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Manager On Duty Status Badge */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Manager On Duty
            </span>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" /> Shift Active
            </span>
          </div>
          <p className="text-sm font-semibold text-white mt-1">Marcus Sterling</p>
          <p className="text-xs text-slate-400">08:30 AM – 05:30 PM • Sales Floor</p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Management Modules
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  onSelectModule(item.id);
                  onClose();
                }}
                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all relative ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm shadow-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-lg ${isActive ? 'text-slate-950' : 'text-slate-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-slate-950 text-amber-400'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs truncate ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Integrity & Compliance Summary */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">Audit & Loss Prevention</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Legal & financial integrity compliance: 100%. Daily cash register reconciliation logged.
          </p>
        </div>
      </aside>
    </>
  );
};
