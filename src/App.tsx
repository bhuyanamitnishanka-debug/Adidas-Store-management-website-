import React, { useState } from 'react';
import { ModuleType, Product, WarehouseItem, StockTransfer, Employee, Shift, LeaveRequest, VMDirective, CustomerProfile, LossIncident } from './types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_WAREHOUSE_ITEMS, 
  INITIAL_TRANSFERS, 
  INITIAL_EMPLOYEES, 
  INITIAL_SHIFTS, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_VM_DIRECTIVES, 
  INITIAL_CUSTOMERS,
  INITIAL_LOSS_INCIDENTS
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardModule } from './components/DashboardModule';
import { InventoryModule } from './components/InventoryModule';
import { WarehouseModule } from './components/WarehouseModule';
import { StoreDesignModule } from './components/StoreDesignModule';
import { EmploymentModule } from './components/EmploymentModule';
import { CRMModule } from './components/CRMModule';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [currentModule, setCurrentModule] = useState<ModuleType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // App Domain State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>(INITIAL_WAREHOUSE_ITEMS);
  const [transfers, setTransfers] = useState<StockTransfer[]>(INITIAL_TRANSFERS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [directives, setDirectives] = useState<VMDirective[]>(INITIAL_VM_DIRECTIVES);
  const [customers, setCustomers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);
  const [lossIncidents, setLossIncidents] = useState<LossIncident[]>(INITIAL_LOSS_INCIDENTS);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // --- Inventory Handlers ---
  const handleAddProduct = (newProdData: Omit<Product, 'id' | 'salesHistory' | 'status' | 'lastRestocked'>) => {
    const totalStock = newProdData.storeStock + newProdData.stockroomStock;
    const status: Product['status'] = totalStock === 0 ? 'Out of Stock' : totalStock <= newProdData.minThreshold ? 'Low Stock' : 'In Stock';
    const newProduct: Product = {
      ...newProdData,
      id: `PRD-${Date.now()}`,
      status,
      lastRestocked: new Date().toISOString().split('T')[0],
      salesHistory: [
        { date: '2026-09-17', units: 0, revenue: 0 }
      ]
    };
    setProducts(prev => [newProduct, ...prev]);
    showToast(`Created new product catalogue item: ${newProduct.name}`);
  };

  const handleEditProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    showToast(`Updated product specifications: ${updated.name}`);
  };

  const handleDeleteProduct = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    if (prod) {
      showToast(`Removed product ${prod.name} from active inventory`);
    }
  };

  const handleAdjustStock = (productId: string, storeDelta: number, stockroomDelta: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const newStore = Math.max(0, p.storeStock + storeDelta);
      const newBack = Math.max(0, p.stockroomStock + stockroomDelta);
      const total = newStore + newBack;
      const status: Product['status'] = total === 0 ? 'Out of Stock' : total <= p.minThreshold ? 'Low Stock' : 'In Stock';
      return {
        ...p,
        storeStock: newStore,
        stockroomStock: newBack,
        status
      };
    }));
    showToast('Inventory floor stock updated successfully');
  };

  // --- Loss Prevention Handlers ---
  const handleAddLossIncident = (newIncidentData: Omit<LossIncident, 'id' | 'incidentNumber'>) => {
    const nextSeq = 39 + lossIncidents.length;
    const incident: LossIncident = {
      ...newIncidentData,
      id: `LP-INC-${Date.now()}`,
      incidentNumber: `LP-2026-0${nextSeq}`
    };
    setLossIncidents(prev => [incident, ...prev]);
    showToast(`Loss Prevention: Incident ${incident.incidentNumber} logged into audit ledger`);
  };

  const handleUpdateLossIncident = (updatedIncident: LossIncident) => {
    setLossIncidents(prev => prev.map(inc => inc.id === updatedIncident.id ? updatedIncident : inc));
    showToast(`Loss incident ${updatedIncident.incidentNumber} updated`);
  };

  const handleDeleteLossIncident = (incidentId: string) => {
    setLossIncidents(prev => prev.filter(inc => inc.id !== incidentId));
    showToast('Loss incident record removed from ledger');
  };

  // --- Warehouse & Transfer Handlers ---
  const handleCreateTransfer = (newTransfer: Omit<StockTransfer, 'id' | 'transferNumber' | 'status' | 'sameDayDeliveryMet'>) => {
    const transferItem: StockTransfer = {
      ...newTransfer,
      id: `TR-${Date.now()}`,
      transferNumber: `TRF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'In Transit',
      dispatchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sameDayDeliveryMet: true
    };
    setTransfers(prev => [transferItem, ...prev]);
    showToast(`Inbound DC Transfer ${transferItem.transferNumber} dispatched to store dock`);
  };

  const handleReceiveTransfer = (transferId: string) => {
    const tr = transfers.find(t => t.id === transferId);
    if (!tr) return;

    setTransfers(prev => prev.map(t => {
      if (t.id !== transferId) return t;
      return {
        ...t,
        status: 'Received & Verified',
        receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sameDayDeliveryMet: true
      };
    }));

    // Auto-update store stock
    setProducts(prev => prev.map(p => {
      if (p.sku === tr.sku) {
        const newStore = p.storeStock + tr.quantity;
        const total = newStore + p.stockroomStock;
        const status: Product['status'] = total === 0 ? 'Out of Stock' : total <= p.minThreshold ? 'Low Stock' : 'In Stock';
        return {
          ...p,
          storeStock: newStore,
          status,
          lastRestocked: '2026-09-18'
        };
      }
      return p;
    }));

    showToast(`Dock Inbound Verified: ${tr.quantity} units of ${tr.productName} stocked to sales floor`);
  };

  // --- Employment Handlers ---
  const handleAddShift = (newShiftData: Omit<Shift, 'id'>) => {
    const newShift: Shift = {
      ...newShiftData,
      id: `SH-${Date.now()}`
    };
    setShifts(prev => [...prev, newShift]);
    showToast(`Assigned shift for ${newShift.employeeName} on ${newShift.date} (${newShift.zone})`);
  };

  const handleUpdateShift = (updatedShift: Shift) => {
    setShifts(prev => prev.map(s => s.id === updatedShift.id ? updatedShift : s));
    showToast(`Shift updated for ${updatedShift.employeeName} (${updatedShift.date})`);
  };

  const handleDeleteShift = (shiftId: string) => {
    setShifts(prev => prev.filter(s => s.id !== shiftId));
    showToast('Shift removed from roster schedule');
  };

  const handleUpdateLeaveStatus = (leaveId: string, status: LeaveRequest['status']) => {
    setLeaveRequests(prev => prev.map(l => l.id === leaveId ? { ...l, status } : l));
    showToast(`Leave request updated: ${status}`);
  };

  const handleUpdateFeedback = (employeeId: string, feedback: string) => {
    setEmployees(prev => prev.map(e => e.id === employeeId ? { ...e, recentFeedback: feedback } : e));
    showToast('Staff coaching review feedback recorded');
  };

  // --- Visual Merchandising Handlers ---
  const handleToggleVMAction = (directiveId: string, actionIndex: number) => {
    // toggle checklist
  };

  const handleUpdateCompliance = (directiveId: string, status: VMDirective['status']) => {
    setDirectives(prev => prev.map(d => {
      if (d.id !== directiveId) return d;
      return {
        ...d,
        status,
        complianceScore: status === 'Compliant' ? 98 : 80
      };
    }));
    showToast(`Visual Merchandising zone status updated to: ${status}`);
  };

  // --- CRM Handlers ---
  const handleAddCustomer = (newCust: Omit<CustomerProfile, 'id' | 'purchaseHistory' | 'lifetimeValue' | 'totalOrders'>) => {
    const cust: CustomerProfile = {
      ...newCust,
      id: `CUST-${Date.now()}`,
      lifetimeValue: 0,
      totalOrders: 0,
      purchaseHistory: []
    };
    setCustomers(prev => [cust, ...prev]);
    showToast(`New VIP Loyalty Member registered: ${cust.name}`);
  };

  const handleUpdateCustomerNotes = (customerId: string, notes: string) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, notes } : c));
  };

  // Badges & Counters
  const lowStockCount = products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length;
  const pendingTransfersCount = transfers.filter(t => t.status !== 'Received & Verified').length;
  const pendingLeavesCount = leaveRequests.filter(l => l.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-md">
          <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold flex-1 leading-snug">{toastMessage}</p>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Sidebar */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        lowStockCount={lowStockCount}
        pendingTransfersCount={pendingTransfersCount}
        pendingLeavesCount={pendingLeavesCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header
          currentModule={currentModule}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          lowStockCount={lowStockCount}
          pendingTransfersCount={pendingTransfersCount}
          onQuickModuleSelect={setCurrentModule}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentModule === 'dashboard' && (
            <DashboardModule
              onNavigate={setCurrentModule}
              products={products}
              transfers={transfers}
              shifts={shifts}
              employees={employees}
              customers={customers}
            />
          )}

          {currentModule === 'inventory' && (
            <InventoryModule
              products={products}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onAdjustStock={handleAdjustStock}
              lossIncidents={lossIncidents}
              onAddLossIncident={handleAddLossIncident}
              onUpdateLossIncident={handleUpdateLossIncident}
              onDeleteLossIncident={handleDeleteLossIncident}
            />
          )}

          {currentModule === 'warehouse' && (
            <WarehouseModule
              warehouseItems={warehouseItems}
              transfers={transfers}
              products={products}
              onCreateTransfer={handleCreateTransfer}
              onReceiveTransfer={handleReceiveTransfer}
            />
          )}

          {currentModule === 'store-design' && (
            <StoreDesignModule
              directives={directives}
              onToggleAction={handleToggleVMAction}
              onUpdateCompliance={handleUpdateCompliance}
            />
          )}

          {currentModule === 'employment' && (
            <EmploymentModule
              employees={employees}
              shifts={shifts}
              leaveRequests={leaveRequests}
              onAddShift={handleAddShift}
              onUpdateShift={handleUpdateShift}
              onDeleteShift={handleDeleteShift}
              onUpdateLeaveStatus={handleUpdateLeaveStatus}
              onUpdateFeedback={handleUpdateFeedback}
            />
          )}

          {currentModule === 'crm' && (
            <CRMModule
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onUpdateNotes={handleUpdateCustomerNotes}
            />
          )}
        </main>
      </div>
    </div>
  );
}
