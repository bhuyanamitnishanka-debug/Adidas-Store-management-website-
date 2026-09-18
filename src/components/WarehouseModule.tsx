import React, { useState } from 'react';
import { 
  Warehouse, 
  Truck, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  MapPin, 
  AlertCircle, 
  Boxes,
  ShieldCheck,
  Building2,
  Check
} from 'lucide-react';
import { WarehouseItem, StockTransfer, Product } from '../types';

interface WarehouseModuleProps {
  warehouseItems: WarehouseItem[];
  transfers: StockTransfer[];
  products: Product[];
  onCreateTransfer: (newTransfer: Omit<StockTransfer, 'id' | 'transferNumber' | 'status' | 'sameDayDeliveryMet'>) => void;
  onReceiveTransfer: (transferId: string) => void;
}

export const WarehouseModule: React.FC<WarehouseModuleProps> = ({
  warehouseItems,
  transfers,
  products,
  onCreateTransfer,
  onReceiveTransfer
}) => {
  const [activeTab, setActiveTab] = useState<'transfers' | 'warehouse-stock' | 'multi-location'>('transfers');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Form State for New Transfer
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || '');
  const [transferQty, setTransferQty] = useState(20);
  const [priority, setPriority] = useState<StockTransfer['priority']>('Standard');

  const handleCreateTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.sku === selectedSku);
    if (!product) return;

    onCreateTransfer({
      sku: product.sku,
      productName: product.name,
      quantity: Number(transferQty),
      fromLocation: 'Central Regional DC (DC-West)',
      toLocation: 'Store #104 - Metro Flagship',
      requestedBy: 'Marcus Sterling (Store Manager)',
      priority
    });

    setIsTransferModalOpen(false);
  };

  // Filtered Warehouse Items
  const filteredWarehouseItems = warehouseItems.filter(item => 
    item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.bayLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Same-Day Delivery Compliance Policy */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              Central DC Logistics & Inbound Delivery
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium px-2 py-0.5 rounded-full">
              Same-Day Processing Mandate
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-100">
            Ensure merchandise deliveries are processed on the day they arrive, making the product offer immediately accessible on sales floor.
          </p>
        </div>

        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Request Inbound Transfer</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'transfers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Active Transfers & Receiving ({transfers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('warehouse-stock')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'warehouse-stock'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Warehouse className="w-4 h-4" />
          <span>Central DC Inventory Tracker</span>
        </button>

        <button
          onClick={() => setActiveTab('multi-location')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'multi-location'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Cross-Location Stock Matrix</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE TRANSFERS & RECEIVING */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">In Transit Shipments</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {transfers.filter(t => t.status === 'In Transit').length} Loads
              </p>
              <p className="text-xs text-blue-600 mt-1">Trucks en route to Store #104 dock</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Pending Dispatch at DC</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {transfers.filter(t => t.status === 'Pending Dispatch').length} Orders
              </p>
              <p className="text-xs text-amber-600 mt-1">Picking in progress at Central DC</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Same-Day Delivery Success</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">100%</p>
              <p className="text-xs text-slate-500 mt-1">Zero stockroom backlog</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Store Inbound Manifests & Receiving</h3>
                <p className="text-xs text-slate-500">Verify quantities upon dock delivery to update store stock</p>
              </div>
              <span className="text-xs text-slate-500 font-medium">Doc: SOP-LOG-04</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                    <th className="py-3 px-4">Transfer #</th>
                    <th className="py-3 px-4">Item & SKU</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Inbound Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transfers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-slate-900">{t.transferNumber}</span>
                        <p className="text-[11px] text-slate-400">Req by: {t.requestedBy.split(' ')[0]}</p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900">{t.productName}</span>
                        <p className="text-xs font-mono text-slate-500">{t.sku}</p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">{t.quantity} units</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-xs text-slate-600">
                          <span>{t.fromLocation.split(' ')[0]} DC</span>
                          <span className="mx-1 text-slate-400">→</span>
                          <span className="font-semibold text-slate-800">Store Floor</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          t.priority.includes('Urgent')
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {t.priority}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          t.status === 'Received & Verified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : t.status === 'In Transit'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {t.status === 'Received & Verified' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {t.status === 'In Transit' && <Truck className="w-3.5 h-3.5" />}
                          {t.status === 'Pending Dispatch' && <Clock className="w-3.5 h-3.5" />}
                          <span>{t.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {t.status !== 'Received & Verified' ? (
                          <button
                            onClick={() => onReceiveTransfer(t.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-2xs"
                          >
                            Receive & Stock Floor
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 flex items-center justify-end gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-500" /> Stock Available
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CENTRAL DC INVENTORY TRACKER */}
      {activeTab === 'warehouse-stock' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Central DC by product, SKU, or bay rack location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-900">{filteredWarehouseItems.length}</span> warehouse lots
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                    <th className="py-3 px-4">Item & SKU</th>
                    <th className="py-3 px-4">Bay Location</th>
                    <th className="py-3 px-4">Pallet & Batch</th>
                    <th className="py-3 px-4">Warehouse Total</th>
                    <th className="py-3 px-4">Allocated</th>
                    <th className="py-3 px-4">Available to Pull</th>
                    <th className="py-3 px-4 text-right">Last Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWarehouseItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900">{item.productName}</span>
                        <div className="text-xs font-mono text-slate-500">{item.sku}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-700 font-mono text-xs font-medium bg-slate-100 px-2 py-1 rounded w-fit">
                          <MapPin className="w-3 h-3 text-amber-500" />
                          <span>{item.bayLocation}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-xs text-slate-700">{item.palletId}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{item.batchNumber}</div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {item.warehouseQty}
                      </td>

                      <td className="py-3 px-4 text-amber-600 font-medium">
                        {item.allocatedQty}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-600">{item.availableQty} units</span>
                      </td>

                      <td className="py-3 px-4 text-right text-xs text-slate-500">
                        {item.lastAudited}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CROSS-LOCATION STOCK MATRIX */}
      {activeTab === 'multi-location' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Integrated Multi-Location Inventory Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Live omnichannel view connecting Central DC, Store Sales Floor, and Store Stockroom
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4 text-center">Store Sales Floor</th>
                  <th className="py-3 px-4 text-center">Store Backroom</th>
                  <th className="py-3 px-4 text-center">In Transit</th>
                  <th className="py-3 px-4 text-center">Central DC Warehouse</th>
                  <th className="py-3 px-4 text-right">Total Network Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const wh = warehouseItems.find(w => w.sku === p.sku);
                  const inTransitQty = transfers
                    .filter(t => t.sku === p.sku && t.status === 'In Transit')
                    .reduce((sum, t) => sum + t.quantity, 0);
                  const dcQty = wh ? wh.availableQty : 0;
                  const totalNetwork = p.storeStock + p.stockroomStock + inTransitQty + dcQty;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900">{p.name}</span>
                        <div className="text-xs font-mono text-slate-500">{p.sku}</div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          p.storeStock === 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {p.storeStock}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center text-slate-700 font-medium">
                        {p.stockroomStock}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {inTransitQty > 0 ? (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            +{inTransitQty}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center text-slate-700 font-medium">
                        {dcQty}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {totalNetwork} Units
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transfer Request Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Request Stock Transfer to Store</h3>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Select Product *</label>
                <select
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.sku}>
                      {p.name} ({p.sku}) - Floor: {p.storeStock}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Transfer Quantity (Units) *</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Transfer Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as StockTransfer['priority'])}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="Standard">Standard Scheduled Route</option>
                  <option value="Urgent - Floor Depleted">Urgent - Floor Depleted (Same-Day Expedited)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Dispatch Route:</span> Central Regional DC (Bay Area) → Store #104 Dock. Inbound receiving log will trigger upon arrival.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  Submit Inbound Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
