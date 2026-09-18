import React from 'react';
import { Menu, Bell, AlertTriangle, CheckCircle2, UserCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { ModuleType } from '../types';

interface HeaderProps {
  currentModule: ModuleType;
  onOpenSidebar: () => void;
  lowStockCount: number;
  pendingTransfersCount: number;
  onQuickModuleSelect: (mod: ModuleType) => void;
}

const MODULE_TITLES: Record<ModuleType, { title: string; subtitle: string }> = {
  'dashboard': {
    title: 'Store Commercial Command Center',
    subtitle: 'Daily Sales Pacing, Floor Readiness, Status Quo Analytics & Audits'
  },
  'inventory': {
    title: 'Store Inventory & Loss Prevention',
    subtitle: 'Product Catalogue, Live Floor Stocks, Shrinkage Audits & Theft Logging'
  },
  'warehouse': {
    title: 'Warehouse & Transfer Operations',
    subtitle: 'Central Distribution Depot, Same-Day Merchandise Receiving & Logistics'
  },
  'store-design': {
    title: 'Store Interior & Exterior Design',
    subtitle: 'Visual Merchandising Directives, Window Displays & Mall Admin Standards'
  },
  'employment': {
    title: 'Employment & HR Management',
    subtitle: 'Staff Scheduling, Floor Lead Coverage, Performance Reviews & Leave'
  },
  'crm': {
    title: 'Customer Relationship Management',
    subtitle: 'VIP Client Profiles, Purchase Histories & Omnichannel Brand Loyalty'
  }
};

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  onOpenSidebar,
  lowStockCount,
  pendingTransfersCount,
  onQuickModuleSelect
}) => {
  const currentInfo = MODULE_TITLES[currentModule];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Hamburger & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="mobile-menu-toggle"
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              {currentInfo.title}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block truncate">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Alerts & Manager Profile */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Quick status alerts */}
          {lowStockCount > 0 && (
            <button
              onClick={() => onQuickModuleSelect('inventory')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium hover:bg-amber-100 transition-colors"
              title="View Low Stock Items"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Low Stock:</span>
              <span className="font-bold">{lowStockCount}</span>
            </button>
          )}

          {pendingTransfersCount > 0 && (
            <button
              onClick={() => onQuickModuleSelect('warehouse')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium hover:bg-blue-100 transition-colors"
              title="Review Pending Shipments"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Transfers:</span>
              <span className="font-bold">{pendingTransfersCount}</span>
            </button>
          )}

          {/* Store & Date Info */}
          <div className="hidden md:flex flex-col text-right border-l border-slate-200 pl-4 py-0.5">
            <span className="text-xs font-semibold text-slate-800">Friday, Sept 18, 2026</span>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Store Open (10:00 - 21:00)
            </span>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center ring-2 ring-amber-400/30">
              MS
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">Marcus Sterling</p>
              <p className="text-[10px] text-slate-500 font-medium">Store Manager</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
