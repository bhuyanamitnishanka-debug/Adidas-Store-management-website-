export type ModuleType = 
  | 'dashboard'
  | 'inventory'
  | 'warehouse'
  | 'store-design'
  | 'employment'
  | 'crm';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'Footwear' | 'Apparel' | 'Equipment' | 'Accessories';
  brand: string;
  price: number;
  cost: number;
  storeStock: number;
  stockroomStock: number;
  minThreshold: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  salesHistory: {
    date: string;
    units: number;
    revenue: number;
  }[];
  lastRestocked: string;
}

export interface WarehouseItem {
  id: string;
  sku: string;
  productName: string;
  category: string;
  warehouseQty: number;
  allocatedQty: number;
  availableQty: number;
  bayLocation: string; // e.g., A-12-04
  palletId: string;
  batchNumber: string;
  lastAudited: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  sku: string;
  productName: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  status: 'Pending Dispatch' | 'In Transit' | 'Received & Verified' | 'Flagged Discrepancy';
  requestedBy: string;
  dispatchedAt?: string;
  receivedAt?: string;
  sameDayDeliveryMet: boolean;
  priority: 'Standard' | 'Urgent - Floor Depleted';
}

export interface Employee {
  id: string;
  name: string;
  role: 'Store Manager' | 'Assistant Manager' | 'Floor Lead' | 'Sales Specialist' | 'Visual Merchandiser' | 'Inventory Stockist';
  department: 'Sales Floor' | 'Backroom & Logistics' | 'Visual Merchandising' | 'Cashier & Customer Service';
  email: string;
  phone: string;
  hireDate: string;
  status: 'Active' | 'On Leave' | 'Off Duty';
  isManagerQualified: boolean;
  salesPerHour: number; // e.g. $185/hr
  conversionRate: number; // e.g. 14.2%
  trainingCompleted: {
    foundationalBrand: boolean;
    seasonalBrandKnowledge: boolean;
    lossPrevention: boolean;
    cashRegisterIntegrity: boolean;
  };
  performanceScore: number; // 0 - 100
  recentFeedback: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  zone: 'Sales Floor - Footwear' | 'Sales Floor - Apparel' | 'Cash Desk' | 'Stockroom / Receiving' | 'Visual Merchandising';
  isManagerOnDuty: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Vacation' | 'Sick Leave' | 'Personal' | 'Training';
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Declined';
  reason: string;
  submittedDate: string;
}

export interface VMDirective {
  id: string;
  title: string;
  area: 'Store Front Window' | 'Main Entrance Gondola' | 'Performance Running Zone' | 'Lifestyle Apparel Wall' | 'Cash Wrap Accessories';
  type: 'Exterior' | 'Interior';
  seasonCampaign: 'Autumn Sport High-Velocity 2026' | 'Urban Motion Lifestyle' | 'Marathon Readiness Expo';
  guidelineNotes: string;
  status: 'Compliant' | 'Needs Attention' | 'Scheduled Refresh';
  lastInspected: string;
  inspector: string;
  complianceScore: number; // e.g. 96%
  keyActions: string[];
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: 'VIP Platinum' | 'Gold Runner' | 'Silver Club' | 'Standard Member';
  lifetimeValue: number;
  totalOrders: number;
  preferredCategory: 'Running' | 'Basketball' | 'Training' | 'Streetwear';
  lastVisit: string;
  notes: string;
  purchaseHistory: {
    date: string;
    items: string;
    amount: number;
  }[];
  npsScore: number;
}

export interface PriorYearSalesRecord {
  priorYearDate: string;
  priorYearRevenue: number;
  priorYearUnits: number;
  priorYearTransactions: number;
  categories: {
    Footwear: number;
    Apparel: number;
    Equipment: number;
    Accessories: number;
  };
}

export type LossIncidentType = 
  | 'Suspected Theft / Shoplifting'
  | 'Damaged Goods / Packaging'
  | 'Floor Display Wear & Tear'
  | 'Unexplained Shrinkage / Inventory Discrepancy'
  | 'Internal Processing Discrepancy';

export type LossIncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type LossIncidentStatus = 
  | 'Pending Review'
  | 'Under Investigation'
  | 'Write-Off Approved'
  | 'Recovered / Closed';

export interface LossIncident {
  id: string;
  incidentNumber: string;
  incidentType: LossIncidentType;
  severity: LossIncidentSeverity;
  status: LossIncidentStatus;
  productId?: string;
  sku: string;
  productName: string;
  category: Product['category'] | 'Multiple' | 'General Retail Asset';
  quantity: number;
  unitCost: number;
  unitPrice: number;
  estimatedFinancialLoss: number;
  occurredAt: string;
  loggedBy: string;
  location: string;
  notes: string;
  cctvReviewed: boolean;
  cctvFootageRef?: string;
  policeReportFiled: boolean;
  policeReportNumber?: string;
  actionTaken: string;
  deductedFromFloorStock: boolean;
}

