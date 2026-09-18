import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Check, 
  X, 
  Layers, 
  ArrowUpDown,
  History,
  Calendar,
  AlertCircle,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  ChevronDown,
  ShieldAlert
} from 'lucide-react';
import { Product, LossIncident } from '../types';
import { LossPreventionSubModule } from './LossPreventionSubModule';

interface InventoryModuleProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'salesHistory' | 'status' | 'lastRestocked'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAdjustStock: (productId: string, storeDelta: number, stockroomDelta: number) => void;
  lossIncidents?: LossIncident[];
  onAddLossIncident?: (incident: Omit<LossIncident, 'id' | 'incidentNumber'>) => void;
  onUpdateLossIncident?: (incident: LossIncident) => void;
  onDeleteLossIncident?: (incidentId: string) => void;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAdjustStock,
  lossIncidents = [],
  onAddLossIncident = () => {},
  onUpdateLossIncident = () => {},
  onDeleteLossIncident = () => {}
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'catalogue' | 'loss-prevention'>('catalogue');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [selectedProductHistory, setSelectedProductHistory] = useState<Product | null>(null);

  // CSV Export States
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add / Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Product['category']>('Footwear');
  const [brand, setBrand] = useState('Apex Athletics');
  const [price, setPrice] = useState(120);
  const [cost, setCost] = useState(50);
  const [storeStock, setStoreStock] = useState(10);
  const [stockroomStock, setStockroomStock] = useState(15);
  const [minThreshold, setMinThreshold] = useState(12);

  // Open Add Modal
  const openAddModal = () => {
    setEditingProduct(null);
    setSku(`SPRT-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setCategory('Footwear');
    setBrand('Apex Athletics');
    setPrice(120);
    setCost(48);
    setStoreStock(12);
    setStockroomStock(18);
    setMinThreshold(10);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setSku(product.sku);
    setName(product.name);
    setCategory(product.category);
    setBrand(product.brand);
    setPrice(product.price);
    setCost(product.cost);
    setStoreStock(product.storeStock);
    setStockroomStock(product.stockroomStock);
    setMinThreshold(product.minThreshold);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    if (editingProduct) {
      const totalStock = storeStock + stockroomStock;
      const status: Product['status'] = totalStock === 0 ? 'Out of Stock' : totalStock <= minThreshold ? 'Low Stock' : 'In Stock';
      onEditProduct({
        ...editingProduct,
        sku,
        name,
        category,
        brand,
        price: Number(price),
        cost: Number(cost),
        storeStock: Number(storeStock),
        stockroomStock: Number(stockroomStock),
        minThreshold: Number(minThreshold),
        status
      });
    } else {
      onAddProduct({
        sku,
        name,
        category,
        brand,
        price: Number(price),
        cost: Number(cost),
        storeStock: Number(storeStock),
        stockroomStock: Number(stockroomStock),
        minThreshold: Number(minThreshold)
      });
    }
    setIsModalOpen(false);
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesLowStock = !filterLowStockOnly || (p.status === 'Low Stock' || p.status === 'Out of Stock');

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockCount = products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length;
  const totalStockQuantity = products.reduce((sum, p) => sum + p.storeStock + p.stockroomStock, 0);
  const totalRetailValuation = products.reduce((sum, p) => sum + (p.storeStock + p.stockroomStock) * p.price, 0);

  // CSV Exporter for Reporting & External Auditing
  const escapeCsv = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const handleExportCSV = (exportFullCatalogue: boolean = false) => {
    const listToExport = exportFullCatalogue ? products : filteredProducts;
    if (listToExport.length === 0) return;

    const headers = [
      'Product ID',
      'SKU',
      'Product Name',
      'Brand',
      'Category',
      'Retail Unit Price ($)',
      'Unit Cost ($)',
      'Unit Gross Margin ($)',
      'Gross Margin (%)',
      'Sales Floor Stock',
      'Backroom Stock',
      'Total On-Hand Units',
      'Min Presentation Threshold',
      'Inventory Status',
      'Total Retail Valuation ($)',
      'Total Cost Valuation ($)',
      'Last Restocked Date',
      'Total Historical Units Sold',
      'Total Historical Revenue ($)',
      'Audit Compliance Risk Assessment'
    ];

    const rows = listToExport.map(p => {
      const totalUnits = p.storeStock + p.stockroomStock;
      const marginDollar = p.price - p.cost;
      const marginPercent = p.price > 0 ? ((marginDollar / p.price) * 100).toFixed(1) : '0.0';
      const retailValuation = totalUnits * p.price;
      const costValuation = totalUnits * p.cost;
      const unitsSold = p.salesHistory.reduce((sum, h) => sum + h.units, 0);
      const revSold = p.salesHistory.reduce((sum, h) => sum + h.revenue, 0);
      const auditCompliance = totalUnits === 0 
        ? 'Critical - Out of Stock (Depleted)'
        : totalUnits <= p.minThreshold 
        ? 'Warning - Below Floor Presentation Threshold'
        : 'Compliant - Optimal Inventory Level';

      return [
        p.id,
        p.sku,
        p.name,
        p.brand,
        p.category,
        p.price.toFixed(2),
        p.cost.toFixed(2),
        marginDollar.toFixed(2),
        `${marginPercent}%`,
        p.storeStock,
        p.stockroomStock,
        totalUnits,
        p.minThreshold,
        p.status,
        retailValuation.toFixed(2),
        costValuation.toFixed(2),
        p.lastRestocked,
        unitsSold,
        revSold.toFixed(2),
        auditCompliance
      ].map(escapeCsv).join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `store-inventory-audit-report-${dateStr}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccessMsg(`Exported ${listToExport.length} product records to "${filename}" for reporting & external auditing.`);
    setTimeout(() => {
      setExportSuccessMsg(null);
    }, 5000);
  };

  return (
    <div className="space-y-6">
      {/* Sub-module Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="inline-flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
          <button
            id="tab-inventory-catalogue"
            onClick={() => setActiveSubTab('catalogue')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'catalogue'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Package className="w-4 h-4 text-blue-600" />
            <span>Catalogue & Stock Levels</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {products.length}
            </span>
          </button>

          <button
            id="tab-inventory-loss-prevention"
            onClick={() => setActiveSubTab('loss-prevention')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'loss-prevention'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Loss Prevention</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-700 font-bold border border-rose-200">
              {lossIncidents.length} Events
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Store #402 Stock & Shrinkage Ledger Synchronized</span>
        </div>
      </div>

      {activeSubTab === 'loss-prevention' ? (
        <LossPreventionSubModule
          products={products}
          lossIncidents={lossIncidents}
          onAddLossIncident={onAddLossIncident}
          onUpdateLossIncident={onUpdateLossIncident}
          onDeleteLossIncident={onDeleteLossIncident}
          onAdjustStock={onAdjustStock}
        />
      ) : (
        <>
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total SKUs</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{products.length} Products</p>
          <p className="text-xs text-slate-500 mt-1">Active sports & fashion lines</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Inventory Units</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalStockQuantity} Units</p>
          <p className="text-xs text-slate-500 mt-1">Floor display + Backroom</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Retail Valuation</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">${totalRetailValuation.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Commercial inventory asset</p>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-colors ${
          lowStockCount > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Low-Stock Alerts</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-900 mt-2">{lowStockCount} Action Required</p>
          <p className="text-xs text-amber-700 mt-1">Below minimum presentation threshold</p>
        </div>
      </div>

      {/* Export CSV Audit Success Banner */}
      {exportSuccessMsg && (
        <div id="export-success-banner" className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            </div>
            <div>
              <span className="font-bold">Inventory Audit Export Complete: </span>
              <span>{exportSuccessMsg}</span>
            </div>
          </div>
          <button
            onClick={() => setExportSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Bar: Search, Category Filters, Add Product & Export CSV */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name, SKU, or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Low Stock Toggle Button */}
            <button
              onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-colors ${
                filterLowStockOnly
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Low Stock Alerts ({lowStockCount})</span>
            </button>

            {/* Export CSV Button & Audit Options Dropdown */}
            <div className="relative" ref={exportDropdownRef}>
              <div className="flex items-center rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs overflow-hidden">
                <button
                  id="export-inventory-csv-btn"
                  onClick={() => handleExportCSV(false)}
                  className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-2"
                  title="Export currently displayed product list as CSV for external auditing & reporting"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Export CSV ({filteredProducts.length})</span>
                </button>
                <button
                  id="export-inventory-csv-dropdown-btn"
                  onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                  className="px-2 py-2.5 border-l border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  title="Audit Export Options"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {isExportDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 text-xs">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Audit & Reporting CSV Export
                  </div>
                  <button
                    onClick={() => {
                      handleExportCSV(false);
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Current Filtered View</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {filteredProducts.length} items (matches active filters)
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      {filteredProducts.length} SKUs
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      handleExportCSV(true);
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between border-t border-slate-100"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-blue-600" />
                        <span>Complete Store Catalogue</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Full store inventory across all categories
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      {products.length} SKUs
                    </span>
                  </button>

                  <div className="px-3 py-2 bg-slate-50 text-[10px] text-slate-500 border-t border-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Includes cost, retail valuation, unit margins & audit risk flags</span>
                  </div>
                </div>
              )}
            </div>

            {/* Add Product Button */}
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-2xs"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['All', 'Footwear', 'Apparel', 'Equipment', 'Accessories'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/40">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>Catalogue & Quantity Breakdown</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time floor & stockroom counts. Click 'History' to review sales trajectories.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="export-table-csv-btn"
              onClick={() => handleExportCSV(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
              title="Download current table view as CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price / Margin</th>
                <th className="py-3 px-4">Sales Floor</th>
                <th className="py-3 px-4">Backroom Stock</th>
                <th className="py-3 px-4">Total Status</th>
                <th className="py-3 px-4 text-center">Quick Adjust</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const totalStock = p.storeStock + p.stockroomStock;
                const margin = Math.round(((p.price - p.cost) / p.price) * 100);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-semibold text-slate-900">{p.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono text-slate-500">{p.sku}</span>
                          <span className="text-[10px] text-slate-400">• {p.brand}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">${p.price}</div>
                      <div className="text-[11px] text-emerald-600 font-medium">
                        Cost: ${p.cost} ({margin}% margin)
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-semibold ${p.storeStock === 0 ? 'text-rose-600 font-bold' : 'text-slate-900'}`}>
                          {p.storeStock} on rack
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-slate-700 font-medium">{p.stockroomStock} units</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          p.status === 'In Stock'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : p.status === 'Low Stock'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {p.status === 'In Stock' && <Check className="w-3 h-3" />}
                          {p.status === 'Low Stock' && <AlertTriangle className="w-3 h-3" />}
                          {p.status === 'Out of Stock' && <X className="w-3 h-3" />}
                          <span>{totalStock} ({p.status})</span>
                        </span>
                        <p className="text-[10px] text-slate-400">Min Threshold: {p.minThreshold}</p>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                        <button
                          onClick={() => onAdjustStock(p.id, 1, 0)}
                          title="Restock +1 to Floor Shelf"
                          className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
                        >
                          +Floor
                        </button>
                        <button
                          onClick={() => onAdjustStock(p.id, -1, 0)}
                          disabled={p.storeStock <= 0}
                          title="Sold / Transfer -1 from Floor"
                          className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-xs font-bold text-slate-800 shadow-2xs disabled:opacity-30"
                        >
                          -Floor
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedProductHistory(p)}
                          title="View Sales History"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          title="Edit Product"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete product "${p.name}"?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          title="Delete Product"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No products found matching the criteria. Try clearing search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* Sales History Modal */}
      {selectedProductHistory && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Sales Performance History</h3>
                <p className="text-xs text-slate-500">{selectedProductHistory.name} ({selectedProductHistory.sku})</p>
              </div>
              <button
                onClick={() => setSelectedProductHistory(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500">Total Units Sold (Recent):</span>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {selectedProductHistory.salesHistory.reduce((s, h) => s + h.units, 0)} Units
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500">Total Revenue Generated:</span>
                  <p className="text-xl font-bold text-emerald-600 mt-1">
                    ${selectedProductHistory.salesHistory.reduce((s, h) => s + h.revenue, 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">
                Daily Breakdown
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedProductHistory.salesHistory.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-800">{item.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900">{item.units} units</span>
                      <span className="text-xs text-slate-500 ml-2">(${item.revenue})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedProductHistory(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Close Sales Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingProduct ? 'Edit Product Parameters' : 'Add New Retail Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Product SKU *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Product['category'])}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="Footwear">Footwear</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AeroGlide Elite Speed Runners"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Retail Price ($)</label>
                  <input
                    type="number"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    min="1"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Store Floor Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={storeStock}
                    onChange={(e) => setStoreStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Backroom Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={stockroomStock}
                    onChange={(e) => setStockroomStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Min Threshold Alert</label>
                  <input
                    type="number"
                    min="1"
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  {editingProduct ? 'Save Product Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
