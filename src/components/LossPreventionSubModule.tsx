import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Download, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  UserCheck, 
  Camera, 
  FileText, 
  X, 
  DollarSign, 
  PackageX, 
  Eye, 
  Layers,
  ArrowRight,
  TrendingDown,
  Check,
  AlertOctagon,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { Product, LossIncident, LossIncidentType, LossIncidentSeverity, LossIncidentStatus } from '../types';

interface LossPreventionSubModuleProps {
  products: Product[];
  lossIncidents: LossIncident[];
  onAddLossIncident: (incident: Omit<LossIncident, 'id' | 'incidentNumber'>) => void;
  onUpdateLossIncident: (incident: LossIncident) => void;
  onDeleteLossIncident: (incidentId: string) => void;
  onAdjustStock: (productId: string, storeDelta: number, stockroomDelta: number) => void;
}

const COMMON_LOCATIONS = [
  'Fitting Rooms Zone B',
  'Fitting Rooms Zone A',
  'Main Entrance EAS Pedestal',
  'Performance Running Footwear Wall',
  'Cash Wrap Accessories Gondola',
  'Stockroom Receiving Bay 2',
  'Stockroom High-Value Secure Cage',
  'Apparel Lifestyle Display Tables',
  'Equipment Demonstration Area'
];

export const LossPreventionSubModule: React.FC<LossPreventionSubModuleProps> = ({
  products,
  lossIncidents,
  onAddLossIncident,
  onUpdateLossIncident,
  onDeleteLossIncident,
  onAdjustStock
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'loss-desc' | 'loss-asc'>('date-desc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<LossIncident | null>(null);
  const [viewingDetailIncident, setViewingDetailIncident] = useState<LossIncident | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form Fields
  const [incidentType, setIncidentType] = useState<LossIncidentType>('Suspected Theft / Shoplifting');
  const [severity, setSeverity] = useState<LossIncidentSeverity>('Medium');
  const [status, setStatus] = useState<LossIncidentStatus>('Pending Review');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [customSku, setCustomSku] = useState('');
  const [customProductName, setCustomProductName] = useState('');
  const [customCategory, setCustomCategory] = useState<Product['category']>('Footwear');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number>(50);
  const [unitPrice, setUnitPrice] = useState<number>(120);
  const [estimatedLoss, setEstimatedLoss] = useState<number>(50);
  const [occurredDate, setOccurredDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [occurredTime, setOccurredTime] = useState<string>(
    new Date().toTimeString().slice(0, 5)
  );
  const [loggedBy, setLoggedBy] = useState<string>('Marcus Vance (Store Manager)');
  const [location, setLocation] = useState<string>('Fitting Rooms Zone B');
  const [notes, setNotes] = useState<string>('');
  const [cctvReviewed, setCctvReviewed] = useState<boolean>(false);
  const [cctvFootageRef, setCctvFootageRef] = useState<string>('');
  const [policeReportFiled, setPoliceReportFiled] = useState<boolean>(false);
  const [policeReportNumber, setPoliceReportNumber] = useState<string>('');
  const [actionTaken, setActionTaken] = useState<string>('');
  const [deductFromStock, setDeductFromStock] = useState<boolean>(true);

  // Synchronize product selection
  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    if (prodId === 'custom') {
      setCustomSku('AST-MISC-99');
      setCustomProductName('Miscellaneous Store Asset / Uncatalogued Item');
      setCustomCategory('Equipment');
      setUnitCost(40);
      setUnitPrice(100);
      setEstimatedLoss(40 * quantity);
      return;
    }
    const found = products.find(p => p.id === prodId);
    if (found) {
      setCustomSku(found.sku);
      setCustomProductName(found.name);
      setCustomCategory(found.category);
      setUnitCost(found.cost);
      setUnitPrice(found.price);
      setEstimatedLoss(found.cost * quantity);
    }
  };

  const handleQuantityChange = (newQty: number) => {
    const qty = Math.max(1, newQty);
    setQuantity(qty);
    setEstimatedLoss(unitCost * qty);
  };

  const handleUnitCostChange = (newCost: number) => {
    const cost = Math.max(0, newCost);
    setUnitCost(cost);
    setEstimatedLoss(cost * quantity);
  };

  // Open Log Modal
  const openCreateModal = () => {
    setEditingIncident(null);
    setIncidentType('Suspected Theft / Shoplifting');
    setSeverity('Medium');
    setStatus('Pending Review');
    const firstProd = products[0];
    if (firstProd) {
      setSelectedProductId(firstProd.id);
      setCustomSku(firstProd.sku);
      setCustomProductName(firstProd.name);
      setCustomCategory(firstProd.category);
      setUnitCost(firstProd.cost);
      setUnitPrice(firstProd.price);
      setEstimatedLoss(firstProd.cost * 1);
    }
    setQuantity(1);
    const now = new Date();
    setOccurredDate(now.toISOString().slice(0, 10));
    setOccurredTime(now.toTimeString().slice(0, 5));
    setLoggedBy('Marcus Vance (Store Manager)');
    setLocation('Fitting Rooms Zone B');
    setNotes('');
    setCctvReviewed(false);
    setCctvFootageRef('');
    policeReportFiled && setPoliceReportFiled(false);
    setPoliceReportNumber('');
    setActionTaken('');
    setDeductFromStock(true);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (inc: LossIncident) => {
    setEditingIncident(inc);
    setIncidentType(inc.incidentType);
    setSeverity(inc.severity);
    setStatus(inc.status);
    setSelectedProductId(inc.productId || 'custom');
    setCustomSku(inc.sku);
    setCustomProductName(inc.productName);
    setCustomCategory((inc.category as Product['category']) || 'Footwear');
    setQuantity(inc.quantity);
    setUnitCost(inc.unitCost);
    setUnitPrice(inc.unitPrice);
    setEstimatedLoss(inc.estimatedFinancialLoss);

    // Split timestamp
    const parts = inc.occurredAt.split(' ');
    setOccurredDate(parts[0] || new Date().toISOString().slice(0, 10));
    setOccurredTime(parts[1] || '12:00');

    setLoggedBy(inc.loggedBy);
    setLocation(inc.location);
    setNotes(inc.notes);
    setCctvReviewed(inc.cctvReviewed);
    setCctvFootageRef(inc.cctvFootageRef || '');
    setPoliceReportFiled(inc.policeReportFiled);
    setPoliceReportNumber(inc.policeReportNumber || '');
    setActionTaken(inc.actionTaken);
    setDeductFromStock(false); // don't double deduct on edit
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleSubmitIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim() || !customProductName.trim()) return;

    const timestampStr = `${occurredDate} ${occurredTime}`;

    if (editingIncident) {
      onUpdateLossIncident({
        ...editingIncident,
        incidentType,
        severity,
        status,
        productId: selectedProductId !== 'custom' ? selectedProductId : undefined,
        sku: customSku,
        productName: customProductName,
        category: customCategory,
        quantity,
        unitCost,
        unitPrice,
        estimatedFinancialLoss: estimatedLoss,
        occurredAt: timestampStr,
        loggedBy,
        location,
        notes,
        cctvReviewed,
        cctvFootageRef: cctvReviewed ? cctvFootageRef : undefined,
        policeReportFiled,
        policeReportNumber: policeReportFiled ? policeReportNumber : undefined,
        actionTaken
      });
      setSuccessToast(`Incident ${editingIncident.incidentNumber} updated successfully.`);
    } else {
      // Deduct stock if requested to preserve financial integrity
      if (deductFromStock && selectedProductId && selectedProductId !== 'custom') {
        onAdjustStock(selectedProductId, -quantity, 0);
      }

      onAddLossIncident({
        incidentType,
        severity,
        status,
        productId: selectedProductId !== 'custom' ? selectedProductId : undefined,
        sku: customSku,
        productName: customProductName,
        category: customCategory,
        quantity,
        unitCost,
        unitPrice,
        estimatedFinancialLoss: estimatedLoss,
        occurredAt: timestampStr,
        loggedBy,
        location,
        notes,
        cctvReviewed,
        cctvFootageRef: cctvReviewed ? cctvFootageRef : undefined,
        policeReportFiled,
        policeReportNumber: policeReportFiled ? policeReportNumber : undefined,
        actionTaken,
        deductedFromFloorStock: deductFromStock && selectedProductId !== 'custom'
      });
      setSuccessToast(`New Loss Prevention incident logged (${incidentType}).`);
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Quick Status Update
  const handleQuickStatusChange = (incident: LossIncident, newStatus: LossIncidentStatus) => {
    onUpdateLossIncident({
      ...incident,
      status: newStatus
    });
    setSuccessToast(`Incident ${incident.incidentNumber} status changed to ${newStatus}.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Export CSV for Loss Prevention Audits
  const handleExportCSV = () => {
    const headers = [
      'Incident Number',
      'Incident Type',
      'Severity',
      'Status',
      'Timestamp',
      'SKU',
      'Product Name',
      'Category',
      'Quantity',
      'Unit Cost ($)',
      'Unit Price ($)',
      'Financial Loss Write-Off ($)',
      'Location in Store',
      'Logged By',
      'CCTV Footage Reviewed',
      'CCTV Ref',
      'Police Report Filed',
      'Police Report Number',
      'Stock Floor Deducted',
      'Action Taken / Resolution',
      'Incident Notes / Details'
    ];

    const rows = filteredIncidents.map(inc => [
      `"${inc.incidentNumber}"`,
      `"${inc.incidentType}"`,
      `"${inc.severity}"`,
      `"${inc.status}"`,
      `"${inc.occurredAt}"`,
      `"${inc.sku}"`,
      `"${inc.productName.replace(/"/g, '""')}"`,
      `"${inc.category}"`,
      inc.quantity,
      inc.unitCost,
      inc.unitPrice,
      inc.estimatedFinancialLoss,
      `"${inc.location}"`,
      `"${inc.loggedBy}"`,
      inc.cctvReviewed ? 'YES' : 'NO',
      `"${inc.cctvFootageRef || 'N/A'}"`,
      inc.policeReportFiled ? 'YES' : 'NO',
      `"${inc.policeReportNumber || 'N/A'}"`,
      inc.deductedFromFloorStock ? 'YES' : 'NO',
      `"${(inc.actionTaken || '').replace(/"/g, '""')}"`,
      `"${(inc.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `apex_loss_prevention_audit_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSuccessToast('Loss Prevention Audit CSV report generated and downloaded.');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // KPIs
  const totalFinancialLoss = lossIncidents
    .filter(i => i.status !== 'Recovered / Closed')
    .reduce((sum, i) => sum + i.estimatedFinancialLoss, 0);

  const totalRecoveredLoss = lossIncidents
    .filter(i => i.status === 'Recovered / Closed')
    .reduce((sum, i) => sum + (i.unitCost * i.quantity), 0);

  const openInvestigationsCount = lossIncidents
    .filter(i => i.status === 'Under Investigation' || i.status === 'Pending Review')
    .length;

  const totalDamagedItemsCount = lossIncidents
    .filter(i => i.incidentType.includes('Damaged') || i.incidentType.includes('Wear'))
    .reduce((sum, i) => sum + i.quantity, 0);

  const totalTheftIncidentsCount = lossIncidents
    .filter(i => i.incidentType.includes('Theft'))
    .length;

  // Filtered and Sorted Incidents
  const filteredIncidents = useMemo(() => {
    return lossIncidents
      .filter(inc => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchNumber = inc.incidentNumber.toLowerCase().includes(q);
          const matchSku = inc.sku.toLowerCase().includes(q);
          const matchName = inc.productName.toLowerCase().includes(q);
          const matchNotes = inc.notes.toLowerCase().includes(q);
          const matchLocation = inc.location.toLowerCase().includes(q);
          const matchReporter = inc.loggedBy.toLowerCase().includes(q);
          if (!matchNumber && !matchSku && !matchName && !matchNotes && !matchLocation && !matchReporter) {
            return false;
          }
        }
        // Filter Type
        if (filterType !== 'All' && inc.incidentType !== filterType) {
          return false;
        }
        // Filter Severity
        if (filterSeverity !== 'All' && inc.severity !== filterSeverity) {
          return false;
        }
        // Filter Status
        if (filterStatus !== 'All' && inc.status !== filterStatus) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime();
        }
        if (sortBy === 'loss-desc') {
          return b.estimatedFinancialLoss - a.estimatedFinancialLoss;
        }
        if (sortBy === 'loss-asc') {
          return a.estimatedFinancialLoss - b.estimatedFinancialLoss;
        }
        return 0;
      });
  }, [lossIncidents, searchQuery, filterType, filterSeverity, filterStatus, sortBy]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-3 text-xs shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner: Financial Integrity & Risk Overview */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-52 h-52 rounded-full bg-amber-500/10 pointer-events-none blur-2xl" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Loss Prevention & Shrinkage Control</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">
              Store Financial Integrity & Asset Protection
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time audit log of inventory shrinkage, damaged goods write-offs, and suspected theft incidents. Protect store gross margins, synchronize book-to-floor inventory balance, and file verifiable loss claims.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              id="export-lp-audit-btn"
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors shadow-xs"
              title="Download formal CSV Audit file for store risk management & insurance documentation"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export LP Audit CSV</span>
            </button>

            <button
              id="log-loss-incident-btn"
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Log Loss Incident</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Integrity KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Financial Shrinkage */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unrecovered Loss</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-2">${totalFinancialLoss.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Cost valuation</span>
            <span>• 0.42% of live stock</span>
          </div>
        </div>

        {/* Active Investigations */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Investigations</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{openInvestigationsCount} Active</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-700 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Requires manager or LP review</span>
          </div>
        </div>

        {/* Damages Logged */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Damaged / Written-Off</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <PackageX className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalDamagedItemsCount} Units</p>
          <p className="text-xs text-slate-500 mt-1">Vendor claims & unboxing damages</p>
        </div>

        {/* Theft & Shoplifting Incidents */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Theft Incidents & Saved</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalTheftIncidentsCount} Logged</p>
          <p className="text-xs text-emerald-700 font-medium mt-1">
            +${totalRecoveredLoss.toLocaleString()} recovered by MOD
          </p>
        </div>
      </div>

      {/* Control Bar: Filters, Search & View Options */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="lp-search-input"
              type="text"
              placeholder="Search by incident #, SKU, product name, location, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="loss-desc">Highest Loss Amount</option>
              <option value="loss-asc">Lowest Loss Amount</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider mr-1">Filter By:</span>
          
          {/* Incident Type Dropdown */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 text-xs"
          >
            <option value="All">All Incident Types</option>
            <option value="Suspected Theft / Shoplifting">Suspected Theft / Shoplifting</option>
            <option value="Damaged Goods / Packaging">Damaged Goods / Packaging</option>
            <option value="Floor Display Wear & Tear">Floor Display Wear & Tear</option>
            <option value="Unexplained Shrinkage / Inventory Discrepancy">Unexplained Shrinkage</option>
            <option value="Internal Processing Discrepancy">Internal Discrepancy</option>
          </select>

          {/* Severity Dropdown */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 text-xs"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 text-xs"
          >
            <option value="All">All Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Write-Off Approved">Write-Off Approved</option>
            <option value="Recovered / Closed">Recovered / Closed</option>
          </select>

          {(filterType !== 'All' || filterSeverity !== 'All' || filterStatus !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setFilterType('All');
                setFilterSeverity('All');
                setFilterStatus('All');
                setSearchQuery('');
              }}
              className="text-xs text-amber-700 hover:text-amber-900 font-semibold px-2 py-1 rounded-lg hover:bg-amber-50"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Incident Records Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>Loss Prevention Incident Ledger</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {filteredIncidents.length} {filteredIncidents.length === 1 ? 'Record' : 'Records'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any record to inspect detailed CCTV timestamps, notes, and police documentation.
            </p>
          </div>
        </div>

        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Loss Incidents Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No shrinkage, damaged goods, or suspected theft records match the current filter selection.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 mt-2"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Log New Incident</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Incident & Date</th>
                  <th className="py-3 px-4">Type & Severity</th>
                  <th className="py-3 px-4">Merchandise / SKU</th>
                  <th className="py-3 px-4">Financial Loss</th>
                  <th className="py-3 px-4">Location & Reporter</th>
                  <th className="py-3 px-4">Evidence / Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncidents.map((inc) => {
                  return (
                    <tr 
                      key={inc.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => setViewingDetailIncident(inc)}
                    >
                      {/* Incident & Date */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{inc.incidentNumber}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{inc.occurredAt}</span>
                        </div>
                      </td>

                      {/* Type & Severity */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          {inc.incidentType.includes('Theft') ? (
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          ) : inc.incidentType.includes('Damaged') ? (
                            <PackageX className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          ) : inc.incidentType.includes('Shrinkage') ? (
                            <AlertOctagon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          )}
                          <span className="truncate max-w-[150px]" title={inc.incidentType}>
                            {inc.incidentType}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            inc.severity === 'Critical'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : inc.severity === 'High'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : inc.severity === 'Medium'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {inc.severity}
                          </span>
                        </div>
                      </td>

                      {/* Merchandise */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 max-w-[180px] truncate" title={inc.productName}>
                          {inc.productName}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono">{inc.sku}</span>
                          <span>• {inc.quantity} {inc.quantity === 1 ? 'unit' : 'units'}</span>
                        </div>
                      </td>

                      {/* Financial Loss */}
                      <td className="py-3 px-4">
                        <div className={`font-bold ${inc.estimatedFinancialLoss > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                          ${inc.estimatedFinancialLoss.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Cost: ${inc.unitCost} / Retail: ${inc.unitPrice}
                        </div>
                      </td>

                      {/* Location & Reporter */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-800 font-medium truncate max-w-[170px]" title={inc.location}>
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{inc.location}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[170px] mt-0.5">
                          By: {inc.loggedBy.split('(')[0]}
                        </div>
                      </td>

                      {/* Evidence & Status */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          <select
                            value={inc.status}
                            onChange={(e) => handleQuickStatusChange(inc, e.target.value as LossIncidentStatus)}
                            className={`text-[11px] font-bold rounded-lg px-2 py-1 border transition-colors ${
                              inc.status === 'Write-Off Approved'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : inc.status === 'Recovered / Closed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : inc.status === 'Under Investigation'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            <option value="Pending Review">Pending Review</option>
                            <option value="Under Investigation">Under Investigation</option>
                            <option value="Write-Off Approved">Write-Off Approved</option>
                            <option value="Recovered / Closed">Recovered / Closed</option>
                          </select>

                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            {inc.cctvReviewed && (
                              <span className="inline-flex items-center gap-0.5 text-blue-700 font-medium" title="CCTV footage archived">
                                <Camera className="w-3 h-3" />
                                <span>CCTV</span>
                              </span>
                            )}
                            {inc.policeReportFiled && (
                              <span className="inline-flex items-center gap-0.5 text-purple-700 font-medium" title={`Police Report #${inc.policeReportNumber}`}>
                                <FileText className="w-3 h-3" />
                                <span>Police</span>
                              </span>
                            )}
                            {inc.deductedFromFloorStock && (
                              <span className="inline-flex items-center gap-0.5 text-emerald-700 font-medium" title="Stock ledger adjusted">
                                <Check className="w-3 h-3" />
                                <span>Stock Adjusted</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingDetailIncident(inc)}
                            title="View Full Incident Report"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(inc)}
                            title="Edit Incident Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete incident record ${inc.incidentNumber}?`)) {
                                onDeleteLossIncident(inc.id);
                                setSuccessToast(`Incident ${inc.incidentNumber} deleted.`);
                                setTimeout(() => setSuccessToast(null), 3000);
                              }
                            }}
                            title="Delete Incident Record"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Loss Prevention Store Policies & Operational Integrity Guide */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Retail Financial Integrity & Shrinkage Mitigation Protocols
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              1. Fitting Room Control & EAS
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Maximum 4 garments permitted per stall. All footwear high-theft display samples must retain magnetic cable tags tethered to slat-wall brackets.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <PackageX className="w-3.5 h-3.5 text-amber-600" />
              2. Freight Damages & Credit Claims
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              All damaged cartons must be photographed prior to unloading. Inbound claims logged within 24 hours receive 100% vendor credit reimbursement.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              3. MOD Floor Leadership Deterrence
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Scheduled Manager On Duty (MOD) maintains continuous high-visibility presence at front entrance gondolas and high-velocity accessories zones.
            </p>
          </div>
        </div>
      </div>

      {/* Incident Detail View Modal */}
      {viewingDetailIncident && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">
                    Incident Report: {viewingDetailIncident.incidentNumber}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    viewingDetailIncident.severity === 'Critical'
                      ? 'bg-rose-100 text-rose-800'
                      : viewingDetailIncident.severity === 'High'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {viewingDetailIncident.severity} Severity
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Logged on {viewingDetailIncident.occurredAt} by {viewingDetailIncident.loggedBy}
                </p>
              </div>
              <button
                onClick={() => setViewingDetailIncident(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500">Incident Category</span>
                <p className="font-bold text-slate-900 text-xs">{viewingDetailIncident.incidentType}</p>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {viewingDetailIncident.location}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500">Financial Write-Off</span>
                <p className="font-bold text-rose-700 text-sm">
                  ${viewingDetailIncident.estimatedFinancialLoss.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-500">
                  {viewingDetailIncident.quantity}x @ ${viewingDetailIncident.unitCost} cost (${viewingDetailIncident.unitPrice} retail)
                </span>
              </div>
            </div>

            {/* Merchandise details */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Affected Inventory SKU
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{viewingDetailIncident.productName}</p>
                  <p className="font-mono text-[11px] text-slate-500">
                    SKU: {viewingDetailIncident.sku} • Category: {viewingDetailIncident.category}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                  viewingDetailIncident.deductedFromFloorStock
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {viewingDetailIncident.deductedFromFloorStock ? 'Deducted from Stock' : 'Stock Not Deducted'}
                </span>
              </div>
            </div>

            {/* Detailed Notes */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-700 block">Incident Observations & Narrative:</span>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed text-xs">
                {viewingDetailIncident.notes}
              </div>
            </div>

            {/* Corrective Action Taken */}
            {viewingDetailIncident.actionTaken && (
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-700 block">Corrective Action Taken & Prevention:</span>
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 text-emerald-900 text-xs">
                  {viewingDetailIncident.actionTaken}
                </div>
              </div>
            )}

            {/* Security & Evidence Badges */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className={`p-3 rounded-xl border ${viewingDetailIncident.cctvReviewed ? 'bg-blue-50/50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <div className="flex items-center gap-1.5 font-bold">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>CCTV Footage</span>
                </div>
                <p className="text-[11px] mt-1">
                  {viewingDetailIncident.cctvReviewed ? `Archived clip: ${viewingDetailIncident.cctvFootageRef || 'Available'}` : 'No CCTV footage tagged'}
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${viewingDetailIncident.policeReportFiled ? 'bg-purple-50/50 border-purple-200 text-purple-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <div className="flex items-center gap-1.5 font-bold">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>Police Report</span>
                </div>
                <p className="text-[11px] mt-1">
                  {viewingDetailIncident.policeReportFiled ? `Case ref: ${viewingDetailIncident.policeReportNumber || 'Filed'}` : 'Not filed with authorities'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  const inc = viewingDetailIncident;
                  setViewingDetailIncident(null);
                  openEditModal(inc);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Incident</span>
              </button>

              <button
                onClick={() => setViewingDetailIncident(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log / Edit Incident Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingIncident ? `Edit Incident ${editingIncident.incidentNumber}` : 'Log Loss Prevention Incident'}
                </h3>
                <p className="text-xs text-slate-500">
                  Record shrinkage, item damage, or suspected theft with timestamps and notes.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitIncident} className="space-y-4">
              {/* Top Row: Type & Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Incident Classification *</label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value as LossIncidentType)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                  >
                    <option value="Suspected Theft / Shoplifting">Suspected Theft / Shoplifting</option>
                    <option value="Damaged Goods / Packaging">Damaged Goods / Packaging</option>
                    <option value="Floor Display Wear & Tear">Floor Display Wear & Tear</option>
                    <option value="Unexplained Shrinkage / Inventory Discrepancy">Unexplained Shrinkage</option>
                    <option value="Internal Processing Discrepancy">Internal Processing Discrepancy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Severity Rating</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as LossIncidentSeverity)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                  >
                    <option value="Low">Low (Under $50 / Cosmetic Display)</option>
                    <option value="Medium">Medium ($50 - $150 / Standard Write-Off)</option>
                    <option value="High">High ($150 - $400 / High-Heat Footwear)</option>
                    <option value="Critical">Critical ($400+ or Repeated Pattern)</option>
                  </select>
                </div>
              </div>

              {/* Product Selection */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Affected Store Inventory Product *</label>
                  <span className="text-[11px] text-slate-500">Auto-populates cost & valuation</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) — Cost: ${p.cost} | Retail: ${p.price} | Stock: {p.storeStock} on floor
                        </option>
                      ))}
                      <option value="custom">Other / Custom Asset Not In Catalogue</option>
                    </select>
                  </div>

                  {selectedProductId === 'custom' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Custom SKU</label>
                        <input
                          type="text"
                          value={customSku}
                          onChange={(e) => setCustomSku(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Item Description</label>
                        <input
                          type="text"
                          value={customProductName}
                          onChange={(e) => setCustomProductName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Financial Quantities */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200/80">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Quantity Lost / Damaged</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Unit Cost ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={unitCost}
                      onChange={(e) => handleUnitCostChange(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-rose-700 mb-1">Total Loss Write-Off ($)</label>
                    <div className="w-full px-3 py-1.5 text-xs rounded-xl border border-rose-200 bg-rose-50 font-bold text-rose-800">
                      ${estimatedLoss.toLocaleString()}
                    </div>
                  </div>
                </div>

                {!editingIncident && selectedProductId !== 'custom' && (
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={deductFromStock}
                        onChange={(e) => setDeductFromStock(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        Automatically deduct {quantity} unit{quantity > 1 ? 's' : ''} from live store inventory
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-500 pl-6 mt-0.5">
                      Ensures book-to-floor count parity and eliminates phantom stock on customer kiosks.
                    </p>
                  </div>
                )}
              </div>

              {/* Timestamp & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date Occurred *</label>
                  <input
                    type="date"
                    required
                    value={occurredDate}
                    onChange={(e) => setOccurredDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Time (Approx) *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        setOccurredTime(now.toTimeString().slice(0, 5));
                      }}
                      className="text-[10px] text-amber-700 font-bold hover:underline"
                    >
                      Set Now
                    </button>
                  </div>
                  <input
                    type="time"
                    required
                    value={occurredTime}
                    onChange={(e) => setOccurredTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Logged By Manager *</label>
                  <input
                    type="text"
                    required
                    value={loggedBy}
                    onChange={(e) => setLoggedBy(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Store Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location In Store *</label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Fitting Rooms Zone B, Main Entrance Pedestal"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-500">Quick Select:</span>
                    {COMMON_LOCATIONS.slice(0, 4).map(loc => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setLocation(loc)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
                      >
                        {loc.split(' - ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Notes & Observations */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Incident Narrative & Observations *
                </label>
                <textarea
                  required
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide precise timestamp details, suspect description, removed EAS tag location, damage nature, or unboxing evidence..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Actions & Follow-up */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Corrective Action Taken</label>
                <input
                  type="text"
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="e.g. Inbound vendor claim logged, security cameras reviewed, tags recalibrated"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              {/* CCTV & Police Report Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cctvReviewed}
                      onChange={(e) => setCctvReviewed(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-800">Security CCTV Footage Reviewed</span>
                  </label>
                  {cctvReviewed && (
                    <input
                      type="text"
                      placeholder="CCTV Camera & Clip Ref (e.g. CAM-04-1745)"
                      value={cctvFootageRef}
                      onChange={(e) => setCctvFootageRef(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policeReportFiled}
                      onChange={(e) => setPoliceReportFiled(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-800">Police Report Filed</span>
                  </label>
                  {policeReportFiled && (
                    <input
                      type="text"
                      placeholder="Police Report Number (e.g. PD-2026-88412)"
                      value={policeReportNumber}
                      onChange={(e) => setPoliceReportNumber(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="submit-loss-incident-btn"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  {editingIncident ? 'Update Incident Record' : 'Log Loss Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
